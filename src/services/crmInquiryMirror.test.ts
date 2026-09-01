import { describe, expect, it, vi } from 'vitest'
import type { InquiryValues } from '@/lib/inquiry'
import { mapInquiryToContactUs, mirrorInquiryToCrm } from './crmInquiryMirror'

const inquiry: InquiryValues = {
  name: 'Alex Morgan',
  company: 'Northstar Motion',
  email: '  buyer@example.com  ',
  whatsapp: '+49 123 456789',
  country: 'Germany',
  product: 'spur-gears',
  quantity: '500 pcs',
  material: 'Alloy steel',
  drawingFile: new File(['drawing'], 'gear.step', { type: 'application/octet-stream' }),
  website: '',
  message: 'Please review this gear.',
}

describe('CRM inquiry mirror', () => {
  it('sends only the currently published Contact Us field and never inserts the drawing into text fields', () => {
    const fields = mapInquiryToContactUs(inquiry)

    expect(fields).toEqual({ business_email: ['buyer@example.com'] })
    expect(JSON.stringify(fields)).not.toContain('gear.step')
    expect(JSON.stringify(fields)).not.toContain('Please review')
  })

  it('submits the email and engineering drawing with the current page URL', async () => {
    const submitContactUs = vi.fn().mockResolvedValue({ accepted: true, created: true })

    await expect(mirrorInquiryToCrm(inquiry, submitContactUs, {
      pageURL: 'https://sinofgears.com/contact?product=spur-gears',
    })).resolves.toBe(true)

    expect(submitContactUs).toHaveBeenCalledWith(
      { business_email: ['buyer@example.com'] },
      {
        pageURL: 'https://sinofgears.com/contact?product=spur-gears',
        attachments: { files: [inquiry.drawingFile] },
      },
    )
  })

  it('does not send an empty attachment collection when no drawing was supplied', async () => {
    const submitContactUs = vi.fn().mockResolvedValue({ accepted: true, created: true })

    await mirrorInquiryToCrm(
      { ...inquiry, drawingFile: null },
      submitContactUs,
      { pageURL: 'https://sinofgears.com/contact' },
    )

    expect(submitContactUs).toHaveBeenCalledWith(
      { business_email: ['buyer@example.com'] },
      { pageURL: 'https://sinofgears.com/contact' },
    )
  })

  it('contains CRM failures so the successful email submission is not reversed', async () => {
    const onError = vi.fn()
    const submitContactUs = vi.fn().mockRejectedValue(new Error('CRM offline'))

    await expect(mirrorInquiryToCrm(inquiry, submitContactUs, {
      pageURL: 'https://sinofgears.com/contact',
      onError,
    })).resolves.toBe(false)
    expect(onError).toHaveBeenCalledOnce()
  })
})
