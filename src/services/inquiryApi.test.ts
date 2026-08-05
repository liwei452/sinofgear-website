import { describe, expect, it } from 'vitest'
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
  drawingFileName: 'spur-gear.step',
  message: 'Please review this gear.',
}

describe('mock inquiry service', () => {
  it('returns a SINOF inquiry reference', async () => {
    const result = await submitInquiry(inquiry, { delayMs: 0 })
    expect(result.reference).toMatch(/^SF-[A-Z0-9]+$/)
  })

  it('returns a user-safe error when failure is forced', async () => {
    await expect(submitInquiry(inquiry, { delayMs: 0, forceFailure: true })).rejects.toThrow(
      'We could not submit your inquiry. Please try again.',
    )
  })
})
