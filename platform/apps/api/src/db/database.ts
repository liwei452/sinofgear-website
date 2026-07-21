import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export type AppDatabase = DatabaseSync

export function databasePathFromUrl(databaseUrl: string, baseDirectory = process.cwd()) {
  if (!databaseUrl.startsWith('file:')) {
    throw new Error('DATABASE_URL must start with file:')
  }
  const filename = databaseUrl.slice('file:'.length)
  return filename === ':memory:' ? ':memory:' : resolve(baseDirectory, filename)
}

export function openDatabase(filename: string): AppDatabase {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true })
  const database = new DatabaseSync(filename)
  database.exec('PRAGMA foreign_keys = ON')
  database.exec('PRAGMA journal_mode = WAL')
  database.exec('PRAGMA busy_timeout = 5000')
  return database
}
