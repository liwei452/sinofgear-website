import type { InquiryValues } from '@/lib/inquiry'

export interface InquiryResult {
  reference: string
  receivedAt: string
}

interface MockOptions {
  delayMs?: number
  forceFailure?: boolean
}

function wait(delayMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs))
}

export async function submitInquiry(
  values: InquiryValues,
  options: MockOptions = {},
): Promise<InquiryResult> {
  const { delayMs = 650, forceFailure = false } = options
  await wait(delayMs)

  if (forceFailure) {
    throw new Error('We could not submit your inquiry. Please try again.')
  }

  // Production API handoff:
  // Replace the mock result below with a POST to
  // `${import.meta.env.VITE_INQUIRY_API_URL}/inquiries`.
  // Send drawing bytes through an approved multipart upload flow rather than
  // adding them to this JSON payload. Do not persist personal data in localStorage.
  void values

  const reference = `SF-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`

  return {
    reference,
    receivedAt: new Date().toISOString(),
  }
}
