import { describe, expect, it } from 'vitest'
import { openDatabase } from './database.js'
import { runMigrations } from './migrations.js'
import { seedDatabase } from './seedData.js'

describe('seedDatabase', () => {
  it('creates the administrator and the SINOFORM pilot project once', async () => {
    const database = openDatabase(':memory:')
    runMigrations(database)
    const input = {
      email: 'admin@example.com',
      password: 'ChangeMe-Local-Only-123!',
      createPasswordHash: async () => 'hashed-password',
      now: () => new Date('2026-07-21T00:00:00.000Z'),
    }

    await seedDatabase(database, input)
    await seedDatabase(database, input)

    expect(database.prepare('SELECT COUNT(*) AS count FROM users').get()).toEqual({ count: 1 })
    expect(database.prepare('SELECT COUNT(*) AS count FROM factory_projects').get()).toEqual({ count: 1 })
    expect(database.prepare('SELECT role FROM project_memberships').get()).toEqual({ role: 'ADMIN' })
    database.close()
  })
})
