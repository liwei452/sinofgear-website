import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { products } from '@/data/products'

describe('shared product detail template', () => {
  it('renders every required spur gear section and a prefilled RFQ link', () => {
    const product = products[0]
    render(
      <MemoryRouter initialEntries={[`/products/${product.slug}`]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: product.name })).toBeInTheDocument()
    expect(screen.getByText(product.valueProposition)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: product.imageAlt })).toHaveAttribute('src', product.image)

    for (const heading of [
      'Main Features',
      'Materials',
      'Precision',
      'Customization',
      'Application Industries',
      'Quality Inspection',
      'Frequently Asked Questions',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    }

    expect(screen.getByText(product.features[0])).toBeInTheDocument()
    expect(screen.getByText(product.materials[0])).toBeInTheDocument()
    expect(screen.getByText(product.precision)).toBeInTheDocument()
    expect(screen.getByText(product.customization[0])).toBeInTheDocument()
    expect(screen.getByText(product.industries[0])).toBeInTheDocument()
    expect(screen.getByText(product.inspection[0])).toBeInTheDocument()
    expect(screen.getByText(product.faq[0].question)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /request a quote/i })[0]).toHaveAttribute(
      'href',
      `/contact?product=${product.slug}`,
    )
    expect(screen.getByLabelText('Breadcrumb')).toHaveTextContent('Products')
  })
})
