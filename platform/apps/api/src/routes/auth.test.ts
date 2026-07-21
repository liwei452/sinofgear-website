import { describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import type { AuthService } from './auth.js'

const user = {
  id: 'user-1',
  email: 'admin@example.com',
  displayName: '管理员',
  systemRole: 'ADMIN' as const,
}

function createAuthService(valid = true): AuthService {
  return {
    async login() {
      return valid
        ? { user, rawToken: 'test-token', expiresAt: new Date('2026-07-22T08:00:00.000Z') }
        : null
    },
    async getUserByRawToken(token) {
      return token === 'test-token' ? user : null
    },
    async logout() {},
  }
}

describe('authentication routes', () => {
  it('sets a private cookie after a valid login', async () => {
    const app = await buildApp({ authService: createAuthService() })
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'admin@example.com', password: 'correct-password' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ user })
    expect(response.headers['set-cookie']).toContain('workbench_session=test-token')
    expect(response.headers['set-cookie']).toContain('HttpOnly')
    await app.close()
  })

  it('uses the same error for every invalid credential', async () => {
    const app = await buildApp({ authService: createAuthService(false) })
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'unknown@example.com', password: 'wrong-password' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: '邮箱或密码错误',
    })
    await app.close()
  })

  it('returns the current user from the session cookie', async () => {
    const app = await buildApp({ authService: createAuthService() })
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { cookie: 'workbench_session=test-token' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ user })
    await app.close()
  })
})
