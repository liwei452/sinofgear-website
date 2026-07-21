import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardPage } from './DashboardPage'

describe('DashboardPage', () => {
  it('names the internal workbench', () => {
    render(<DashboardPage />)
    expect(screen.getByRole('heading', { name: 'AI 外贸精准获客工作台' })).toBeInTheDocument()
  })
})
