import { describe, expect, it } from 'vitest'
import { parseProductPrefill, validateInquiry, type InquiryValues } from './inquiry'

const validInquiry: InquiryValues = {
  name: 'Alex Morgan',
  company: 'Northstar Motion',
  email: 'alex@example.com',
  country: 'Germany',
  product: 'spur-gears',
  quantity: '500 pcs',
  material: 'Alloy steel',
  drawingFileName: 'spur-gear.step',
  message: 'Please review this gear for a packaging machine.',
}

describe('inquiry validation', () => {
  it('requires the buyer and project fields needed for review', () => {
    const errors = validateInquiry({
      name: '',
      company: '',
      email: '',
      country: '',
      product: '',
      quantity: '',
      material: '',
      drawingFileName: '',
      message: '',
    })

    expect(Object.keys(errors).sort()).toEqual(
      ['company', 'country', 'email', 'message', 'name', 'product'].sort(),
    )
  })

  it('rejects an invalid email address', () => {
    expect(validateInquiry({ ...validInquiry, email: 'alex@invalid' }).email).toBe(
      'Enter a valid business email.',
    )
  })

  it('accepts a complete inquiry', () => {
    expect(validateInquiry(validInquiry)).toEqual({})
  })
})

describe('product prefill', () => {
  it('accepts a configured product slug', () => {
    expect(parseProductPrefill('?product=helical-gears')).toBe('helical-gears')
    expect(parseProductPrefill('?product=round-belts')).toBe('round-belts')
  })

  it('rejects an unknown product slug', () => {
    expect(parseProductPrefill('?product=unknown')).toBe('')
  })
})
