import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import Header from './Header'
import { LanguageProvider } from '@/i18n/LanguageContext'

function renderHeader() {
  return render(
    <MemoryRouter>
      <LanguageProvider detectCountry={async () => undefined}>
        <Header />
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('Header', () => {
  it('exposes the buyer journey and the drawing-review conversion', async () => {
    const user = userEvent.setup()
    renderHeader()

    expect(screen.getByRole('link', { name: 'Manufacturing' })).toHaveAttribute('href', '/capabilities')
    expect(screen.getByRole('link', { name: 'Quality' })).toHaveAttribute('href', '/quality')
    expect(screen.getByRole('link', { name: 'Resources' })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: 'Company' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Submit Drawing' })).toHaveAttribute('href', '/contact')

    await user.click(screen.getByRole('button', { name: 'Products' }))
    expect(await screen.findByRole('menuitem', { name: 'Spur Gears' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Timing Pulleys' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Applications' }))
    expect(await screen.findByRole('menuitem', { name: /New custom gear project/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Replacement gear/ })).toBeInTheDocument()
  })
})
