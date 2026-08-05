import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { LANGUAGE_STORAGE_KEY } from '@/i18n/language'
import ContactPage from './ContactPage'

async function completeRequiredFields() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/name/i), 'Alex Morgan')
  await user.type(screen.getByLabelText(/company/i), 'Northstar Motion')
  await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
  await user.selectOptions(screen.getByLabelText(/country/i), 'Germany')
  await user.type(screen.getByLabelText(/message/i), 'Please review this gear for our packaging line.')
  return user
}

describe('contact page inquiry flow', () => {
  it('shows the company email as a direct contact option', () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <ContactPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'info@sinof.net' }))
      .toHaveAttribute('href', 'mailto:info@sinof.net')
  })

  it('prefills a product from the URL and shows success after valid submission', async () => {
    const submitter = vi.fn(async () => ({
      reference: 'SF-REAL1',
      receivedAt: '2026-08-05T00:00:00.000Z',
    }))
    render(
      <MemoryRouter initialEntries={['/contact?product=helical-gears']}>
        <ContactPage submitter={submitter} />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/product/i)).toHaveValue('helical-gears')
    const user = await completeRequiredFields()
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(await screen.findByRole('heading', { name: 'Inquiry received' })).toBeInTheDocument()
    expect(screen.getByText(/SF-/)).toBeInTheDocument()
  })

  it('shows a retry action when the production service fails', async () => {
    render(
      <MemoryRouter initialEntries={['/contact?product=spur-gears']}>
        <ContactPage
          submitter={async () => {
            throw new Error('We could not submit your inquiry. Please try again.')
          }}
        />
      </MemoryRouter>,
    )

    const user = await completeRequiredFields()
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not submit your inquiry. Please try again.',
    )
    expect(screen.getByRole('button', { name: /retry submission/i })).toBeInTheDocument()
  })

  it('passes the selected engineering drawing and empty honeypot to the submitter', async () => {
    const submitter = vi.fn(async () => ({
      reference: 'SF-FILE1',
      receivedAt: '2026-08-05T00:00:00.000Z',
    }))
    render(
      <MemoryRouter initialEntries={['/contact?product=spur-gears']}>
        <ContactPage submitter={submitter} />
      </MemoryRouter>,
    )

    const user = await completeRequiredFields()
    const drawing = new File(['drawing'], 'gear.step', {
      type: 'application/octet-stream',
    })
    await user.upload(screen.getByLabelText(/drawing/i), drawing)
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(submitter).toHaveBeenCalledWith(
      expect.objectContaining({ drawingFile: drawing, website: '' }),
    )
  })

  it('blocks an unsupported drawing before calling the submitter', async () => {
    const submitter = vi.fn()
    render(
      <MemoryRouter initialEntries={['/contact?product=spur-gears']}>
        <ContactPage submitter={submitter} />
      </MemoryRouter>,
    )

    const user = await completeRequiredFields()
    const uploader = userEvent.setup({ applyAccept: false })
    await uploader.upload(
      screen.getByLabelText(/drawing/i),
      new File(['image'], 'gear.png', { type: 'image/png' }),
    )
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(screen.getByText('Upload a PDF, STEP, STP, IGES, IGS, DXF, or DWG file.')).toBeInTheDocument()
    expect(submitter).not.toHaveBeenCalled()
  })

  it('localizes the inquiry form from the active language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ja')
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <LanguageProvider detectCountry={() => Promise.resolve(undefined)}>
          <ContactPage />
        </LanguageProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: '歯車プロジェクトについてお聞かせください' })).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'お問い合わせを送信' })).toBeInTheDocument()
  })
})
