import { describe, expect, it } from 'vitest'
import {
  MAX_DRAWING_BYTES,
  parseProductPrefill,
  validateDrawing,
  validateInquiry,
  type InquiryValues,
} from './inquiry'

const validInquiry: InquiryValues = {
  name: 'Alex Morgan',
  company: 'Northstar Motion',
  email: 'alex@example.com',
  whatsapp: '+49 123 456789',
  country: 'Germany',
  product: 'Custom spur gear for packaging equipment',
  quantity: '500 pcs',
  material: 'Alloy steel',
  drawingFile: null,
  website: '',
  message: 'Please review this gear for a packaging machine.',
}

describe('inquiry validation', () => {
  it('requires the buyer and project fields needed for review', () => {
    const errors = validateInquiry({
      name: '',
      company: '',
      email: '',
      whatsapp: '',
      country: '',
      product: '',
      quantity: '',
      material: '',
      drawingFile: null,
      website: '',
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

  it('accepts a supported drawing no larger than 15 MB', () => {
    const file = new File(['drawing'], 'gear.step', { type: 'application/octet-stream' })
    expect(validateDrawing(file)).toBeUndefined()
  })

  it('rejects unsupported drawing extensions', () => {
    const file = new File(['image'], 'gear.png', { type: 'image/png' })
    expect(validateDrawing(file)).toBe(
      'Upload a PDF, STEP, STP, IGES, IGS, DXF, or DWG file.',
    )
  })

  it('rejects drawings larger than 15 MB', () => {
    const file = new File([new Uint8Array(MAX_DRAWING_BYTES + 1)], 'gear.pdf', {
      type: 'application/pdf',
    })
    expect(validateDrawing(file)).toBe('The drawing must be 15 MB or smaller.')
  })
})

describe('product prefill', () => {
  it('accepts a configured product slug', () => {
    expect(parseProductPrefill('?product=helical-gears')).toBe('helical-gears')
    expect(parseProductPrefill('?product=worm-gears')).toBe('worm-gears')
    expect(parseProductPrefill('?product=round-belts')).toBe('round-belts')
  })

  it('rejects an unknown product slug', () => {
    expect(parseProductPrefill('?product=unknown')).toBe('')
  })
})
