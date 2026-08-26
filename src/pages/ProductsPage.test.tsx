import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { productSlugs } from '@/data/products'
import ProductsPage from './ProductsPage'

describe('ProductsPage', () => {
  it('groups every product once under the three buyer-facing families', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>,
    )

    const customHeading = screen.getByRole('heading', { name: 'Custom gears' })
    const timingHeading = screen.getByRole('heading', { name: 'Timing-drive components' })
    expect(customHeading.compareDocumentPosition(timingHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Industrial belts' })).toBeInTheDocument()

    const productCards = [...container.querySelectorAll<HTMLElement>('[data-product-slug]')]
    expect(productCards).toHaveLength(productSlugs.length)
    expect(productCards.map((card) => card.dataset.productSlug).sort()).toEqual([...productSlugs].sort())
  })
})
