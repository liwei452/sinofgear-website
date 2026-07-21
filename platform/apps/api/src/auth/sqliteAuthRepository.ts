import { randomUUID } from 'node:crypto'
import type { AppDatabase } from '../db/database.js'
import type { StoredUser, UserSessionRepository } from './service.js'

interface UserRow {
  id: string
  email: string
  display_name: string
  password_hash: string
  system_role: string
}

function toStoredUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    systemRole: row.system_role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
  }
}

export class SqliteAuthRepository implements UserSessionRepository {
  constructor(private readonly database: AppDatabase) {}

  async findUserByEmail(email: string) {
    const row = this.database.prepare(`
      SELECT id, email, display_name, password_hash, system_role
      FROM users WHERE email = ?
    `).get(email) as unknown as UserRow | undefined
    return row ? toStoredUser(row) : null
  }

  async createSession(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    this.database.prepare(`
      INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      input.userId,
      input.tokenHash,
      input.expiresAt.toISOString(),
      new Date().toISOString(),
    )
  }

  async findUserBySessionHash(tokenHash: string, now: Date) {
    const row = this.database.prepare(`
      SELECT users.id, users.email, users.display_name, users.password_hash, users.system_role
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?
    `).get(tokenHash, now.toISOString()) as unknown as UserRow | undefined
    return row ? toStoredUser(row) : null
  }

  async deleteSessionByHash(tokenHash: string) {
    this.database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
  }
}
