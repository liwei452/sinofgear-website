import { randomUUID } from 'node:crypto'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import type { AppDatabase } from '../db/database.js'
import { sessionCookieName } from '../auth/session.js'
import type { AuthService, AuthenticatedUser } from './auth.js'

export interface ProjectMilestones {
  hasProfile: boolean
  fileCount: number
  reviewedCapabilityCount: number
  primaryMarketCount: number
}

export function calculateProjectCompleteness(input: ProjectMilestones) {
  return [
    input.hasProfile,
    input.fileCount > 0,
    input.reviewedCapabilityCount > 0,
    input.primaryMarketCount === 1,
  ].filter(Boolean).length * 25
}

export interface FactoryProjectSummary {
  id: string
  name: string
  stage: string
  completeness: number
  nextAction: string
  updatedAt: string
  membershipRole: 'ADMIN' | 'MEMBER' | 'VIEWER'
  fileCount: number
  failedTaskCount: number
  extractionPendingCount: number
  pendingCapabilities: number
  insufficientEvidenceCount: number
  primaryMarketCount: number
  selectedDirection: string | null
}

export interface FactoryProjectDetails extends FactoryProjectSummary {
  legalName: string
  primaryContactName: string
  primaryContactEmail: string
  exportStage: string
  existingAcquisitionChannels: string[]
}

export interface ProjectInput {
  name: string
  legalName: string
  primaryContactName: string
  primaryContactEmail: string
  exportStage: string
  existingAcquisitionChannels: string[]
}

export interface ProjectRepository {
  listForUser(user: AuthenticatedUser): Promise<FactoryProjectSummary[]>
  getForUser(projectId: string, user: AuthenticatedUser): Promise<FactoryProjectDetails | null>
  create(input: ProjectInput, actor: AuthenticatedUser): Promise<FactoryProjectDetails>
  update(projectId: string, input: Partial<ProjectInput>, actor: AuthenticatedUser): Promise<FactoryProjectDetails | null>
}

interface ProjectRow {
  id: string
  name: string
  legal_name: string
  primary_contact_name: string
  primary_contact_email: string
  export_stage: string
  existing_acquisition_channels: string
  stage: string
  updated_at: string
  membership_role: string | null
  file_count: number
  reviewed_capability_count: number
  primary_market_count: number
  failed_task_count: number
  extraction_pending_count: number
  pending_capability_count: number
  insufficient_evidence_count: number
  selected_direction: string | null
}

function roleFromRow(row: ProjectRow, user: AuthenticatedUser) {
  if (user.systemRole === 'ADMIN') return 'ADMIN' as const
  if (row.membership_role === 'VIEWER') return 'VIEWER' as const
  return 'MEMBER' as const
}

export function getNextAction(input: {
  failedTaskCount: number; fileCount: number; extractionPendingCount: number
  pendingCapabilities: number; insufficientEvidenceCount: number; primaryMarketCount: number
}) {
  if (input.failedTaskCount > 0) return `重试 ${input.failedTaskCount} 个失败的 AI 任务`
  if (input.fileCount === 0) return '上传首份产品资料'
  if (input.extractionPendingCount > 0) return `处理 ${input.extractionPendingCount} 份待提取资料`
  if (input.pendingCapabilities > 0) return `审核 ${input.pendingCapabilities} 条待确认能力`
  if (input.insufficientEvidenceCount > 0) return `为 ${input.insufficientEvidenceCount} 个候选方向补充市场证据`
  if (input.primaryMarketCount === 0) return '选择主验证市场方向'
  return '第一阶段已完成'
}

function toDetails(row: ProjectRow, user: AuthenticatedUser): FactoryProjectDetails {
  return {
    id: row.id,
    name: row.name,
    legalName: row.legal_name,
    primaryContactName: row.primary_contact_name,
    primaryContactEmail: row.primary_contact_email,
    exportStage: row.export_stage,
    existingAcquisitionChannels: JSON.parse(row.existing_acquisition_channels) as string[],
    stage: row.stage,
    completeness: calculateProjectCompleteness({
      hasProfile: true,
      fileCount: row.file_count,
      reviewedCapabilityCount: row.reviewed_capability_count,
      primaryMarketCount: row.primary_market_count,
    }),
    nextAction: getNextAction({ failedTaskCount: row.failed_task_count, fileCount: row.file_count, extractionPendingCount: row.extraction_pending_count, pendingCapabilities: row.pending_capability_count, insufficientEvidenceCount: row.insufficient_evidence_count, primaryMarketCount: row.primary_market_count }),
    updatedAt: row.updated_at,
    membershipRole: roleFromRow(row, user),
    fileCount: row.file_count,
    failedTaskCount: row.failed_task_count,
    extractionPendingCount: row.extraction_pending_count,
    pendingCapabilities: row.pending_capability_count,
    insufficientEvidenceCount: row.insufficient_evidence_count,
    primaryMarketCount: row.primary_market_count,
    selectedDirection: row.selected_direction,
  }
}

