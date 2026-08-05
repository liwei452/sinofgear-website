import { describe, expect, it, vi } from 'vitest'
import type { InquiryEnv } from '../lib/inquiryServer'
import { handleInquiryRequest } from './inquiries'

const env: InquiryEnv = {
  RESEND_API_KEY: 're_test_key',
  INQUIRY_TO_EMAIL: '452900431@qq.com',
  INQUIRY_FROM_EMAIL: 'Sinoform RFQ <inquiries@sinfogear.com>',
}

function form(overrides: Record<string, string | File> = {}) {
  const body = new FormData()
  const values: Record<string, string | File> = {
    name: 'Alex Morgan',
    company: 'Northstar Motion',
    email: 'alex@example.com',
    country: 'Germany',
    product: 'spur-gears',
    quantity: '500 pcs',
    material: 'Alloy steel',
    message: 'Please review this gear.',
    sourceUrl: 'https://sinfogear.com/contact',
    website: '',
    ...overrides,
  }
  for (const [key, value] of Object.entries(values)) body.set(key, value)
  return body
}

function context(
  body: FormData,
  options: { method?: string; environment?: InquiryEnv } = {},
) {
  const request = {
    method: options.method ?? 'POST',
    headers: new Headers({ 'content-type': 'multipart/form-data; boundary=test' }),
    formData: async () => body,
    cf: { country: 'DE' },
  } as unknown as Request & { cf?: { country?: string } }
  return { request, env: options.environment ?? env }
}

describe('Cloudflare inquiry endpoint', () => {
  it('returns a receipt only after the provider accepts the email', async () => {
    const fetcher = vi.fn(async () => Response.json({ id: 'email_123' }))

    const response = await handleInquiryRequest(context(form()), fetcher)
    const result = (await response.json()) as { reference: string; receivedAt: string }

    expect(response.status).toBe(200)
    expect(result.reference).toMatch(/^SF-[A-Z0-9]+$/)
    expect(Date.parse(result.receivedAt)).not.toBeNaN()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('rejects non-POST methods', async () => {
    const response = await handleInquiryRequest(context(form(), { method: 'GET' }))
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
  })

  it('rejects invalid multipart data with a safe response', async () => {
    const response = await handleInquiryRequest(context(form({ email: '' })))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid inquiry.' })
  })

  it('rejects unsupported request content types', async () => {
    const requestContext = context(form())
    requestContext.request.headers.set('content-type', 'application/json')
    const response = await handleInquiryRequest(requestContext)
    expect(response.status).toBe(400)
  })

  it('accepts a honeypot submission without calling the provider', async () => {
    const fetcher = vi.fn()
    const response = await handleInquiryRequest(
      context(form({ website: 'https://bot.example' })),
      fetcher,
    )

    expect(response.status).toBe(200)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('returns a safe delivery failure when configuration is missing', async () => {
    const response = await handleInquiryRequest(
      context(form(), {
        environment: { ...env, RESEND_API_KEY: '' },
      }),
    )
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'Inquiry delivery failed.' })
  })

  it('returns a safe delivery failure when Resend rejects the email', async () => {
    const fetcher = vi.fn(async () =>
      Response.json({ message: 'invalid key details' }, { status: 401 }),
    )
    const response = await handleInquiryRequest(context(form()), fetcher)

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'Inquiry delivery failed.' })
  })
})
