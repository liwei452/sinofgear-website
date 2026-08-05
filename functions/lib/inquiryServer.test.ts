import { describe, expect, it, vi } from 'vitest'
import {
  InquiryDeliveryError,
  InquiryValidationError,
  buildInquiryEmail,
  parseInquiryForm,
  sendInquiryEmail,
  type InquiryEnv,
  type SubmissionMeta,
} from './inquiryServer'

const env: InquiryEnv = {
  RESEND_API_KEY: 're_test_key',
  INQUIRY_TO_EMAIL: '452900431@qq.com',
  INQUIRY_FROM_EMAIL: 'Sinoform RFQ <inquiries@sinfogear.com>',
}

const meta: SubmissionMeta = {
  reference: 'SF-TEST123',
  receivedAt: '2026-08-05T00:00:00.000Z',
  edgeCountry: 'DE',
}

function validForm(overrides: Record<string, string | File> = {}) {
  const form = new FormData()
  const values: Record<string, string | File> = {
    name: 'Alex Morgan',
    company: 'Northstar Motion',
    email: 'alex@example.com',
    country: 'Germany',
    product: 'spur-gears',
    quantity: '500 pcs',
    material: 'Alloy steel',
    message: 'Please review this gear.',
    sourceUrl: 'https://sinfogear.com/contact?product=spur-gears',
    website: '',
    ...overrides,
  }
  for (const [key, value] of Object.entries(values)) form.set(key, value)
  return form
}

describe('server inquiry parsing', () => {
  it('rejects a missing required field independently of the browser', () => {
    expect(() => parseInquiryForm(validForm({ email: '' }))).toThrow(InquiryValidationError)
  })

  it('rejects an unsupported attachment extension', () => {
    expect(() =>
      parseInquiryForm(validForm({ drawing: new File(['image'], 'gear.png', { type: 'image/png' }) })),
    ).toThrow(InquiryValidationError)
  })

  it('rejects an attachment larger than 15 MB', () => {
    const drawing = new File([new Uint8Array(15 * 1024 * 1024 + 1)], 'gear.pdf', {
      type: 'application/pdf',
    })
    expect(() => parseInquiryForm(validForm({ drawing }))).toThrow(InquiryValidationError)
  })

  it('marks a filled honeypot as a bot submission', () => {
    expect(parseInquiryForm(validForm({ website: 'https://bot.example' })).isBot).toBe(true)
  })
})

describe('inquiry email composition', () => {
  it('escapes customer input and always targets the configured mailbox', async () => {
    const parsed = parseInquiryForm(validForm({ message: '<script>alert(1)</script>' }))
    const email = await buildInquiryEmail(parsed, meta, env)

    expect(email.to).toEqual(['452900431@qq.com'])
    expect(email.reply_to).toBe('alex@example.com')
    expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(email.html).not.toContain('<script>')
    expect(email.subject).toContain('SF-TEST123')
  })

  it('turns an attachment into Resend base64 content', async () => {
    const parsed = parseInquiryForm(
      validForm({ drawing: new File(['abc'], 'gear.step', { type: 'application/octet-stream' }) }),
    )
    const email = await buildInquiryEmail(parsed, meta, env)

    expect(email.attachments).toEqual([{ filename: 'gear.step', content: 'YWJj' }])
  })
})

describe('Resend delivery adapter', () => {
  it('sends the provider request with bearer authentication', async () => {
    const fetcher = vi.fn(async () => Response.json({ id: 'email_123' }))
    const payload = await buildInquiryEmail(parseInquiryForm(validForm()), meta, env)

    await sendInquiryEmail(payload, env, fetcher)

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer re_test_key' }),
      }),
    )
  })

  it('maps provider rejection to an internal delivery error', async () => {
    const fetcher = vi.fn(async () => Response.json({ message: 'invalid key' }, { status: 401 }))
    const payload = await buildInquiryEmail(parseInquiryForm(validForm()), meta, env)

    await expect(sendInquiryEmail(payload, env, fetcher)).rejects.toBeInstanceOf(
      InquiryDeliveryError,
    )
  })
})
