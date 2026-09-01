import { render, screen, waitFor } from '@testing-library/react'
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
  await user.type(screen.getByLabelText(/country/i), 'Germany')
  const product = screen.getByLabelText(/product/i) as HTMLInputElement
  if (!product.value) await user.type(product, 'Custom spur gear')
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

    expect(screen.getByRole('link', { name: 'admin@sinofgears.onmicrosoft.com' }))
      .toHaveAttribute('href', 'mailto:admin@sinofgears.onmicrosoft.com')
    expect(document.body).not.toHaveTextContent('inquiries@sinfogear.com')
  })

  it('exposes native form semantics for browsers and assistive technology', () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <ContactPage />
      </MemoryRouter>,
    )

    const form = screen.getByRole('form', { name: 'Request a custom gear quote' })
    expect(form).toHaveAttribute('method', 'post')
    expect(form).toHaveAttribute('action', '/api/inquiries')
    expect(form).toHaveAttribute('enctype', 'multipart/form-data')

    for (const name of ['name', 'company', 'email', 'country', 'product', 'message']) {
      expect(form.querySelector(`[name="${name}"]`)).toBeRequired()
    }
    for (const name of ['whatsapp', 'quantity', 'material', 'drawing', 'website']) {
      expect(form.querySelector(`[name="${name}"]`)).toBeInTheDocument()
    }

    expect(screen.getByLabelText(/country/i)).toHaveAttribute('maxlength', '120')
    expect(screen.getByLabelText(/product/i)).toHaveAttribute('maxlength', '80')
    expect(screen.getByLabelText(/material/i)).toHaveAttribute('maxlength', '120')
    expect(screen.getByLabelText(/whatsapp/i)).toHaveAttribute('type', 'tel')
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('explains drawing delivery, repository handling, and NDA availability', () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <ContactPage />
      </MemoryRouter>,
    )

    expect(document.body).toHaveTextContent(/uploaded files are delivered to our business inbox and CRM/i)
    expect(document.body).toHaveTextContent(/retained only as needed for quotation/i)
    expect(document.body).toHaveTextContent(/contact admin@sinofgears.onmicrosoft.com to request deletion/i)
    expect(document.body).toHaveTextContent(/NDA/i)
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

    expect(screen.getByLabelText(/product/i)).toHaveValue('Helical Gears')
    const user = await completeRequiredFields()
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(await screen.findByRole('heading', { name: 'Inquiry received' })).toBeInTheDocument()
    expect(screen.getByText(/SF-/)).toBeInTheDocument()
  })

  it('shows a retry action when the production service fails', async () => {
    const crmSubmitter = vi.fn().mockResolvedValue({ accepted: true, created: true })
    render(
      <MemoryRouter initialEntries={['/contact?product=spur-gears']}>
        <ContactPage
          submitter={async () => {
            throw new Error('We could not submit your inquiry. Please try again.')
          }}
          crmSubmitter={crmSubmitter}
        />
      </MemoryRouter>,
    )

    const user = await completeRequiredFields()
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not submit your inquiry. Please try again.',
    )
    expect(screen.getByRole('button', { name: /retry submission/i })).toBeInTheDocument()
    expect(crmSubmitter).not.toHaveBeenCalled()
  })

  it('keeps the confirmed inquiry successful when the CRM mirror is unavailable', async () => {
    const submitter = vi.fn(async () => ({
      reference: 'SF-CRM1',
      receivedAt: '2026-08-05T00:00:00.000Z',
    }))
    const crmSubmitter = vi.fn().mockRejectedValue(new Error('CRM offline'))
    render(
      <MemoryRouter initialEntries={['/contact?product=spur-gears']}>
        <ContactPage submitter={submitter} crmSubmitter={crmSubmitter} />
      </MemoryRouter>,
    )

    const user = await completeRequiredFields()
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(await screen.findByRole('heading', { name: 'Inquiry received' })).toBeInTheDocument()
    expect(crmSubmitter).toHaveBeenCalledWith(
      { business_email: ['alex@example.com'] },
      { pageURL: window.location.href },
    )
  })

  it('passes the selected engineering drawing and empty honeypot to the submitter', async () => {
    const submitter = vi.fn(async () => ({
      reference: 'SF-FILE1',
      receivedAt: '2026-08-05T00:00:00.000Z',
    }))
    const crmSubmitter = vi.fn().mockResolvedValue({ accepted: true, created: true })
    render(
      <MemoryRouter initialEntries={['/contact?product=spur-gears']}>
        <ContactPage submitter={submitter} crmSubmitter={crmSubmitter} />
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
    await waitFor(() => expect(crmSubmitter).toHaveBeenCalledWith(
      { business_email: ['alex@example.com'] },
      {
        pageURL: window.location.href,
        attachments: { files: [drawing] },
      },
    ))
  })

  it('accepts buyer-written sourcing details and an optional WhatsApp number', async () => {
    const submitter = vi.fn(async () => ({
      reference: 'SF-FREETEXT1',
      receivedAt: '2026-08-05T00:00:00.000Z',
    }))
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <ContactPage submitter={submitter} />
      </MemoryRouter>,
    )

    const user = await completeRequiredFields()
    await user.clear(screen.getByLabelText(/country/i))
    await user.type(screen.getByLabelText(/country/i), 'Réunion')
    await user.clear(screen.getByLabelText(/product/i))
    await user.type(screen.getByLabelText(/product/i), 'Custom ring gear for kiln drive')
    await user.type(screen.getByLabelText(/material/i), '42CrMo4 per EN 10083')
    await user.type(screen.getByLabelText(/whatsapp/i), '+49 123 456789')
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(submitter).toHaveBeenCalledWith(expect.objectContaining({
      country: 'Réunion',
      product: 'Custom ring gear for kiln drive',
      material: '42CrMo4 per EN 10083',
      whatsapp: '+49 123 456789',
    }))
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

    expect(screen.getByRole('heading', { level: 1, name: '技術レビューと見積りを依頼' })).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'お問い合わせを送信' })).toBeInTheDocument()
  })
})
