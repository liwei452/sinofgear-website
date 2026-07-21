import { describe, expect, it } from 'vitest'
import { DatabaseAuthService, type UserSessionRepository } from './service.js'

const user = {
  id: 'user-1',
  email: 'admin@example.com',
  displayName: '管理员',
  systemRole: 'ADMIN' as const,
  passwordHash: 'stored-password-hash',
}

function createRepository(): UserSessionRepository & {
  createdSession?: { userId: string; tokenHash: string; expiresAt: Date }
  deletedHash?: string
} {
  return {
    async findUserByEmail(email) {
      return email === user.email ? user : null
    },
    async createSession(input) {
      this.createdSession = input
    },
    async findUserBySessionHash(tokenHash) {
      return tokenHash === this.createdSession?.tokenHash ? user : null
    },
    async deleteSessionByHash(tokenHash) {
      this.deletedHash = tokenHash
    },
  }
}

describe('DatabaseAuthService', () => {
  it('creates a twelve-hour session after password verification', async () => {
    const repository = createRepository()
    const now = new Date('2026-07-21T08:00:00.000Z')
    const service = new DatabaseAuthService(repository, {
      now: () => now,
      verifyPassword: async () => true,
      createRawToken: () => 'raw-token',
    })

    const result = await service.login(user.email, 'password')

    expect(result?.rawToken).toBe('raw-token')
    expect(repository.createdSession?.userId).toBe(user.id)
    expect(repository.createdSession?.tokenHash).not.toBe('raw-token')
    expect(repository.createdSession?.expiresAt.toISOString()).toBe('2026-07-21T20:00:00.000Z')
  })

  it('returns null when password verification fails', async () => {
    const repository = createRepository()
    const service = new DatabaseAuthService(repository, {
      verifyPassword: async () => false,
    })

    expect(await service.login(user.email, 'wrong')).toBeNull()
    expect(repository.createdSession).toBeUndefined()
  })

  it('resolves and deletes sessions using only token hashes', async () => {
    const repository = createRepository()
    const service = new DatabaseAuthService(repository, {
      verifyPassword: async () => true,
      createRawToken: () => 'raw-token',
    })

    await service.login(user.email, 'password')
    expect((await service.getUserByRawToken('raw-token'))?.id).toBe(user.id)
    await service.logout('raw-token')
    expect(repository.deletedHash).toBe(repository.createdSession?.tokenHash)
  })
})
