import { createHash, randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { AppDatabase } from '../db/database.js'
import { sessionCookieName } from '../auth/session.js'
import type { FileStorage } from '../storage/fileStorage.js'
import type { AuthService, AuthenticatedUser } from './auth.js'
import type { ProjectRepository } from './projects.js'

export const maximumFileSize = 50 * 1024 * 1024
const downloadLifetimeSeconds = 300

const allowedTypes = new Map<string, Set<string>>([
  ['.pdf', new Set(['application/pdf'])],
  ['.doc', new Set(['application/msword'])],
  ['.docx', new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])],
  ['.csv', new Set(['text/csv', 'application/csv', 'application/vnd.ms-excel'])],
  ['.xls', new Set(['application/vnd.ms-excel'])],
  ['.xlsx', new Set(['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])],
  ['.txt', new Set(['text/plain'])],
  ['.md', new Set(['text/markdown', 'text/plain'])],
  ['.jpg', new Set(['image/jpeg'])],
  ['.jpeg', new Set(['image/jpeg'])],
  ['.png', new Set(['image/png'])],
  ['.webp', new Set(['image/webp'])],
])

export interface FileAsset {
  id: string
  projectId: string
  logicalName: string
  filename: string
  version: number
  storageKey: string
  contentType: string
  size: number
  checksum: string
  uploadedAt: string
  uploaderName: string
  extractionStatus: string
}

interface FileAssetRow {
  id: string
  project_id: string
  logical_name: string
  filename: string
  version: number
  storage_key: string
  content_type: string
  size: number
  checksum: string
  created_at: string
  uploader_name: string
  task_status: string | null
}

function extractionStatus(taskStatus: string | null) {
  return ({
    QUEUED: '等待提取',
    RUNNING: '正在提取',
    COMPLETED: '提取完成',
    FAILED: '提取失败',
  } as Record<string, string>)[taskStatus ?? ''] ?? '待提取'
}

function toFileAsset(row: FileAssetRow): FileAsset {
  return {
    id: row.id,
    projectId: row.project_id,
    logicalName: row.logical_name,
    filename: row.filename,
    version: row.version,
    storageKey: row.storage_key,
    contentType: row.content_type,
    size: row.size,
    checksum: row.checksum,
    uploadedAt: row.created_at,
    uploaderName: row.uploader_name,
    extractionStatus: extractionStatus(row.task_status),
  }
}

const fileSelect = `
  SELECT f.*, u.display_name AS uploader_name,
    (SELECT t.status FROM ai_tasks t WHERE t.source_file_id = f.id ORDER BY t.created_at DESC LIMIT 1) AS task_status
  FROM file_assets f
  JOIN users u ON u.id = f.uploaded_by_id
`

export class SqliteFileRepository {
  constructor(private readonly database: AppDatabase) {}

  async list(projectId: string) {
    const rows = this.database.prepare(`
      ${fileSelect}
      WHERE f.project_id = ?
      ORDER BY f.created_at DESC, f.version DESC
    `).all(projectId) as unknown as FileAssetRow[]
    return rows.map(toFileAsset)
  }

  async get(projectId: string, fileId: string) {
    const row = this.database.prepare(`
      ${fileSelect}
      WHERE f.project_id = ? AND f.id = ?
    `).get(projectId, fileId) as unknown as FileAssetRow | undefined
    return row ? toFileAsset(row) : null
  }

  async getByStorageKey(storageKey: string) {
    const row = this.database.prepare(`
      ${fileSelect}
      WHERE f.storage_key = ?
    `).get(storageKey) as unknown as FileAssetRow | undefined
    return row ? toFileAsset(row) : null
  }

  async findDuplicate(projectId: string, checksum: string) {
    return Boolean(this.database.prepare(
      'SELECT 1 FROM file_assets WHERE project_id = ? AND checksum = ? LIMIT 1',
    ).get(projectId, checksum))
  }

  async nextVersion(projectId: string, logicalName: string) {
    const row = this.database.prepare(`
      SELECT COALESCE(MAX(version), 0) + 1 AS next_version
      FROM file_assets WHERE project_id = ? AND logical_name = ?
    `).get(projectId, logicalName) as { next_version: number }
    return row.next_version
  }

  async create(input: {
    id: string
    projectId: string
    logicalName: string
    filename: string
    version: number
    storageKey: string
    contentType: string
    size: number
    checksum: string
    actor: AuthenticatedUser
  }) {
    const now = new Date().toISOString()
    this.database.exec('BEGIN IMMEDIATE')
    try {
      this.database.prepare(`
        INSERT INTO file_assets (
          id, project_id, logical_name, filename, version, storage_key,
          content_type, size, checksum, status, uploaded_by_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPLOADED', ?, ?)
      `).run(
        input.id, input.projectId, input.logicalName, input.filename, input.version,
        input.storageKey, input.contentType, input.size, input.checksum, input.actor.id, now,
      )
      this.database.prepare(`
        INSERT INTO audit_events (
          id, project_id, actor_id, action, entity_type, entity_id, changed_fields_json, created_at
        ) VALUES (?, ?, ?, 'UPLOAD', 'FileAsset', ?, ?, ?)
      `).run(randomUUID(), input.projectId, input.actor.id, input.id, JSON.stringify([
        'filename', 'version', 'contentType', 'size', 'checksum',
      ]), now)
      this.database.prepare('UPDATE factory_projects SET updated_at = ? WHERE id = ?')
        .run(now, input.projectId)
      this.database.exec('COMMIT')
    } catch (error) {
      this.database.exec('ROLLBACK')
      throw error
    }
    return (await this.get(input.projectId, input.id))!
  }
}

async function authenticatedUser(
  request: FastifyRequest,
  reply: FastifyReply,
  authService: AuthService,
) {
  const token = request.cookies[sessionCookieName]
  const user = token ? await authService.getUserByRawToken(token) : null
  if (!user) {
    reply.code(401).send({ code: 'UNAUTHENTICATED', message: '请先登录' })
    return null
  }
  return user
}

function supportedFile(filename: string, contentType: string) {
  const extension = extname(filename).toLowerCase()
  return allowedTypes.get(extension)?.has(contentType.toLowerCase()) === true
}

function safeFilename(filename: string) {
  return basename(filename).normalize('NFKC').replace(/[^\p{L}\p{N}._-]+/gu, '-')
}

export async function registerFileRoutes(
  app: FastifyInstance,
  authService: AuthService,
  projectRepository: ProjectRepository,
  fileRepository: SqliteFileRepository,
  storage: FileStorage,
) {
  app.get<{ Params: { projectId: string } }>('/projects/:projectId/files', async (request, reply) => {
    const user = await authenticatedUser(request, reply, authService)
    if (!user) return
    const project = await projectRepository.getForUser(request.params.projectId, user)
    if (!project) return reply.code(404).send({ code: 'PROJECT_NOT_FOUND', message: '项目不存在' })
    return { items: await fileRepository.list(project.id), membershipRole: project.membershipRole }
  })

  app.post<{ Params: { projectId: string } }>('/projects/:projectId/files', async (request, reply) => {
    const user = await authenticatedUser(request, reply, authService)
    if (!user) return
    const project = await projectRepository.getForUser(request.params.projectId, user)
    if (!project) return reply.code(404).send({ code: 'PROJECT_NOT_FOUND', message: '项目不存在' })
    if (project.membershipRole === 'VIEWER') {
      return reply.code(403).send({ code: 'FORBIDDEN', message: '只读成员不能上传资料' })
    }

    let part
    try {
      part = await request.file({ limits: { files: 1, fileSize: maximumFileSize } })
      if (!part) return reply.code(400).send({ code: 'FILE_REQUIRED', message: '请选择文件' })
      if (!supportedFile(part.filename, part.mimetype)) {
        part.file.resume()
        return reply.code(415).send({ code: 'UNSUPPORTED_FILE_TYPE', message: '不支持这种文件格式' })
      }
      const bytes = await part.toBuffer()
      if (part.file.truncated || bytes.length > maximumFileSize) {
        return reply.code(413).send({ code: 'FILE_TOO_LARGE', message: '单个文件不能超过 50 MB' })
      }

      const checksum = createHash('sha256').update(bytes).digest('hex')
      if (await fileRepository.findDuplicate(project.id, checksum)) {
        return reply.code(409).send({ code: 'DUPLICATE_FILE', message: '这份资料已经上传过' })
      }

      const logicalName = part.filename.normalize('NFKC')
      const version = await fileRepository.nextVersion(project.id, logicalName)
      const id = randomUUID()
      const storageKey = `projects/${project.id}/files/${id}/v${version}/${safeFilename(part.filename)}`
      await storage.put({ key: storageKey, contentType: part.mimetype, bytes })
      const asset = await fileRepository.create({
        id,
        projectId: project.id,
        logicalName,
        filename: part.filename,
        version,
        storageKey,
        contentType: part.mimetype,
        size: bytes.length,
        checksum,
        actor: user,
      })
      return reply.code(201).send(asset)
    } catch (error) {
      if ((error as { code?: string }).code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.code(413).send({ code: 'FILE_TOO_LARGE', message: '单个文件不能超过 50 MB' })
      }
      throw error
    }
  })

  app.get<{ Params: { projectId: string; fileId: string } }>(
    '/projects/:projectId/files/:fileId/download',
    async (request, reply) => {
      const user = await authenticatedUser(request, reply, authService)
      if (!user) return
      const project = await projectRepository.getForUser(request.params.projectId, user)
      if (!project) return reply.code(404).send({ code: 'PROJECT_NOT_FOUND', message: '项目不存在' })
      const asset = await fileRepository.get(project.id, request.params.fileId)
      if (!asset) return reply.code(404).send({ code: 'FILE_NOT_FOUND', message: '文件不存在' })
      const token = await storage.createDownloadToken(asset.storageKey, downloadLifetimeSeconds)
      return { url: `/api/downloads/${encodeURIComponent(token)}`, expiresInSeconds: downloadLifetimeSeconds }
    },
  )

  app.get<{ Params: { token: string } }>('/downloads/:token', async (request, reply) => {
    const storageKey = await storage.resolveDownloadToken(request.params.token)
    if (!storageKey) return reply.code(404).send({ code: 'DOWNLOAD_EXPIRED', message: '下载链接已失效' })
    const asset = await fileRepository.getByStorageKey(storageKey)
    if (!asset) return reply.code(404).send({ code: 'FILE_NOT_FOUND', message: '文件不存在' })
    const bytes = await storage.get(storageKey)
    reply.header('Content-Type', asset.contentType)
    reply.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(asset.filename)}`)
    return reply.send(bytes)
  })
}
