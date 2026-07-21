import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { hash } from 'bcryptjs'
import { openDatabase } from '../db/database.js'
import { runMigrations } from '../db/migrations.js'
import { seedDatabase } from '../db/seedData.js'

const platformRoot = resolve(import.meta.dirname, '../../../..')
const databaseFile = resolve(platformRoot, 'var/e2e.db')
const storageDirectory = resolve(platformRoot, 'var/e2e-files')
await rm(databaseFile, { force: true })
await rm(`${databaseFile}-shm`, { force: true })
await rm(`${databaseFile}-wal`, { force: true })
await rm(storageDirectory, { recursive: true, force: true })
const database = openDatabase(databaseFile)
runMigrations(database)
await seedDatabase(database, { email: 'admin@example.com', password: 'ChangeMe-Local-Only-123!', createPasswordHash: (password) => hash(password, 12) })
database.close()
