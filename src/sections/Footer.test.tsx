import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import Footer from './Footer'

describe('Footer', () => {
  it('publishes the legal company name and display-only email', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    )

    expect(screen.getByText('Changsha Xingfeng Transmission Machinery Co., Ltd.'))
      .toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'info@sinof.net' }))
      .toHaveAttribute('href', 'mailto:info@sinof.net')
  })
})
