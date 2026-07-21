import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { sessionCookieName, sessionCookieOptions } from '../auth/session.js'

export interface AuthenticatedUser {
  id: string
  email: string
  displayName: string
  systemRole: 'ADMIN' | 'MEMBER'
}

export interface AuthService {
  login(email: string, password: string): Promise<{
    user: AuthenticatedUser
    rawToken: string
    expiresAt: Date
  } | null>
  getUserByRawToken(rawToken: string): Promise<AuthenticatedUser | null>
  logout(rawToken: string): Promise<void>
}

const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
})

export async function registerAuthRoutes(
  app: FastifyInstance,
  authService: AuthService,
  nodeEnvironment: 'development' | 'test' | 'production',
) {
  app.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(401).send({
        code: 'INVALID_CREDENTIALS',
        message: '邮箱或密码错误',
      })
    }

    const result = await authService.login(parsed.data.email, parsed.data.password)
    if (!result) {
      return reply.code(401).send({
        code: 'INVALID_CREDENTIALS',
        message: '邮箱或密码错误',
      })
    }

    reply.setCookie(
      sessionCookieName,
      result.rawToken,
      sessionCookieOptions(nodeEnvironment),
    )
    return { user: result.user }
  })

  app.get('/auth/me', async (request, reply) => {
    const rawToken = request.cookies[sessionCookieName]
    if (!rawToken) {
      return reply.code(401).send({ code: 'UNAUTHENTICATED', message: '请先登录' })
    }

    const user = await authService.getUserByRawToken(rawToken)
    if (!user) {
      return reply.code(401).send({ code: 'UNAUTHENTICATED', message: '登录已失效' })
    }

    return { user }
  })

  app.post('/auth/logout', async (request, reply) => {
    const rawToken = request.cookies[sessionCookieName]
    if (rawToken) await authService.logout(rawToken)
    reply.clearCookie(sessionCookieName, { path: '/' })
    return reply.code(204).send()
  })
}
