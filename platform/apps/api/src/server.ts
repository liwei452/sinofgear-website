import { buildApp } from './app.js'
import { SqliteAuthRepository } from './auth/sqliteAuthRepository.js'
import { DatabaseAuthService } from './auth/service.js'
import { loadConfig } from './config.js'
import { databasePathFromUrl, openDatabase } from './db/database.js'
import { runMigrations } from './db/migrations.js'

const config = loadConfig()
const database = openDatabase(databasePathFromUrl(config.DATABASE_URL))
runMigrations(database)
const authService = new DatabaseAuthService(new SqliteAuthRepository(database))
const app = await buildApp({ authService })
app.addHook('onClose', async () => database.close())

await app.listen({ host: '0.0.0.0', port: config.API_PORT })
