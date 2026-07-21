import { hash } from 'bcryptjs'
import { loadConfig } from '../config.js'
import { databasePathFromUrl, openDatabase } from './database.js'
import { runMigrations } from './migrations.js'
import { seedDatabase } from './seedData.js'

const config = loadConfig()
const database = openDatabase(databasePathFromUrl(config.DATABASE_URL))
runMigrations(database)
await seedDatabase(database, {
  email: config.SEED_ADMIN_EMAIL,
  password: config.SEED_ADMIN_PASSWORD,
  createPasswordHash: (password) => hash(password, 12),
})

database.close()
