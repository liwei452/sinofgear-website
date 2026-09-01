import { describe, expect, it, vi } from 'vitest'
import type { InquiryValues } from '@/lib/inquiry'
import { submitInquiry } from './inquiryApi'

const inquiry: InquiryValues = {
  name: 'Alex Morgan',
  company: 'Northstar Motion',
  email: 'alex@example.com',
  whatsapp: '+49 123 456789',
  country: 'Réunion',
  product: 'Custom ring gear for kiln drive',
  quantity: '500 pcs',
  material: '42CrMo4 per EN 10083',
  drawingFile: null,
  website: '',
  message: 'Please review this gear.',
}

describe('production inquiry service', () => {
  it('posts all inquiry values and the drawing to the production endpoint', async () => {
    const drawing = new File(['drawing'], 'gear.step', {
      type: 'application/octet-stream',
    })
    let requestedUrl: RequestInfo | URL | undefined
    let requestedInit: RequestInit | undefined
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      requestedUrl = input
      requestedInit = init
      return Response.json({
        reference: 'SF-TEST123',
        receivedAt: '2026-08-05T00:00:00.000Z',
      })
    })

    const result = await submitInquiry({ ...inquiry, drawingFile: drawing }, { fetcher })

    expect(result.reference).toBe('SF-TEST123')
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(requestedUrl).toBe('/api/inquiries')
    expect(requestedInit?.method).toBe('POST')
    const body = requestedInit?.body as FormData
    expect(body.get('email')).toBe('alex@example.com')
    expect(body.get('whatsapp')).toBe('+49 123 456789')
    expect(body.get('company')).toBe('Northstar Motion')
    expect(body.get('country')).toBe('Réunion')
    expect(body.get('product')).toBe('Custom ring gear for kiln drive')
    expect(body.get('material')).toBe('42CrMo4 per EN 10083')
    expect(body.get('website')).toBe('')
    expect(body.get('sourceUrl')).toContain('http://localhost')
    expect((body.get('drawing') as File).name).toBe('gear.step')
  })

  it('throws a safe message when the API rejects the request', async () => {
    const fetcher = vi.fn(async () =>
      Response.json({ error: 'provider credential rejected' }, { status: 502 }),
    )

    await expect(submitInquiry(inquiry, { fetcher })).rejects.toThrow(
      'We could not submit your inquiry. Please try again.',
    )
  })

  it('throws a safe message when the API returns an invalid receipt', async () => {
    const fetcher = vi.fn(async () => Response.json({ accepted: true }))

    await expect(submitInquiry(inquiry, { fetcher })).rejects.toThrow(
      'We could not submit your inquiry. Please try again.',
    )
  })
})
