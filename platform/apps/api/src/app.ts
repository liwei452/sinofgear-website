import cookie from '@fastify/cookie'
import Fastify from 'fastify'
import { registerAuthRoutes, type AuthService } from './routes/auth.js'

const unavailableAuthService: AuthService = {
  async login() { return null },
  async getUserByRawToken() { return null },
  async logout() {},
}

export interface BuildAppOptions {
  authService?: AuthService
}

export async function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: false })

  await app.register(cookie)

  app.get('/health', async () => ({ status: 'ok' as const }))
  await registerAuthRoutes(
    app,
    options.authService ?? unavailableAuthService,
    process.env.NODE_ENV === 'production' ? 'production' : 'test',
  )

  return app
}
