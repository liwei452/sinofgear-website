import { describe, expect, it } from 'vitest'
import {
  canAccessProject,
  ProjectAccessDeniedError,
  requireProjectRole,
} from './authorization.js'

describe('canAccessProject', () => {
  it('allows a member to edit their project', () => {
    expect(canAccessProject('MEMBER', ['ADMIN', 'MEMBER'])).toBe(true)
  })

  it('prevents a viewer from editing', () => {
    expect(canAccessProject('VIEWER', ['ADMIN', 'MEMBER'])).toBe(false)
  })

  it('allows a viewer to read', () => {
    expect(canAccessProject('VIEWER', ['ADMIN', 'MEMBER', 'VIEWER'])).toBe(true)
  })
})

describe('requireProjectRole', () => {
  it('returns the membership when its role is allowed', async () => {
    const membership = { projectId: 'project-1', userId: 'user-1', role: 'MEMBER' as const }
    const reader = { async findMembership() { return membership } }

    await expect(requireProjectRole(reader, 'user-1', 'project-1', ['ADMIN', 'MEMBER']))
      .resolves.toEqual(membership)
  })

  it('uses the same denial for missing and insufficient membership', async () => {
    const reader = { async findMembership() { return null } }

    await expect(requireProjectRole(reader, 'user-1', 'project-1', ['ADMIN']))
      .rejects.toBeInstanceOf(ProjectAccessDeniedError)
  })
})
