import type { InquiryValues } from '@/lib/inquiry'
import type { ContactUsFields, ContactUsSubmitter } from '@/customerService/types'

interface MirrorOptions {
  pageURL: string
  onError?: (error: unknown) => void
}

export function mapInquiryToContactUs(values: InquiryValues): ContactUsFields {
  return {
    business_email: [values.email.trim()],
  }
}

export async function mirrorInquiryToCrm(
  values: InquiryValues,
  submitContactUs: ContactUsSubmitter,
  options: MirrorOptions,
): Promise<boolean> {
  try {
    const submitOptions = values.drawingFile
      ? {
          pageURL: options.pageURL,
          attachments: { files: [values.drawingFile] },
        }
      : { pageURL: options.pageURL }
    const result = await submitContactUs(
      mapInquiryToContactUs(values),
      submitOptions,
    )
    return result?.accepted === true
  } catch (error) {
    options.onError?.(error)
    return false
  }
}
