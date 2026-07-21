import { describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import { openDatabase } from '../db/database.js'
import { runMigrations } from '../db/migrations.js'
import { SqliteAiTaskRepository } from '../jobs/taskRepository.js'
import type { FileStorage, StoredObject } from '../storage/fileStorage.js'
import {
  isAiExtractionEligible,
  maximumAiExtractionFileSize,
  maximumUploadFileSize,
  SqliteFileRepository,
} from './files.js'
import { SqliteProjectRepository } from './projects.js'
import type { AuthService } from './auth.js'

const member = {
  id: 'user-member',
  email: 'member@example.com',
  displayName: '项目成员',
  systemRole: 'MEMBER' as const,
}

class FakeFileStorage implements FileStorage {
  lastPut: { key: string; contentType: string; bytes: Buffer } | null = null
  private readonly objects = new Map<string, Buffer>()

  async put(input: { key: string; contentType: string; bytes: Buffer }): Promise<StoredObject> {
    this.lastPut = input
    this.objects.set(input.key, input.bytes)
    return {
      key: input.key,
      contentType: input.contentType,
      size: input.bytes.length,
      checksum: 'storage-checksum',
    }
  }

  async get(key: string) {
    const bytes = this.objects.get(key)
    if (!bytes) throw new Error('not found')
    return bytes
  }

  async createDownloadToken(key: string) { return `token:${key}` }
  async resolveDownloadToken(token: string) { return token.startsWith('token:') ? token.slice(6) : null }
}

function authService(): AuthService {
  return {
    async login() { return null },
    async getUserByRawToken(token) { return token === 'valid-token' ? member : null },
    async logout() {},
  }
}

function seedProject() {
  const database = openDatabase(':memory:')
  runMigrations(database)
  const now = '2026-07-21T00:00:00.000Z'
  database.prepare(`
    INSERT INTO users (id, email, display_name, password_hash, system_role, created_at, updated_at)
    VALUES (?, ?, ?, 'hash', 'MEMBER', ?, ?)
  `).run(member.id, member.email, member.displayName, now, now)
  database.prepare(`
    INSERT INTO factory_projects (
      id, name, legal_name, primary_contact_name, primary_contact_email,
      export_stage, existing_acquisition_channels, stage, created_at, updated_at
    ) VALUES ('project-1', 'SINOFORM 齿轮工厂', 'SINOFORM', '联系人',
      'contact@example.com', 'STARTING', '[]', 'PROFILE', ?, ?)
  `).run(now, now)
  database.prepare(`
    INSERT INTO project_memberships (id, project_id, user_id, role, created_at)
    VALUES ('membership-1', 'project-1', ?, 'MEMBER', ?)
  `).run(member.id, now)
  return database
}

function multipart(filename: string, contentType: string, bytes: Buffer) {
  const boundary = '----workbench-test-boundary'
  return {
    body: Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`),
      bytes,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
    contentType: `multipart/form-data; boundary=${boundary}`,
  }
}

async function createTestApp() {
  const database = seedProject()
  const storage = new FakeFileStorage()
  const projectRepository = new SqliteProjectRepository(database)
  const app = await buildApp({
    authService: authService(),
    projectRepository,
    fileRepository: new SqliteFileRepository(database),
    fileStorage: storage,
    taskRepository: new SqliteAiTaskRepository(database),
  })
  return { app, database, storage }
}

describe('file routes', () => {
  it('keeps storage and AI extraction size boundaries separate', () => {
    expect(maximumUploadFileSize).toBe(200 * 1024 * 1024)
    expect(isAiExtractionEligible(maximumAiExtractionFileSize - 1)).toBe(true)
    expect(isAiExtractionEligible(maximumAiExtractionFileSize)).toBe(false)
  })

  it('rejects executable files', async () => {
    const { app, database } = await createTestApp()
    const payload = multipart('payload.exe', 'application/octet-stream', Buffer.from('MZ'))
    const response = await app.inject({
      method: 'POST',
      url: '/projects/project-1/files',
      headers: { cookie: 'workbench_session=valid-token', 'content-type': payload.contentType },
      payload: payload.body,
    })

    expect(response.statusCode).toBe(415)
    expect(response.json().code).toBe('UNSUPPORTED_FILE_TYPE')
    await app.close()
    database.close()
  })

  it('stores an allowed PDF under the project prefix and creates immutable versions', async () => {
    const { app, database, storage } = await createTestApp()
    for (const bytes of [Buffer.from('%PDF-1.7 first'), Buffer.from('%PDF-1.7 second')]) {
      const payload = multipart('catalog.pdf', 'application/pdf', bytes)
      const response = await app.inject({
        method: 'POST',
        url: '/projects/project-1/files',
        headers: { cookie: 'workbench_session=valid-token', 'content-type': payload.contentType },
        payload: payload.body,
      })
      expect(response.statusCode).toBe(201)
    }

    expect(storage.lastPut?.key).toMatch(/^projects\/project-1\/files\//)
    const list = await app.inject({
      method: 'GET',
      url: '/projects/project-1/files',
      headers: { cookie: 'workbench_session=valid-token' },
    })
    expect(list.json().items.map((item: { version: number }) => item.version)).toEqual([2, 1])
    await app.close()
    database.close()
  })

  it('rejects a duplicate checksum without writing a second object', async () => {
    const { app, database } = await createTestApp()
    const payload = multipart('catalog.pdf', 'application/pdf', Buffer.from('%PDF-1.7 same'))
    const upload = () => app.inject({
      method: 'POST',
      url: '/projects/project-1/files',
      headers: { cookie: 'workbench_session=valid-token', 'content-type': payload.contentType },
      payload: payload.body,
    })
    expect((await upload()).statusCode).toBe(201)
    const duplicate = await upload()
    expect(duplicate.statusCode).toBe(409)
    expect(duplicate.json().code).toBe('DUPLICATE_FILE')
    await app.close()
    database.close()
  })

  it('stores a 50 MB file but refuses to enqueue it for direct AI extraction', async () => {
    const { app, database } = await createTestApp()
    const payload = multipart('large-catalog.pdf', 'application/pdf', Buffer.alloc(maximumAiExtractionFileSize, 1))
    const upload = await app.inject({
      method: 'POST',
      url: '/projects/project-1/files',
      headers: { cookie: 'workbench_session=valid-token', 'content-type': payload.contentType },
      payload: payload.body,
    })

    expect(upload.statusCode).toBe(201)
    expect(upload.json().aiExtractionEligible).toBe(false)

    const extraction = await app.inject({
      method: 'POST',
      url: `/projects/project-1/files/${upload.json().id}/extractions`,
      headers: { cookie: 'workbench_session=valid-token' },
    })
    expect(extraction.statusCode).toBe(422)
    expect(extraction.json().code).toBe('AI_FILE_TOO_LARGE')
    expect(database.prepare('SELECT COUNT(*) AS count FROM ai_tasks').get()).toEqual({ count: 0 })
    await app.close()
    database.close()
  })

  it('issues a short-lived download URL for an authorized project member', async () => {
    const { app, database } = await createTestApp()
    const payload = multipart('catalog.pdf', 'application/pdf', Buffer.from('%PDF-1.7 download'))
    const uploaded = await app.inject({
      method: 'POST',
      url: '/projects/project-1/files',
      headers: { cookie: 'workbench_session=valid-token', 'content-type': payload.contentType },
      payload: payload.body,
    })
    const response = await app.inject({
      method: 'GET',
      url: `/projects/project-1/files/${uploaded.json().id}/download`,
      headers: { cookie: 'workbench_session=valid-token' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ expiresInSeconds: 300 })
    expect(response.json().url).toMatch(/^\/api\/downloads\//)
    await app.close()
    database.close()
  })

  it('queues one idempotent capability extraction task per file version', async () => {
    const { app, database } = await createTestApp()
    const payload = multipart('catalog.pdf', 'application/pdf', Buffer.from('%PDF-1.7 extract'))
    const uploaded = await app.inject({
      method: 'POST', url: '/projects/project-1/files',
      headers: { cookie: 'workbench_session=valid-token', 'content-type': payload.contentType },
      payload: payload.body,
    })
    const enqueue = () => app.inject({
      method: 'POST',
      url: `/projects/project-1/files/${uploaded.json().id}/extractions`,
      headers: { cookie: 'workbench_session=valid-token' },
    })
    const first = await enqueue()
    const second = await enqueue()

    expect(first.statusCode).toBe(202)
    expect(first.json()).toMatchObject({ status: 'QUEUED' })
    expect(second.json().taskId).toBe(first.json().taskId)
    const status = await app.inject({
      method: 'GET',
      url: `/projects/project-1/tasks/${first.json().taskId}`,
      headers: { cookie: 'workbench_session=valid-token' },
    })
    expect(status.json()).toMatchObject({ id: first.json().taskId, status: 'QUEUED' })
    await app.close()
    database.close()
  })
})
