import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { products } from '@/data/products'
import { articles } from '@/data/articles'

const prohibitedClaims = [
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
    ['/about', '/assets/factory-showroom.webp'],
    ['/capabilities', '/assets/factory-production-floor.webp'],
    ['/quality', '/assets/factory-workshop.webp'],
  ])('uses approved factory evidence at %s', (route, imagePath) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )

    expect(document.querySelector(`img[src="${imagePath}"]`)).toBeInTheDocument()
  })

  it('publishes email contact details without a visible or clickable phone number', () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <App />
      </MemoryRouter>,
    )

    expect(document.body).not.toHaveTextContent('inquiries@sinfogear.com')
    expect(document.body).toHaveTextContent('admin@sinofgears.onmicrosoft.com')
    expect(document.body).toHaveTextContent('Li Jin')
    expect(document.body).not.toHaveTextContent('+86 159 7312 7000')
    expect(document.body).not.toHaveTextContent('+86 731 8888 4918')
    expect(document.body).not.toHaveTextContent('+86 731 8686 7700')
    expect(document.querySelector('a[href^="tel:"]')).not.toBeInTheDocument()
  })

  it('does not publish excluded third-party branding in product data', () => {
    expect(
      products.some((product) => JSON.stringify(product).toLowerCase().includes('nitta')),
    ).toBe(false)
  })

  it('keeps worm gear claims conditional on engineering review', () => {
    const product = products.find(({ slug }) => slug === 'worm-gears')
    expect(product).toBeDefined()
    expect(JSON.stringify(product)).toMatch(/drawing review|project review|when specified/i)
    expect(JSON.stringify(product)).not.toMatch(/guaranteed|always|unlimited/i)
  })

  it('keeps unverified certifications and guarantees out of technical articles', () => {
    const prohibitedArticleClaims = [
      /AS9100/i,
      /Nadcap/i,
      /IATF\s*16949/i,
      /medical[- ]grade/i,
      /aerospace approved/i,
      /guaranteed lead time/i,
      /guaranteed savings/i,
    ]

    for (const article of articles) {
      const content = JSON.stringify(article)
      for (const claim of prohibitedArticleClaims) expect(content).not.toMatch(claim)
      expect(content).toMatch(/drawing review|engineering review/i)
    }
  })

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
