import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CapabilityReviewPage } from './CapabilityReviewPage'

afterEach(() => vi.unstubAllGlobals())

describe('CapabilityReviewPage', () => {
  it('shows evidence before allowing confirmation', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      groups: [{ category: 'PRODUCT', items: [{
        id: 'cap-1', name: '斜齿轮', value: '支持按图加工', confidence: 0.91,
        reviewStatus: 'PENDING_REVIEW', evidenceQuote: 'Custom helical gears according to drawing',
        sourceLocator: '第 4 页', sourceFilename: 'catalog.pdf', history: [],
      }] }], membershipRole: 'MEMBER',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))
    const user = userEvent.setup()
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={['/projects/project-1/capabilities']}><Routes><Route path="/projects/:projectId/capabilities" element={<CapabilityReviewPage />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(await screen.findByText('Custom helical gears according to drawing')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '确认能力' }))
    expect(screen.getByLabelText('确认依据')).toBeRequired()
  })
})
