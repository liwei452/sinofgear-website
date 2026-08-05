import type { InquiryValues } from '@/lib/inquiry'

export interface InquiryResult {
  reference: string
  receivedAt: string
}

type InquiryFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface SubmitOptions {
  fetcher?: InquiryFetcher
}

const PUBLIC_ERROR = 'We could not submit your inquiry. Please try again.'

function isInquiryResult(value: unknown): value is InquiryResult {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.reference === 'string' &&
    /^SF-[A-Z0-9-]+$/.test(candidate.reference) &&
    typeof candidate.receivedAt === 'string' &&
    !Number.isNaN(Date.parse(candidate.receivedAt))
  )
}

export async function submitInquiry(
  values: InquiryValues,
  options: SubmitOptions = {},
): Promise<InquiryResult> {
  const body = new FormData()
  body.set('name', values.name)
  body.set('company', values.company)
  body.set('email', values.email)
  body.set('country', values.country)
  body.set('product', values.product)
  body.set('quantity', values.quantity)
  body.set('material', values.material)
  body.set('message', values.message)
  body.set('website', values.website)
  body.set('sourceUrl', window.location.href)

  if (values.drawingFile) {
    body.set('drawing', values.drawingFile, values.drawingFile.name)
  }

  try {
    const response = await (options.fetcher ?? fetch)('/api/inquiries', {
      method: 'POST',
      body,
    })

    if (!response.ok) throw new Error(PUBLIC_ERROR)
    const result: unknown = await response.json()
    if (!isInquiryResult(result)) throw new Error(PUBLIC_ERROR)
    return result
  } catch {
    throw new Error(PUBLIC_ERROR)
  }
}
