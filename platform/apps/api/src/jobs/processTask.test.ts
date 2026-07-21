import type { CapabilityExtraction } from '@workbench/contracts'
import { describe, expect, it } from 'vitest'
import type { CapabilityExtractor } from '../ai/capabilityExtractor.js'
import { RetryableAiError } from '../ai/capabilityExtractor.js'
import { openDatabase } from '../db/database.js'
import { runMigrations } from '../db/migrations.js'
import { SqliteCapabilityDraftRepository, processTask } from './processTask.js'
import { SqliteAiTaskRepository } from './taskRepository.js'

class FakeExtractor implements CapabilityExtractor {
  result: CapabilityExtraction = {
    summary: '目录显示可按图加工斜齿轮',
    capabilities: [{
      category: 'PRODUCT',
      name: '斜齿轮',
      value: '支持按图加工',
      evidenceQuote: 'Custom helical gears according to drawing',
      sourceLocator: '第 4 页',
      confidence: 0.91,
      recommendedStatus: 'PENDING_REVIEW',
    }],
    interviewQuestions: ['该能力是否为长期稳定能力？'],
  }
  error: Error | null = null

  async extract() {
    if (this.error) throw this.error
    return this.result
  }
}

function seedTask() {
  const database = openDatabase(':memory:')
  runMigrations(database)
  const now = '2026-07-21T00:00:00.000Z'
  database.prepare(`
    INSERT INTO users (id, email, display_name, password_hash, system_role, created_at, updated_at)
    VALUES ('user-1', 'member@example.com', '项目成员', 'hash', 'MEMBER', ?, ?)
  `).run(now, now)
  database.prepare(`
    INSERT INTO factory_projects (
      id, name, legal_name, primary_contact_name, primary_contact_email,
      export_stage, existing_acquisition_channels, stage, created_at, updated_at
    ) VALUES ('project-1', 'SINOFORM 齿轮工厂', 'SINOFORM', '联系人',
      'contact@example.com', 'STARTING', '[]', 'PROFILE', ?, ?)
  `).run(now, now)
  database.prepare(`
    INSERT INTO file_assets (
      id, project_id, logical_name, filename, version, storage_key,
      content_type, size, checksum, status, uploaded_by_id, created_at
    ) VALUES ('file-1', 'project-1', 'catalog.pdf', 'catalog.pdf', 1,
      'projects/project-1/files/file-1/v1/catalog.pdf', 'application/pdf', 12,
      'checksum', 'UPLOADED', 'user-1', ?)
  `).run(now)
  const taskRepository = new SqliteAiTaskRepository(database)
  return { database, taskRepository, now }
}

describe('processTask', () => {
  it('persists structured capability drafts with source evidence', async () => {
    const { database, taskRepository, now } = seedTask()
    const task = await taskRepository.enqueue({
      projectId: 'project-1', sourceFileId: 'file-1', sourceFileVersion: 1,
      type: 'CAPABILITY_EXTRACTION', promptVersion: 'capability-v1', now,
    })
    const extractor = new FakeExtractor()
    await processTask(task.id, {
      taskRepository,
      capabilityRepository: new SqliteCapabilityDraftRepository(database),
      extractor,
      sourceLoader: { async load() { return { filename: 'catalog.pdf', contentType: 'application/pdf', bytes: Buffer.from('catalog'), projectContext: '齿轮工厂' } } },
      model: 'test-model',
      now: () => new Date(now),
    })

    const saved = database.prepare(`
      SELECT review_status, evidence_quote, source_locator FROM capabilities WHERE source_file_id = 'file-1'
    `).all() as Array<{ review_status: string; evidence_quote: string; source_locator: string }>
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({
      review_status: 'PENDING_REVIEW',
      evidence_quote: 'Custom helical gears according to drawing',
      source_locator: '第 4 页',
    })
    expect((await taskRepository.findRequired(task.id)).status).toBe('SUCCEEDED')
    database.close()
  })

  it('marks the third transient failure as failed', async () => {
    const { database, taskRepository, now } = seedTask()
    const task = await taskRepository.enqueue({
      projectId: 'project-1', sourceFileId: 'file-1', sourceFileVersion: 1,
      type: 'CAPABILITY_EXTRACTION', promptVersion: 'capability-v1', now,
    })
    const extractor = new FakeExtractor()
    extractor.error = new RetryableAiError('RATE_LIMIT')
    const moments = [0, 31, 152].map((seconds) => new Date(Date.parse(now) + seconds * 1000))
    for (const moment of moments) {
      await processTask(task.id, {
        taskRepository,
        capabilityRepository: new SqliteCapabilityDraftRepository(database),
        extractor,
        sourceLoader: { async load() { return { filename: 'catalog.pdf', contentType: 'application/pdf', bytes: Buffer.from('catalog'), projectContext: '' } } },
        model: 'test-model',
        now: () => moment,
      })
    }

    const failed = await taskRepository.findRequired(task.id)
    expect(failed.status).toBe('FAILED')
    expect(failed.attempts).toBe(3)
    expect(failed.errorCode).toBe('RATE_LIMIT')
    database.close()
  })
})
