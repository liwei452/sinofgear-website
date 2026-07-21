import { randomUUID } from 'node:crypto'
import { capabilityExtractionSchema, type CapabilityExtraction } from '@workbench/contracts'
import type { CapabilityExtractor, CapabilityExtractorInput } from '../ai/capabilityExtractor.js'
import { PermanentAiError, RetryableAiError } from '../ai/capabilityExtractor.js'
import type { AppDatabase } from '../db/database.js'
import { claimTask } from './claimTask.js'
import type { AiTask, SqliteAiTaskRepository } from './taskRepository.js'

export interface SourceFileLoader {
  load(task: AiTask): Promise<CapabilityExtractorInput>
}

export class SqliteCapabilityDraftRepository {
  constructor(private readonly database: AppDatabase) {}

  async replaceForTask(task: AiTask, extraction: CapabilityExtraction) {
    const now = new Date().toISOString()
    this.database.exec('BEGIN IMMEDIATE')
    try {
      this.database.prepare('DELETE FROM capabilities WHERE source_task_id = ?').run(task.id)
      const insert = this.database.prepare(`
        INSERT INTO capabilities (
          id, project_id, source_file_id, source_task_id, revision,
          category, name, value, evidence_quote, source_locator,
          confidence, review_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      for (const draft of extraction.capabilities) {
        const safeReviewStatus = draft.recommendedStatus === 'NEEDS_EVIDENCE'
          ? 'NEEDS_EVIDENCE'
          : 'PENDING_REVIEW'
        insert.run(
          randomUUID(), task.projectId, task.sourceFileId, task.id,
          draft.category, draft.name, draft.value, draft.evidenceQuote,
          draft.sourceLocator, draft.confidence, safeReviewStatus, now, now,
        )
      }
      this.database.exec('COMMIT')
    } catch (error) {
      this.database.exec('ROLLBACK')
      throw error
    }
  }
}

export interface ProcessTaskDependencies {
  taskRepository: SqliteAiTaskRepository
  capabilityRepository: SqliteCapabilityDraftRepository
  extractor: CapabilityExtractor
  sourceLoader: SourceFileLoader
  model: string
  now?: () => Date
}

const retryDelaysSeconds = [30, 120, 600]
const maximumAttempts = 3

export async function processTask(taskId: string, dependencies: ProcessTaskDependencies) {
  const now = dependencies.now ?? (() => new Date())
  const task = await claimTask(dependencies.taskRepository, taskId, now())
  if (!task) return dependencies.taskRepository.findRequired(taskId)

  try {
    const source = await dependencies.sourceLoader.load(task)
    const extraction = capabilityExtractionSchema.parse(await dependencies.extractor.extract(source))
    await dependencies.capabilityRepository.replaceForTask(task, extraction)
    await dependencies.taskRepository.succeed(task, extraction, dependencies.model, now())
  } catch (error) {
    const finishedAt = now()
    if (error instanceof RetryableAiError && task.attempts < maximumAttempts) {
      const delay = retryDelaysSeconds[task.attempts - 1] ?? retryDelaysSeconds.at(-1)!
      await dependencies.taskRepository.reschedule(
        task,
        error.code,
        new Date(finishedAt.getTime() + delay * 1000),
        finishedAt,
        dependencies.model,
      )
    } else {
      const code = error instanceof RetryableAiError || error instanceof PermanentAiError
        ? error.code
        : 'AI_PROCESSING_ERROR'
      await dependencies.taskRepository.fail(task, code, finishedAt, dependencies.model)
    }
  }
  return dependencies.taskRepository.findRequired(taskId)
}
