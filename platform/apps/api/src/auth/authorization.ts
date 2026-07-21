export const projectRoles = ['ADMIN', 'MEMBER', 'VIEWER'] as const

export type ProjectRole = (typeof projectRoles)[number]

export function canAccessProject(role: ProjectRole, allowedRoles: readonly ProjectRole[]) {
  return allowedRoles.includes(role)
}

export interface ProjectMembership {
  projectId: string
  userId: string
  role: ProjectRole
}

export interface ProjectMembershipReader {
  findMembership(userId: string, projectId: string): Promise<ProjectMembership | null>
}

export class ProjectAccessDeniedError extends Error {
  readonly code = 'PROJECT_ACCESS_DENIED'

  constructor() {
    super('没有权限访问该工厂项目')
  }
}

export async function requireProjectRole(
  reader: ProjectMembershipReader,
  userId: string,
  projectId: string,
  allowedRoles: readonly ProjectRole[],
) {
  const membership = await reader.findMembership(userId, projectId)
  if (!membership || !canAccessProject(membership.role, allowedRoles)) {
    throw new ProjectAccessDeniedError()
  }
  return membership
}
