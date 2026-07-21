import { describe, expect, it } from 'vitest'
import { createSessionToken, hashSessionToken, sessionCookieOptions } from './session.js'

describe('session tokens', () => {
  it('stores a deterministic hash instead of the raw token', () => {
    const hash = hashSessionToken('raw-session-token')
    expect(hash).toHaveLength(64)
    expect(hash).not.toContain('raw-session-token')
    expect(hashSessionToken('raw-session-token')).toBe(hash)
  })

  it('creates an unguessable URL-safe token', () => {
    expect(createSessionToken()).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })

  it('uses a secure strict cookie in production', () => {
    expect(sessionCookieOptions('production')).toMatchObject({
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      path: '/',
      maxAge: 43_200,
    })
  })
})