const projectSelect = `
  SELECT p.*,
    pm.role AS membership_role,
    (SELECT COUNT(*) FROM file_assets f WHERE f.project_id = p.id) AS file_count,
    (SELECT COUNT(*) FROM capabilities c
      WHERE c.project_id = p.id AND c.review_status <> 'PENDING_REVIEW') AS reviewed_capability_count,
    (SELECT COUNT(*) FROM market_decisions d
      WHERE d.project_id = p.id
        AND NOT EXISTS (SELECT 1 FROM market_decisions newer WHERE newer.supersedes_decision_id = d.id)
    ) AS primary_market_count,
    (SELECT COUNT(*) FROM ai_tasks t WHERE t.project_id = p.id AND t.status = 'FAILED') AS failed_task_count,
    (SELECT COUNT(*) FROM file_assets f2 WHERE f2.project_id = p.id AND NOT EXISTS (
      SELECT 1 FROM ai_tasks t2 WHERE t2.source_file_id = f2.id AND t2.status = 'SUCCEEDED'
    )) AS extraction_pending_count,
    (SELECT COUNT(*) FROM capabilities c2 WHERE c2.project_id = p.id AND c2.review_status = 'PENDING_REVIEW'
      AND NOT EXISTS (SELECT 1 FROM capabilities newer WHERE newer.supersedes_capability_id = c2.id)
    ) AS pending_capability_count,
    (SELECT COUNT(*) FROM market_candidates mc WHERE mc.project_id = p.id AND NOT EXISTS (
      SELECT 1 FROM market_evidence me WHERE me.candidate_id = mc.id
    )) AS insufficient_evidence_count,
    (SELECT mc2.product_focus FROM market_decisions md JOIN market_candidates mc2 ON mc2.id = md.primary_candidate_id
      WHERE md.project_id = p.id AND NOT EXISTS (SELECT 1 FROM market_decisions newer_d WHERE newer_d.supersedes_decision_id = md.id)
      ORDER BY md.created_at DESC LIMIT 1
    ) AS selected_direction
  FROM factory_projects p
  LEFT JOIN project_memberships pm ON pm.project_id = p.id AND pm.user_id = ?
`

export class SqliteProjectRepository implements ProjectRepository {
  constructor(private readonly database: AppDatabase) {}

  async listForUser(user: AuthenticatedUser) {
    const rows = this.database.prepare(`
      ${projectSelect}
      WHERE ? = 'ADMIN' OR pm.user_id IS NOT NULL
      ORDER BY p.updated_at DESC
    `).all(user.id, user.systemRole) as unknown as ProjectRow[]
    return rows.map((row) => toDetails(row, user))
  }

  async getForUser(projectId: string, user: AuthenticatedUser) {
    const row = this.database.prepare(`
      ${projectSelect}
      WHERE p.id = ? AND (? = 'ADMIN' OR pm.user_id IS NOT NULL)
    `).get(user.id, projectId, user.systemRole) as unknown as ProjectRow | undefined
    return row ? toDetails(row, user) : null
  }

  async create(input: ProjectInput, actor: AuthenticatedUser) {
    const id = randomUUID()
    const now = new Date().toISOString()
    this.database.exec('BEGIN IMMEDIATE')
    try {
      this.database.prepare(`
        INSERT INTO factory_projects (
          id, name, legal_name, primary_contact_name, primary_contact_email,
          export_stage, existing_acquisition_channels, stage, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PROFILE', ?, ?)
      `).run(
        id,
        input.name,
        input.legalName,
        input.primaryContactName,
        input.primaryContactEmail,
        input.exportStage,
        JSON.stringify(input.existingAcquisitionChannels),
        now,
        now,
      )
      this.database.prepare(`
        INSERT INTO project_memberships (id, project_id, user_id, role, created_at)
        VALUES (?, ?, ?, 'ADMIN', ?)
      `).run(randomUUID(), id, actor.id, now)
      this.database.prepare(`
        INSERT INTO audit_events (
          id, project_id, actor_id, action, entity_type, entity_id, changed_fields_json, created_at
        ) VALUES (?, ?, ?, 'CREATE', 'FactoryProject', ?, ?, ?)
      `).run(randomUUID(), id, actor.id, id, JSON.stringify(Object.keys(input)), now)
      this.database.exec('COMMIT')
    } catch (error) {
      this.database.exec('ROLLBACK')
      throw error
    }
    return (await this.getForUser(id, actor))!
  }

