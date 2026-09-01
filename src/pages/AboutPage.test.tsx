import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'

describe('About page', () => {
  beforeEach(() => localStorage.clear())

  it('renders approved company facts and direct contact details', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', {
      level: 1,
      name: 'Transmission Manufacturing for Global Industry',
    })).toBeInTheDocument()
    expect(
      screen.getAllByText('Changsha Xingfeng Transmission Machinery Co., Ltd.').length,
    ).toBeGreaterThan(0)
    expect(screen.getByText(/7,000 square meters/i)).toBeInTheDocument()
    expect(screen.getByText(/GB Grade 5/i)).toBeInTheDocument()
    expect(screen.getByText(/ISO 9001/i)).toBeInTheDocument()
    for (const emailLink of screen.getAllByRole('link', { name: 'admin@sinofgears.onmicrosoft.com' })) {
      expect(emailLink).toHaveAttribute('href', 'mailto:admin@sinofgears.onmicrosoft.com')
    }
    expect(document.title).toBe('About SINOF | Transmission Manufacturing Company')
    expect(document.querySelector('link[rel="canonical"]'))
      .toHaveAttribute('href', 'https://sinofgears.com/about')
  })
})
