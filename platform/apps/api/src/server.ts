import { buildApp } from './app.js'
import { SqliteAuthRepository } from './auth/sqliteAuthRepository.js'
import { DatabaseAuthService } from './auth/service.js'
import { loadConfig } from './config.js'
import { databasePathFromUrl, openDatabase } from './db/database.js'
import { runMigrations } from './db/migrations.js'
import { SqliteProjectRepository } from './routes/projects.js'
import { SqliteFileRepository } from './routes/files.js'
import { LocalFileStorage } from './storage/localFileStorage.js'
import { SqliteAiTaskRepository } from './jobs/taskRepository.js'
import { SqliteCapabilityRepository } from './routes/capabilities.js'

const config = loadConfig()
const database = openDatabase(databasePathFromUrl(config.DATABASE_URL))
runMigrations(database)
const authService = new DatabaseAuthService(new SqliteAuthRepository(database))
const projectRepository = new SqliteProjectRepository(database)
const app = await buildApp({
  authService,
  projectRepository,
  fileRepository: new SqliteFileRepository(database),
  fileStorage: new LocalFileStorage(config.FILE_STORAGE_ROOT, config.DOWNLOAD_TOKEN_SECRET),
  taskRepository: new SqliteAiTaskRepository(database),
  capabilityRepository: new SqliteCapabilityRepository(database),
})
app.addHook('onClose', async () => database.close())

await app.listen({ host: '0.0.0.0', port: config.API_PORT })
