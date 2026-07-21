import type { AppDatabase } from '../db/database.js'
import {
  projectRoles,
  type ProjectMembership,
  type ProjectMembershipReader,
  type ProjectRole,
} from './authorization.js'

interface MembershipRow {
  project_id: string
  user_id: string
  role: string
}

function isProjectRole(value: string): value is ProjectRole {
  return projectRoles.some((role) => role === value)
}

export class SqliteProjectMembershipReader implements ProjectMembershipReader {
  constructor(private readonly database: AppDatabase) {}

  async findMembership(userId: string, projectId: string): Promise<ProjectMembership | null> {
    const row = this.database.prepare(`
      SELECT project_id, user_id, role
      FROM project_memberships
      WHERE user_id = ? AND project_id = ?
    `).get(userId, projectId) as unknown as MembershipRow | undefined

    if (!row || !isProjectRole(row.role)) return null
    return { projectId: row.project_id, userId: row.user_id, role: row.role }
  }
}