  async update(projectId: string, input: Partial<ProjectInput>, actor: AuthenticatedUser) {
    const current = await this.getForUser(projectId, actor)
    if (!current || current.membershipRole === 'VIEWER') return null
    const merged: ProjectInput = {
      name: input.name ?? current.name,
      legalName: input.legalName ?? current.legalName,
      primaryContactName: input.primaryContactName ?? current.primaryContactName,
      primaryContactEmail: input.primaryContactEmail ?? current.primaryContactEmail,
      exportStage: input.exportStage ?? current.exportStage,
      existingAcquisitionChannels: input.existingAcquisitionChannels ?? current.existingAcquisitionChannels,
    }
    const now = new Date().toISOString()
    this.database.exec('BEGIN IMMEDIATE')
    try {
      this.database.prepare(`
        UPDATE factory_projects SET
          name = ?, legal_name = ?, primary_contact_name = ?, primary_contact_email = ?,
          export_stage = ?, existing_acquisition_channels = ?, updated_at = ?
        WHERE id = ?
      `).run(
        merged.name,
        merged.legalName,
        merged.primaryContactName,
        merged.primaryContactEmail,
        merged.exportStage,
        JSON.stringify(merged.existingAcquisitionChannels),
        now,
        projectId,
      )
      this.database.prepare(`
        INSERT INTO audit_events (
          id, project_id, actor_id, action, entity_type, entity_id, changed_fields_json, created_at
        ) VALUES (?, ?, ?, 'UPDATE', 'FactoryProject', ?, ?, ?)
      `).run(randomUUID(), projectId, actor.id, projectId, JSON.stringify(Object.keys(input)), now)
      this.database.exec('COMMIT')
    } catch (error) {
      this.database.exec('ROLLBACK')
      throw error
    }
    return this.getForUser(projectId, actor)
  }
}

const projectInputSchema = z.object({
  name: z.string().trim().min(1),
  legalName: z.string().trim().min(1),
  primaryContactName: z.string().trim().min(1),
  primaryContactEmail: z.email(),
  exportStage: z.string().trim().min(1),
  existingAcquisitionChannels: z.array(z.string().trim().min(1)),
})

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

export async function registerProjectRoutes(
  app: FastifyInstance,
  authService: AuthService,
  repository: ProjectRepository,
) {
  app.get('/projects', async (request, reply) => {
    const user = await authenticatedUser(request, reply, authService)
    if (!user) return
    return { items: await repository.listForUser(user) }
  })

  app.post('/projects', async (request, reply) => {
    const user = await authenticatedUser(request, reply, authService)
    if (!user) return
    if (user.systemRole !== 'ADMIN') {
      return reply.code(403).send({ code: 'FORBIDDEN', message: '只有管理员可以创建项目' })
    }
    const parsed = projectInputSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: '请完整填写工厂资料' })
    }
    return reply.code(201).send(await repository.create(parsed.data, user))
  })

  app.get<{ Params: { projectId: string } }>('/projects/:projectId', async (request, reply) => {
    const user = await authenticatedUser(request, reply, authService)
    if (!user) return
    const project = await repository.getForUser(request.params.projectId, user)
    if (!project) return reply.code(404).send({ code: 'PROJECT_NOT_FOUND', message: '项目不存在' })
    return project
  })

  app.patch<{ Params: { projectId: string } }>('/projects/:projectId', async (request, reply) => {
    const user = await authenticatedUser(request, reply, authService)
    if (!user) return
    const parsed = projectInputSchema.partial().safeParse(request.body)
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return reply.code(422).send({ code: 'VALIDATION_ERROR', message: '没有可更新的字段' })
    }
    const project = await repository.update(request.params.projectId, parsed.data, user)
    if (!project) return reply.code(403).send({ code: 'FORBIDDEN', message: '没有编辑权限' })
    return project
  })
}
