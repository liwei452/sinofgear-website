import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import HomePage from './HomePage'

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage buyer journey', () => {
  it('moves from supplier fit to product, application, evidence, and drawing review', () => {
    const { container } = renderHomePage()

    expect(screen.getByRole('heading', { level: 1, name: 'Custom Gears Built Around Your Drawing' })).toBeInTheDocument()
    const drawingLinks = screen.getAllByRole('link', { name: 'Submit Drawing' })
    expect(drawingLinks.every((link) => link.getAttribute('href') === '/contact')).toBe(true)
    expect(screen.getByRole('link', { name: 'Find by product' })).toHaveAttribute('href', '/products')
    expect(screen.getByRole('link', { name: 'Find by application' })).toHaveAttribute('href', '/industries/industrial_machinery/custom-gears')

    expect(screen.getByText('Founded in 2008')).toBeInTheDocument()
    expect(screen.getByText('Approximately 7,000 square meters')).toBeInTheDocument()
    expect(screen.getAllByText('Gear accuracy up to GB Grade 5').length).toBeGreaterThan(0)

    expect(screen.getByRole('heading', { name: 'Choose a transmission family' })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-product-family]')).toHaveLength(3)
    expect(screen.getByRole('heading', { name: 'Start with the project need' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Manufacturing evidence' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Quality planning before production' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'From Drawing to a Clear RFQ' })).toBeInTheDocument()
  })
})
