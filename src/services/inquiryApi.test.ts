import { describe, expect, it, vi } from 'vitest'
import type { InquiryValues } from '@/lib/inquiry'
import { submitInquiry } from './inquiryApi'

const inquiry: InquiryValues = {
  name: 'Alex Morgan',
  company: 'Northstar Motion',
  email: 'alex@example.com',
  country: 'Germany',
  product: 'spur-gears',
  quantity: '500 pcs',
  material: 'Alloy steel',
  drawingFile: null,
  website: '',
  message: 'Please review this gear.',
}

describe('production inquiry service', () => {
  it('posts all inquiry values and the drawing to the production endpoint', async () => {
    const drawing = new File(['drawing'], 'gear.step', {
      type: 'application/octet-stream',
    })
    const fetcher = vi.fn(async () =>
      Response.json({
        reference: 'SF-TEST123',
        receivedAt: '2026-08-05T00:00:00.000Z',
      }),
    )

    const result = await submitInquiry({ ...inquiry, drawingFile: drawing }, { fetcher })

    expect(result.reference).toBe('SF-TEST123')
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0][0]).toBe('/api/inquiries')
    expect(fetcher.mock.calls[0][1]?.method).toBe('POST')
    const body = fetcher.mock.calls[0][1]?.body as FormData
    expect(body.get('email')).toBe('alex@example.com')
    expect(body.get('company')).toBe('Northstar Motion')
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
