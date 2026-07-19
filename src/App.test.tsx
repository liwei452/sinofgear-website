import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App'

function renderRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('public routes', () => {
  it.each([
    ['/products', 'Explore Custom Gear Categories'],
    ['/capabilities', 'A Drawing-Led Manufacturing Review'],
    ['/quality', 'Define Acceptance Criteria Before Production'],
    ['/contact', 'Tell Us About Your Gear Project'],
    ['/products/spur-gears', 'Custom Spur Gears'],
    ['/missing-page', 'Page Not Found'],
  ])('renders %s as a distinct page', (route, heading) => {
    renderRoute(route)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })
})
