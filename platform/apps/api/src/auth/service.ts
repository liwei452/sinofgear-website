import { compare } from 'bcryptjs'
import { createSessionToken, hashSessionToken, sessionLifetimeSeconds } from './session.js'
import type { AuthService, AuthenticatedUser } from '../routes/auth.js'

export interface StoredUser extends AuthenticatedUser {
  passwordHash: string
}

export interface UserSessionRepository {
  findUserByEmail(email: string): Promise<StoredUser | null>
  createSession(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>
  findUserBySessionHash(tokenHash: string, now: Date): Promise<StoredUser | null>
  deleteSessionByHash(tokenHash: string): Promise<void>
}

export interface AuthServiceDependencies {
  now?: () => Date
  verifyPassword?: (password: string, passwordHash: string) => Promise<boolean>
  createRawToken?: () => string
}

function publicUser(user: StoredUser): AuthenticatedUser {
  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

export class DatabaseAuthService implements AuthService {
  private readonly now: () => Date
  private readonly verifyPassword: (password: string, passwordHash: string) => Promise<boolean>
  private readonly createRawToken: () => string

  constructor(
    private readonly repository: UserSessionRepository,
    dependencies: AuthServiceDependencies = {},
  ) {
    this.now = dependencies.now ?? (() => new Date())
    this.verifyPassword = dependencies.verifyPassword ?? compare
    this.createRawToken = dependencies.createRawToken ?? createSessionToken
  }

  async login(email: string, password: string) {
    const user = await this.repository.findUserByEmail(email)
    if (!user || !(await this.verifyPassword(password, user.passwordHash))) return null

    const rawToken = this.createRawToken()
    const tokenHash = hashSessionToken(rawToken)
    const expiresAt = new Date(this.now().getTime() + sessionLifetimeSeconds * 1000)
    await this.repository.createSession({ userId: user.id, tokenHash, expiresAt })

    return { user: publicUser(user), rawToken, expiresAt }
  }

  async getUserByRawToken(rawToken: string) {
    const user = await this.repository.findUserBySessionHash(
      hashSessionToken(rawToken),
      this.now(),
    )
    return user ? publicUser(user) : null
  }

  async logout(rawToken: string) {
    await this.repository.deleteSessionByHash(hashSessionToken(rawToken))
  }
}
