import { describe, expect, it } from 'vitest'
import { hashSessionToken } from './session.js'
import { SqliteAuthRepository } from './sqliteAuthRepository.js'
import { openDatabase } from '../db/database.js'
import { runMigrations } from '../db/migrations.js'

describe('SqliteAuthRepository', () => {
  it('stores and resolves only active hashed sessions', async () => {
    const database = openDatabase(':memory:')
    runMigrations(database)
    database.prepare(`
      INSERT INTO users (id, email, display_name, password_hash, system_role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'user-1',
      'admin@example.com',
      '管理员',
      'password-hash',
      'ADMIN',
      '2026-07-21T00:00:00.000Z',
      '2026-07-21T00:00:00.000Z',
    )
    const repository = new SqliteAuthRepository(database)

    await repository.createSession({
      userId: 'user-1',
      tokenHash: hashSessionToken('raw-token'),
      expiresAt: new Date('2026-07-21T20:00:00.000Z'),
    })

    expect(await repository.findUserBySessionHash(
      hashSessionToken('raw-token'),
      new Date('2026-07-21T08:00:00.000Z'),
    )).toMatchObject({ id: 'user-1', systemRole: 'ADMIN' })
    expect(await repository.findUserBySessionHash(
      hashSessionToken('raw-token'),
      new Date('2026-07-22T08:00:00.000Z'),
    )).toBeNull()
    database.close()
  })
})
