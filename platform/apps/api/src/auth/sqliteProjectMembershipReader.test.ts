import { describe, expect, it } from 'vitest'
import { openDatabase } from '../db/database.js'
import { runMigrations } from '../db/migrations.js'
import { SqliteProjectMembershipReader } from './sqliteProjectMembershipReader.js'

describe('SqliteProjectMembershipReader', () => {
  it('returns the assigned project role', async () => {
    const database = openDatabase(':memory:')
    runMigrations(database)
    const now = '2026-07-21T00:00:00.000Z'
    database.prepare(`
      INSERT INTO users (id, email, display_name, password_hash, system_role, created_at, updated_at)
      VALUES ('user-1', 'member@example.com', '成员', 'hash', 'MEMBER', ?, ?)
    `).run(now, now)
    database.prepare(`
      INSERT INTO factory_projects (
        id, name, legal_name, primary_contact_name, primary_contact_email,
        export_stage, existing_acquisition_channels, stage, created_at, updated_at
      ) VALUES ('project-1', '齿轮工厂', '齿轮工厂', '联系人', 'contact@example.com',
        'STARTING', '[]', 'PROFILE', ?, ?)
    `).run(now, now)
    database.prepare(`
      INSERT INTO project_memberships (id, project_id, user_id, role, created_at)
      VALUES ('membership-1', 'project-1', 'user-1', 'MEMBER', ?)
    `).run(now)

    const reader = new SqliteProjectMembershipReader(database)
    await expect(reader.findMembership('user-1', 'project-1')).resolves.toEqual({
      userId: 'user-1',
      projectId: 'project-1',
      role: 'MEMBER',
    })
    database.close()
  })
})
