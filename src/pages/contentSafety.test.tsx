import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '@/App'

const prohibitedClaims = [
  'ISO 9001',
  'IATF',
  '45+',
  '120+',
  '8M+',
  '98.6%',
  'No. 88',
  '8888 6666',
  'sales@sinoform',
]

describe('verified public content', () => {
  it.each([
    ['/', 'From Drawing to a Clear RFQ'],
    ['/capabilities', 'Technical Review Before Quotation'],
    ['/quality', 'Inspection Planning'],
  ])('renders safe, substantive content at %s', (route, expectedHeading) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: expectedHeading })).toBeInTheDocument()
    for (const claim of prohibitedClaims) {
      expect(document.body).not.toHaveTextContent(claim)
    }
  })
})
