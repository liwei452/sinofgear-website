import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectListPage } from './ProjectListPage'

afterEach(() => vi.unstubAllGlobals())

describe('ProjectListPage', () => {
  it('shows project progress and next action', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      items: [{
        id: 'project-1',
        name: 'SINOFORM 齿轮工厂',
        stage: 'PROFILE',
        completeness: 25,
        nextAction: '上传首份产品资料',
        updatedAt: '2026-07-21T00:00:00.000Z',
        membershipRole: 'MEMBER',
      }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter><ProjectListPage /></MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByText('SINOFORM 齿轮工厂')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('上传首份产品资料')).toBeInTheDocument()
  })
})
