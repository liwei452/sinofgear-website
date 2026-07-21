import { randomUUID } from 'node:crypto'
import type { AppDatabase } from './database.js'

export interface SeedDatabaseInput {
  email: string
  password: string
  createPasswordHash: (password: string) => Promise<string>
  now?: () => Date
}

export async function seedDatabase(database: AppDatabase, input: SeedDatabaseInput) {
  const now = (input.now ?? (() => new Date()))().toISOString()
  const email = input.email.toLowerCase()
  const passwordHash = await input.createPasswordHash(input.password)
  database.prepare(`
    INSERT INTO users (id, email, display_name, password_hash, system_role, created_at, updated_at)
    VALUES (?, ?, '管理员', ?, 'ADMIN', ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      display_name = excluded.display_name,
      password_hash = excluded.password_hash,
      system_role = 'ADMIN',
      updated_at = excluded.updated_at
  `).run(randomUUID(), email, passwordHash, now, now)

  const administrator = database.prepare('SELECT id FROM users WHERE email = ?').get(email) as {
    id: string
  }
  const projectId = 'sinoform-pilot'
  database.prepare(`
    INSERT INTO factory_projects (
      id, name, legal_name, primary_contact_name, primary_contact_email,
      export_stage, existing_acquisition_channels, stage, created_at, updated_at
    ) VALUES (?, 'SINOFORM 齿轮工厂', '待工厂确认', '待补充', ?, 'STARTING', '[]', 'PROFILE', ?, ?)
    ON CONFLICT(id) DO NOTHING
  `).run(projectId, email, now, now)
  database.prepare(`
    INSERT INTO project_memberships (id, project_id, user_id, role, created_at)
    VALUES (?, ?, ?, 'ADMIN', ?)
    ON CONFLICT(project_id, user_id) DO UPDATE SET role = 'ADMIN'
  `).run(randomUUID(), projectId, administrator.id, now)
}
