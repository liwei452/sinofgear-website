import { randomUUID } from 'node:crypto'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { capabilityReviewStatusSchema } from '@workbench/contracts'
import { sessionCookieName } from '../auth/session.js'
import type { AppDatabase } from '../db/database.js'
import type { AuthService, AuthenticatedUser } from './auth.js'
import type { ProjectRepository } from './projects.js'

interface CapabilityRow {
  id: string; project_id: string; source_file_id: string; source_task_id: string | null
  revision: number; category: string; name: string; value: string; evidence_quote: string
  source_locator: string; confidence: number; review_status: string; filename: string
}

export class SqliteCapabilityRepository {
  constructor(private readonly database: AppDatabase) {}

  private history(capabilityId: string) {
    return this.database.prepare(`
      SELECT r.id, r.status, r.reason, r.created_at AS reviewedAt,
        r.reviewer_id AS reviewedBy, u.display_name AS reviewerName
      FROM capability_reviews r JOIN users u ON u.id = r.reviewer_id
      WHERE r.capability_id = ? ORDER BY r.created_at DESC
    `).all(capabilityId)
  }

  async list(projectId: string) {
    const rows = this.database.prepare(`
      SELECT c.*, f.filename FROM capabilities c
      JOIN file_assets f ON f.id = c.source_file_id
      WHERE c.project_id = ?
        AND NOT EXISTS (SELECT 1 FROM capabilities newer WHERE newer.supersedes_capability_id = c.id)
      ORDER BY c.category, c.created_at
    `).all(projectId) as unknown as CapabilityRow[]
    const grouped = new Map<string, Array<Record<string, unknown>>>()
    for (const row of rows) {
      const item = {
        id: row.id, revision: row.revision, category: row.category, name: row.name,
        value: row.value, evidenceQuote: row.evidence_quote, sourceLocator: row.source_locator,
        sourceFilename: row.filename, confidence: row.confidence, reviewStatus: row.review_status,
        history: this.history(row.id),
      }
      const items = grouped.get(row.category) ?? []
      items.push(item); grouped.set(row.category, items)
    }
    return [...grouped].map(([category, items]) => ({ category, items }))
  }

  async interviewQuestions(projectId: string) {
    const rows = this.database.prepare(`
      SELECT output_json FROM ai_tasks WHERE project_id = ? AND status = 'SUCCEEDED' AND output_json IS NOT NULL ORDER BY finished_at DESC
    `).all(projectId) as Array<{ output_json: string }>
    const questions = new Set<string>()
    for (const row of rows) {
      try {
        const output = JSON.parse(row.output_json) as { interviewQuestions?: string[] }
        for (const question of output.interviewQuestions ?? []) questions.add(question)
      } catch { /* Ignore historical malformed output. */ }
    }
    return [...questions]
  }

  async review(projectId: string, capabilityId: string, input: { status: string; reason: string; name?: string; value?: string }, actor: AuthenticatedUser) {
    const current = this.database.prepare(`
      SELECT c.*, f.filename FROM capabilities c JOIN file_assets f ON f.id=c.source_file_id
      WHERE c.project_id=? AND c.id=?
    `).get(projectId, capabilityId) as unknown as CapabilityRow | undefined
    if (!current) return null
    const now = new Date().toISOString()
    let reviewedId = current.id
    this.database.exec('BEGIN IMMEDIATE')
    try {
      if ((input.name && input.name !== current.name) || (input.value && input.value !== current.value)) {
        reviewedId = randomUUID()
        this.database.prepare(`
          INSERT INTO capabilities (id,project_id,source_file_id,source_task_id,revision,supersedes_capability_id,category,name,value,evidence_quote,source_locator,confidence,review_status,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(reviewedId, projectId, current.source_file_id, current.source_task_id, current.revision + 1, current.id, current.category, input.name ?? current.name, input.value ?? current.value, current.evidence_quote, current.source_locator, current.confidence, input.status, now, now)
      } else {
        this.database.prepare('UPDATE capabilities SET review_status=?, updated_at=? WHERE id=?').run(input.status, now, current.id)
      }
      this.database.prepare(`INSERT INTO capability_reviews (id,project_id,capability_id,reviewer_id,status,reason,created_at) VALUES (?,?,?,?,?,?,?)`)
        .run(randomUUID(), projectId, reviewedId, actor.id, input.status, input.reason, now)
      this.database.prepare(`INSERT INTO audit_events (id,project_id,actor_id,action,entity_type,entity_id,changed_fields_json,created_at) VALUES (?,?,?,'REVIEW','Capability',?,?,?)`)
        .run(randomUUID(), projectId, actor.id, reviewedId, JSON.stringify(['status', 'reason', ...(input.name ? ['name'] : []), ...(input.value ? ['value'] : [])]), now)
      this.database.exec('COMMIT')
    } catch (error) { this.database.exec('ROLLBACK'); throw error }
    return { id: reviewedId, reviewStatus: input.status, reviewedBy: actor.id, reason: input.reason }
  }
}

async function user(request: FastifyRequest, reply: FastifyReply, auth: AuthService) {
  const token = request.cookies[sessionCookieName]
  const result = token ? await auth.getUserByRawToken(token) : null
  if (!result) { reply.code(401).send({ code: 'UNAUTHENTICATED', message: '请先登录' }); return null }
  return result
}

const reviewSchema = z.object({
  status: capabilityReviewStatusSchema.exclude(['PENDING_REVIEW']),
  reason: z.string().trim().min(1),
  name: z.string().trim().min(1).optional(),
  value: z.string().trim().min(1).optional(),
})

export async function registerCapabilityRoutes(app: FastifyInstance, auth: AuthService, projects: ProjectRepository, capabilities: SqliteCapabilityRepository) {
  app.get<{ Params: { projectId: string } }>('/projects/:projectId/capabilities', async (request, reply) => {
    const actor = await user(request, reply, auth); if (!actor) return
    const project = await projects.getForUser(request.params.projectId, actor)
    if (!project) return reply.code(404).send({ code: 'PROJECT_NOT_FOUND', message: '项目不存在' })
    return { groups: await capabilities.list(project.id), membershipRole: project.membershipRole }
  })
  app.get<{ Params: { projectId: string } }>('/projects/:projectId/interview-questions', async (request, reply) => {
    const actor = await user(request, reply, auth); if (!actor) return
    const project = await projects.getForUser(request.params.projectId, actor)
    if (!project) return reply.code(404).send({ code: 'PROJECT_NOT_FOUND', message: '项目不存在' })
    return { items: await capabilities.interviewQuestions(project.id) }
  })
  app.patch<{ Params: { projectId: string; capabilityId: string } }>('/projects/:projectId/capabilities/:capabilityId/review', async (request, reply) => {
    const actor = await user(request, reply, auth); if (!actor) return
    const project = await projects.getForUser(request.params.projectId, actor)
    if (!project) return reply.code(404).send({ code: 'PROJECT_NOT_FOUND', message: '项目不存在' })
    if (project.membershipRole === 'VIEWER') return reply.code(403).send({ code: 'FORBIDDEN', message: '只读成员不能审核能力' })
    const parsed = reviewSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(422).send({ code: 'REVIEW_REASON_REQUIRED', message: '请填写审核依据' })
    const result = await capabilities.review(project.id, request.params.capabilityId, parsed.data, actor)
    if (!result) return reply.code(404).send({ code: 'CAPABILITY_NOT_FOUND', message: '能力不存在' })
    return result
  })
}
