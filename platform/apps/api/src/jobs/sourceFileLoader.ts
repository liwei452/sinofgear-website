import type { AppDatabase } from '../db/database.js'
import type { FileStorage } from '../storage/fileStorage.js'
import type { SqliteFileRepository } from '../routes/files.js'
import type { AiTask } from './taskRepository.js'
import type { SourceFileLoader } from './processTask.js'

export class StoredSourceFileLoader implements SourceFileLoader {
  constructor(
    private readonly database: AppDatabase,
    private readonly files: SqliteFileRepository,
    private readonly storage: FileStorage,
  ) {}

  async load(task: AiTask) {
    const file = await this.files.get(task.projectId, task.sourceFileId)
    if (!file) throw new Error(`Source file not found: ${task.sourceFileId}`)
    const project = this.database.prepare(`
      SELECT name, legal_name, export_stage FROM factory_projects WHERE id = ?
    `).get(task.projectId) as { name: string; legal_name: string; export_stage: string } | undefined
    return {
      filename: file.filename,
      contentType: file.contentType,
      bytes: await this.storage.get(file.storageKey),
      projectContext: project
        ? `${project.name}；企业名称：${project.legal_name}；外贸阶段：${project.export_stage}`
        : '',
    }
  }
}
