import { randomUUID } from 'node:crypto'
import { hash } from 'bcryptjs'
import { loadConfig } from '../config.js'
import { databasePathFromUrl, openDatabase } from './database.js'
import { runMigrations } from './migrations.js'

const config = loadConfig()
const database = openDatabase(databasePathFromUrl(config.DATABASE_URL))
runMigrations(database)
const now = new Date().toISOString()
const passwordHash = await hash(config.SEED_ADMIN_PASSWORD, 12)

database.prepare(`
  INSERT INTO users (id, email, display_name, password_hash, system_role, created_at, updated_at)
  VALUES (?, ?, ?, ?, 'ADMIN', ?, ?)
  ON CONFLICT(email) DO UPDATE SET
    display_name = excluded.display_name,
    password_hash = excluded.password_hash,
    system_role = 'ADMIN',
    updated_at = excluded.updated_at
`).run(
  randomUUID(),
  config.SEED_ADMIN_EMAIL.toLowerCase(),
  '管理员',
  passwordHash,
  now,
  now,
)

database.close()
