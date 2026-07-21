import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import Fastify from 'fastify'
import { registerAuthRoutes, type AuthService } from './routes/auth.js'
import { registerFileRoutes, type SqliteFileRepository } from './routes/files.js'
import { registerProjectRoutes, type ProjectRepository } from './routes/projects.js'
import type { FileStorage } from './storage/fileStorage.js'

const unavailableAuthService: AuthService = {
  async login() { return null },
  async getUserByRawToken() { return null },
  async logout() {},
}

export interface BuildAppOptions {
  authService?: AuthService
  projectRepository?: ProjectRepository
  fileRepository?: SqliteFileRepository
  fileStorage?: FileStorage
}

export async function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: false })

  await app.register(cookie)
  await app.register(multipart)

  app.get('/health', async () => ({ status: 'ok' as const }))
  await registerAuthRoutes(
    app,
    options.authService ?? unavailableAuthService,
    process.env.NODE_ENV === 'production' ? 'production' : 'test',
  )
  if (options.projectRepository) {
    await registerProjectRoutes(app, options.authService ?? unavailableAuthService, options.projectRepository)
  }
  if (options.projectRepository && options.fileRepository && options.fileStorage) {
    await registerFileRoutes(
      app,
      options.authService ?? unavailableAuthService,
      options.projectRepository,
      options.fileRepository,
      options.fileStorage,
    )
  }

  return app
}
