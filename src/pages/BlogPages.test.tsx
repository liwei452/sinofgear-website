import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { articles } from '@/data/articles'
import { LANGUAGE_STORAGE_KEY } from '@/i18n/language'

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('blog pages', () => {
  beforeEach(() => localStorage.clear())

  it('renders the insights index and all six article cards', () => {
    renderAt('/blog')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Gear Sourcing Insights' }),
    ).toBeVisible()
    expect(screen.getAllByTestId('article-card')).toHaveLength(6)
  })

  it('renders an article with contents, FAQ, product links, and RFQ CTA', () => {
    renderAt(`/blog/${articles[0].slug}`)

    expect(screen.getByRole('heading', { level: 1, name: articles[0].title })).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 2, name: 'Frequently asked questions' })).toBeVisible()
    expect(within(screen.getByLabelText('Related products')).getByRole('link', { name: 'Custom Gears' })).toHaveAttribute(
      'href',
      '/products/custom-gears',
    )
    expect(screen.getByRole('link', { name: 'Request drawing review' })).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  it('shows the English notice in a non-English site mode', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de')
    renderAt('/blog')

    expect(
      screen.getByText('Technical articles are currently available in English.'),
    ).toBeVisible()
  })

  it('uses the not-found experience for an unknown article slug', () => {
    renderAt('/blog/not-a-real-article')

    expect(screen.getByRole('heading', { level: 1, name: 'Page Not Found' })).toBeVisible()
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
  })
})
