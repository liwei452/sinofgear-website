import { createHash, randomBytes } from 'node:crypto'
import type { CookieSerializeOptions } from '@fastify/cookie'

export const sessionCookieName = 'workbench_session'
export const sessionLifetimeSeconds = 12 * 60 * 60

export function createSessionToken() {
  return randomBytes(32).toString('base64url')
}

export function hashSessionToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex')
}

export function sessionCookieOptions(
  nodeEnvironment: 'development' | 'test' | 'production',
): CookieSerializeOptions {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: nodeEnvironment === 'production',
    path: '/',
    maxAge: sessionLifetimeSeconds,
  }
}
