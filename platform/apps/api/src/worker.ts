import OpenAI from 'openai'
import { FakeCapabilityExtractor } from './ai/capabilityExtractor.js'
import { OpenAiCapabilityExtractor } from './ai/openAiExtractor.js'
import { loadConfig } from './config.js'
import { databasePathFromUrl, openDatabase } from './db/database.js'
import { runMigrations } from './db/migrations.js'
import { processTask, SqliteCapabilityDraftRepository } from './jobs/processTask.js'
import { StoredSourceFileLoader } from './jobs/sourceFileLoader.js'
import { SqliteAiTaskRepository } from './jobs/taskRepository.js'
import { SqliteFileRepository } from './routes/files.js'
import { LocalFileStorage } from './storage/localFileStorage.js'

const config = loadConfig()
if (config.AI_PROVIDER === 'openai' && !config.OPENAI_API_KEY) {
  throw new Error('AI_PROVIDER=openai 时必须配置 OPENAI_API_KEY')
}

const database = openDatabase(databasePathFromUrl(config.DATABASE_URL))
runMigrations(database)
const storage = new LocalFileStorage(config.FILE_STORAGE_ROOT, config.DOWNLOAD_TOKEN_SECRET)
const taskRepository = new SqliteAiTaskRepository(database)
const fileRepository = new SqliteFileRepository(database)
const extractor = config.AI_PROVIDER === 'openai'
  ? new OpenAiCapabilityExtractor(
      new OpenAI({ apiKey: config.OPENAI_API_KEY }) as never,
      config.OPENAI_MODEL,
    )
  : new FakeCapabilityExtractor()
const dependencies = {
  taskRepository,
  capabilityRepository: new SqliteCapabilityDraftRepository(database),
  extractor,
  sourceLoader: new StoredSourceFileLoader(database, fileRepository, storage),
  model: config.AI_PROVIDER === 'openai' ? config.OPENAI_MODEL : 'fake-capability-v1',
}

let stopping = false
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => { stopping = true })
}

while (!stopping) {
  const taskId = await taskRepository.findNextRunnableId(new Date())
  if (taskId) {
    await processTask(taskId, dependencies)
  } else {
    await new Promise((resolve) => setTimeout(resolve, 750))
  }
}
database.close()
