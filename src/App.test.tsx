import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { LANGUAGE_STORAGE_KEY } from '@/i18n/language'
import App from './App'

function renderRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('public routes', () => {
  beforeEach(() => localStorage.clear())

  it.each([
    ['/about', 'Transmission Manufacturing for Global Industry'],
    ['/products', 'Explore Custom Gear Categories'],
    ['/capabilities', 'A Drawing-Led Manufacturing Review'],
    ['/quality', 'Define Acceptance Criteria Before Production'],
    ['/contact', 'Tell Us About Your Gear Project'],
    ['/blog', 'Gear Sourcing Insights'],
    ['/blog/spur-gear-vs-helical-gear', 'Spur Gear vs Helical Gear: How to Choose'],
    ['/products/spur-gears', 'Custom Spur Gears'],
    ['/missing-page', 'Page Not Found'],
  ])('renders %s as a distinct page', (route, heading) => {
    renderRoute(route)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('localizes visible page content and SEO from a saved language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'zh')
    renderRoute('/products')

    expect(screen.getByRole('heading', { level: 1, name: '探索定制齿轮产品' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '产品' }).length).toBeGreaterThan(0)
    expect(document.title).toBe('定制齿轮产品 | SINOF')
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      expect.stringContaining('直齿轮'),
    )
    expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute('content', 'zh_CN')
  })
})
