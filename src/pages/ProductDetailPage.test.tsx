import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { products } from '@/data/products'
import { LANGUAGE_STORAGE_KEY } from '@/i18n/language'

describe('shared product detail template', () => {
  beforeEach(() => localStorage.clear())

  it.each([
    ['worm-gears', 'Custom Worm Gears and Worm Wheel Sets'],
    ['rubber-timing-belts', 'Rubber Timing Belts'],
    ['polyurethane-timing-belts', 'Polyurethane Timing Belts'],
    ['conveyor-belts', 'Industrial Conveyor Belts'],
    ['flat-belts', 'Flat Transmission Belts'],
    ['round-belts', 'Round Belts'],
  ])('renders the %s configuration through the shared template', (slug, name) => {
    render(
      <MemoryRouter initialEntries={[`/products/${slug}`]}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument()
  })

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

  it('localizes product content and structured data in Chinese', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'zh')
    render(
      <MemoryRouter initialEntries={['/products/spur-gears']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: '定制直齿轮' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '主要特点' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '材料' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '精度' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '定制能力' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '应用行业' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '质量检测' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '常见问题' })).toBeInTheDocument()

    expect(document.getElementById('sinoform-route-schema')?.textContent).toContain('定制直齿轮')
  })
})
