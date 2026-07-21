import { describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import { openDatabase } from '../db/database.js'
import { runMigrations } from '../db/migrations.js'
import { calculateProjectCompleteness, getNextAction, SqliteProjectRepository } from './projects.js'
import type { AuthService } from './auth.js'

const member = {
  id: 'user-member',
  email: 'member@example.com',
  displayName: '项目成员',
  systemRole: 'MEMBER' as const,
}

function authService(user = member): AuthService {
  return {
    async login() { return null },
    async getUserByRawToken(token) { return token === 'valid-token' ? user : null },
    async logout() {},
  }
}

function seedProjects() {
  const database = openDatabase(':memory:')
  runMigrations(database)
  const now = '2026-07-21T00:00:00.000Z'
  database.prepare(`
    INSERT INTO users (id, email, display_name, password_hash, system_role, created_at, updated_at)
    VALUES (?, ?, ?, 'hash', 'MEMBER', ?, ?)
  `).run(member.id, member.email, member.displayName, now, now)
  for (const [id, name] of [['project-1', 'SINOFORM 齿轮工厂'], ['project-2', '其他工厂']]) {
    database.prepare(`
      INSERT INTO factory_projects (
        id, name, legal_name, primary_contact_name, primary_contact_email,
        export_stage, existing_acquisition_channels, stage, created_at, updated_at
      ) VALUES (?, ?, ?, '联系人', 'contact@example.com', 'STARTING', '[]', 'PROFILE', ?, ?)
    `).run(id, name, name, now, now)
  }
  database.prepare(`
    INSERT INTO project_memberships (id, project_id, user_id, role, created_at)
    VALUES ('membership-1', 'project-1', ?, 'MEMBER', ?)
  `).run(member.id, now)
  return database
}

describe('calculateProjectCompleteness', () => {
  it('awards twenty-five points for each completed milestone', () => {
    expect(calculateProjectCompleteness({
      hasProfile: true,
      fileCount: 1,
      reviewedCapabilityCount: 0,
      primaryMarketCount: 0,
    })).toBe(50)
  })
})

describe('getNextAction', () => {
  it('reports the next blocked action in priority order', () => {
    expect(getNextAction({ failedTaskCount: 0, fileCount: 1, extractionPendingCount: 0, pendingCapabilities: 3, insufficientEvidenceCount: 0, primaryMarketCount: 0 })).toBe('审核 3 条待确认能力')
    expect(getNextAction({ failedTaskCount: 0, fileCount: 1, extractionPendingCount: 0, pendingCapabilities: 0, insufficientEvidenceCount: 0, primaryMarketCount: 0 })).toBe('选择主验证市场方向')
  })
})

describe('project routes', () => {
  it('returns only projects assigned to a member', async () => {
    const database = seedProjects()
    const app = await buildApp({
      authService: authService(),
      projectRepository: new SqliteProjectRepository(database),
    })
    const response = await app.inject({
      method: 'GET',
      url: '/projects',
      headers: { cookie: 'workbench_session=valid-token' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().items.map((item: { name: string }) => item.name))
      .toEqual(['SINOFORM 齿轮工厂'])
    await app.close()
    database.close()
  })

  it('rejects unauthenticated project access', async () => {
    const database = seedProjects()
    const app = await buildApp({
      authService: authService(),
      projectRepository: new SqliteProjectRepository(database),
    })
    const response = await app.inject({ method: 'GET', url: '/projects' })

    expect(response.statusCode).toBe(401)
    expect(response.json().code).toBe('UNAUTHENTICATED')
    await app.close()
    database.close()
  })
})
