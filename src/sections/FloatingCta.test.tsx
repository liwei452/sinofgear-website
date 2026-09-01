import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FloatingCta from './FloatingCta'

const { useCustomerService } = vi.hoisted(() => ({
  useCustomerService: vi.fn(),
}))

vi.mock('@/customerService/CustomerServiceContext', () => ({
  useCustomerService,
}))

describe('floating drawing call to action', () => {
  beforeEach(() => {
    useCustomerService.mockReturnValue({ status: 'idle' })
  })

  it('stays available before the CRM assistant is initialized', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <FloatingCta />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Submit Drawing' })).toBeInTheDocument()
  })

  it('hides after the CRM launcher is ready so the two fixed controls do not overlap', () => {
    useCustomerService.mockReturnValue({ status: 'ready' })
    render(
      <MemoryRouter initialEntries={['/products']}>
        <FloatingCta />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: 'Submit Drawing' })).not.toBeInTheDocument()
  })
})
