import { randomUUID } from 'node:crypto'
import type { AppDatabase } from '../db/database.js'

export type AiTaskStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'

export interface AiTask {
  id: string
  projectId: string
  sourceFileId: string
  sourceFileVersion: number
  type: string
  status: AiTaskStatus
  attempts: number
  promptVersion: string
  model: string | null
  outputJson: string | null
  errorCode: string | null
  nextAttemptAt: string | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

interface AiTaskRow {
  id: string
  project_id: string
  source_file_id: string
  source_file_version: number
  type: string
  status: AiTaskStatus
  attempts: number
  prompt_version: string
  model: string | null
  output_json: string | null
  error_code: string | null
  next_attempt_at: string | null
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

function toTask(row: AiTaskRow): AiTask {
  return {
    id: row.id,
    projectId: row.project_id,
    sourceFileId: row.source_file_id,
    sourceFileVersion: row.source_file_version,
    type: row.type,
    status: row.status,
    attempts: row.attempts,
    promptVersion: row.prompt_version,
    model: row.model,
    outputJson: row.output_json,
    errorCode: row.error_code,
    nextAttemptAt: row.next_attempt_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class SqliteAiTaskRepository {
  constructor(private readonly database: AppDatabase) {}

  async enqueue(input: {
    projectId: string
    sourceFileId: string
    sourceFileVersion: number
    type: string
    promptVersion: string
    now?: string
  }) {
    const existing = this.database.prepare(`
      SELECT * FROM ai_tasks
      WHERE type = ? AND source_file_id = ? AND source_file_version = ? AND prompt_version = ?
    `).get(input.type, input.sourceFileId, input.sourceFileVersion, input.promptVersion) as unknown as AiTaskRow | undefined
    const now = input.now ?? new Date().toISOString()
    if (existing) {
      if (existing.status === 'FAILED') {
        this.database.prepare(`
          UPDATE ai_tasks SET status = 'QUEUED', attempts = 0, error_code = NULL,
            next_attempt_at = NULL, started_at = NULL, finished_at = NULL,
            attempt_log_json = '[]', updated_at = ? WHERE id = ?
        `).run(now, existing.id)
        return this.findRequired(existing.id)
      }
      return toTask(existing)
    }

    const id = randomUUID()
    this.database.prepare(`
      INSERT INTO ai_tasks (
        id, project_id, source_file_id, source_file_version, type, status,
        attempts, prompt_version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'QUEUED', 0, ?, ?, ?)
    `).run(
      id, input.projectId, input.sourceFileId, input.sourceFileVersion,
      input.type, input.promptVersion, now, now,
    )
    return this.findRequired(id)
  }

  async findRequired(id: string) {
    const row = this.database.prepare('SELECT * FROM ai_tasks WHERE id = ?').get(id) as unknown as AiTaskRow | undefined
    if (!row) throw new Error(`AI task not found: ${id}`)
    return toTask(row)
  }

  async findForProject(projectId: string, id: string) {
    const row = this.database.prepare('SELECT * FROM ai_tasks WHERE project_id = ? AND id = ?')
      .get(projectId, id) as unknown as AiTaskRow | undefined
    return row ? toTask(row) : null
  }

  async findNextRunnableId(now: Date) {
    const row = this.database.prepare(`
      SELECT id FROM ai_tasks
      WHERE status = 'QUEUED' AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
      ORDER BY created_at ASC LIMIT 1
    `).get(now.toISOString()) as { id: string } | undefined
    return row?.id ?? null
  }

  async claim(id: string, now: Date) {
    const timestamp = now.toISOString()
    const row = this.database.prepare(`
      UPDATE ai_tasks SET status = 'RUNNING', attempts = attempts + 1,
        started_at = ?, finished_at = NULL, updated_at = ?
      WHERE id = ? AND status = 'QUEUED'
        AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
      RETURNING *
    `).get(timestamp, timestamp, id, timestamp) as unknown as AiTaskRow | undefined
    return row ? toTask(row) : null
  }

  private appendAttempt(id: string, entry: Record<string, unknown>) {
    const row = this.database.prepare('SELECT attempt_log_json FROM ai_tasks WHERE id = ?')
      .get(id) as { attempt_log_json: string }
    const log = JSON.parse(row.attempt_log_json) as Array<Record<string, unknown>>
    log.push(entry)
    this.database.prepare('UPDATE ai_tasks SET attempt_log_json = ? WHERE id = ?').run(JSON.stringify(log), id)
  }

  async succeed(task: AiTask, output: unknown, model: string, finishedAt: Date) {
    const timestamp = finishedAt.toISOString()
    this.database.prepare(`
      UPDATE ai_tasks SET status = 'SUCCEEDED', model = ?, output_json = ?,
        error_code = NULL, next_attempt_at = NULL, finished_at = ?, updated_at = ?
      WHERE id = ?
    `).run(model, JSON.stringify(output), timestamp, timestamp, task.id)
    this.appendAttempt(task.id, {
      attempt: task.attempts, status: 'SUCCEEDED', model,
      promptVersion: task.promptVersion, startedAt: task.startedAt, finishedAt: timestamp,
    })
  }

  async reschedule(task: AiTask, errorCode: string, nextAttemptAt: Date, finishedAt: Date, model: string) {
    const timestamp = finishedAt.toISOString()
    this.database.prepare(`
      UPDATE ai_tasks SET status = 'QUEUED', model = ?, error_code = ?,
        next_attempt_at = ?, finished_at = ?, updated_at = ? WHERE id = ?
    `).run(model, errorCode, nextAttemptAt.toISOString(), timestamp, timestamp, task.id)
    this.appendAttempt(task.id, {
      attempt: task.attempts, status: 'RETRY_SCHEDULED', errorCode, model,
      promptVersion: task.promptVersion, startedAt: task.startedAt, finishedAt: timestamp,
      nextAttemptAt: nextAttemptAt.toISOString(),
    })
  }

  async fail(task: AiTask, errorCode: string, finishedAt: Date, model: string) {
    const timestamp = finishedAt.toISOString()
    this.database.prepare(`
      UPDATE ai_tasks SET status = 'FAILED', model = ?, error_code = ?,
        next_attempt_at = NULL, finished_at = ?, updated_at = ? WHERE id = ?
    `).run(model, errorCode, timestamp, timestamp, task.id)
    this.appendAttempt(task.id, {
      attempt: task.attempts, status: 'FAILED', errorCode, model,
      promptVersion: task.promptVersion, startedAt: task.startedAt, finishedAt: timestamp,
    })
  }
}
