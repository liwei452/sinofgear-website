import { loadConfig } from '../config.js'
import { databasePathFromUrl, openDatabase } from './database.js'
import { runMigrations } from './migrations.js'

const config = loadConfig()
const database = openDatabase(databasePathFromUrl(config.DATABASE_URL))
runMigrations(database)
database.close()
