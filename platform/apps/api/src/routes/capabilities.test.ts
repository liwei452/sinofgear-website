import { describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import { openDatabase } from '../db/database.js'
import { runMigrations } from '../db/migrations.js'
import { SqliteProjectRepository } from './projects.js'
import { SqliteCapabilityRepository } from './capabilities.js'
import type { AuthService } from './auth.js'

function fixture() {
  const database = openDatabase(':memory:')
  runMigrations(database)
  const now = '2026-07-21T00:00:00.000Z'
  for (const [id, email, name] of [['member', 'member@example.com', '项目成员'], ['viewer', 'viewer@example.com', '只读成员']]) {
    database.prepare(`INSERT INTO users (id,email,display_name,password_hash,system_role,created_at,updated_at) VALUES (?,?,?,'hash','MEMBER',?,?)`)
      .run(id, email, name, now, now)
  }
  database.prepare(`INSERT INTO factory_projects (id,name,legal_name,primary_contact_name,primary_contact_email,export_stage,existing_acquisition_channels,stage,created_at,updated_at) VALUES ('project-1','SINOFORM 齿轮工厂','SINOFORM','联系人','contact@example.com','STARTING','[]','PROFILE',?,?)`).run(now, now)
  database.prepare(`INSERT INTO project_memberships (id,project_id,user_id,role,created_at) VALUES ('m1','project-1','member','MEMBER',?),('m2','project-1','viewer','VIEWER',?)`).run(now, now)
  database.prepare(`INSERT INTO file_assets (id,project_id,logical_name,filename,version,storage_key,content_type,size,checksum,status,uploaded_by_id,created_at) VALUES ('file-1','project-1','catalog.pdf','catalog.pdf',1,'key','application/pdf',12,'sum','UPLOADED','member',?)`).run(now)
  database.prepare(`INSERT INTO capabilities (id,project_id,source_file_id,revision,category,name,value,evidence_quote,source_locator,confidence,review_status,created_at,updated_at) VALUES ('cap-1','project-1','file-1',1,'PRODUCT','斜齿轮','支持按图加工','Custom helical gears according to drawing','第 4 页',0.91,'PENDING_REVIEW',?,?)`).run(now, now)
  const users = {
    member: { id: 'member', email: 'member@example.com', displayName: '项目成员', systemRole: 'MEMBER' as const },
    viewer: { id: 'viewer', email: 'viewer@example.com', displayName: '只读成员', systemRole: 'MEMBER' as const },
  }
  const authService: AuthService = {
    async login() { return null },
    async getUserByRawToken(token) { return users[token as keyof typeof users] ?? null },
    async logout() {},
  }
  return { database, authService }
}

describe('capability review routes', () => {
  it('requires a reason and records the reviewer when confirming', async () => {
    const { database, authService } = fixture()
    const app = await buildApp({ authService, projectRepository: new SqliteProjectRepository(database), capabilityRepository: new SqliteCapabilityRepository(database) })
    const missing = await app.inject({ method: 'PATCH', url: '/projects/project-1/capabilities/cap-1/review', headers: { cookie: 'workbench_session=member' }, payload: { status: 'CONFIRMED', reason: '' } })
    expect(missing.statusCode).toBe(422)
    const response = await app.inject({ method: 'PATCH', url: '/projects/project-1/capabilities/cap-1/review', headers: { cookie: 'workbench_session=member' }, payload: { status: 'CONFIRMED', reason: '工厂负责人在 2026-07-21 访谈中确认' } })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ reviewStatus: 'CONFIRMED', reviewedBy: 'member' })
    expect(database.prepare(`SELECT COUNT(*) AS count FROM capability_reviews WHERE capability_id='cap-1'`).get()).toEqual({ count: 1 })
    await app.close(); database.close()
  })

  it('prevents viewers from reviewing', async () => {
    const { database, authService } = fixture()
    const app = await buildApp({ authService, projectRepository: new SqliteProjectRepository(database), capabilityRepository: new SqliteCapabilityRepository(database) })
    const response = await app.inject({ method: 'PATCH', url: '/projects/project-1/capabilities/cap-1/review', headers: { cookie: 'workbench_session=viewer' }, payload: { status: 'CONFIRMED', reason: '无权操作' } })
    expect(response.statusCode).toBe(403)
    await app.close(); database.close()
  })
})
