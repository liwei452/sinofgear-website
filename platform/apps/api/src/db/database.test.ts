import { describe, expect, it } from 'vitest'
import { openDatabase } from './database.js'
import { runMigrations } from './migrations.js'

describe('database migrations', () => {
  it('creates every phase-one table and enables foreign keys', () => {
    const database = openDatabase(':memory:')
    runMigrations(database)

    const tableNames = database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => String(row.name))

    expect(tableNames).toEqual(expect.arrayContaining([
      'users',
      'sessions',
      'factory_projects',
      'project_memberships',
      'file_assets',
      'ai_tasks',
      'capabilities',
      'capability_reviews',
      'market_candidates',
      'market_evidence',
      'market_decisions',
      'audit_events',
    ]))
    expect(database.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 })
    database.close()
  })

  it('can run the same migration set twice', () => {
    const database = openDatabase(':memory:')
    runMigrations(database)
    expect(() => runMigrations(database)).not.toThrow()
    expect(database.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get()).toEqual({ count: 2 })
    database.close()
  })
})
