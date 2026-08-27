import {
  InquiryDeliveryError,
  InquiryValidationError,
  buildInquiryEmail,
  parseInquiryForm,
  sendInquiryEmail,
  type InquiryEnv,
} from '../lib/inquiryServer'

type InquiryFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export interface InquiryPagesContext {
  request: Request & { cf?: { country?: string } }
  env: InquiryEnv
}

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(body, {
    status,
    headers: {
      'cache-control': 'no-store',
      ...headers,
    },
  })
}

function createReference() {
  return `SF-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

export async function handleInquiryRequest(
  context: InquiryPagesContext,
  fetcher: InquiryFetcher = fetch,
) {
  if (context.request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, { allow: 'POST' })
  }

  const contentType = context.request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
    return json({ error: 'Invalid inquiry.' }, 400)
  }

  let form: FormData
  try {
    form = await context.request.formData()
  } catch {
    return json({ error: 'Invalid inquiry.' }, 400)
  }

  try {
    const inquiry = parseInquiryForm(form)
    const receivedAt = new Date().toISOString()
    const reference = createReference()

    if (!inquiry.isBot) {
      const payload = await buildInquiryEmail(
        inquiry,
        {
          reference,
          receivedAt,
          edgeCountry: context.request.cf?.country ?? '',
        },
        context.env,
      )
      await sendInquiryEmail(payload, context.env, fetcher)
    }

    return json({ reference, receivedAt })
  } catch (error) {
    if (error instanceof InquiryValidationError) {
      return json({ error: 'Invalid inquiry.' }, 400)
    }
    if (error instanceof InquiryDeliveryError) {
      console.error('Inquiry delivery failed.', {
        stage: error.stage,
        providerStatus: error.providerStatus,
        providerMessage: error.providerMessage,
      })
      return json({ error: 'Inquiry delivery failed.' }, 502)
    }
    return json({ error: 'Inquiry delivery failed.' }, 502)
  }
}

export const onRequest = (context: InquiryPagesContext) => handleInquiryRequest(context)
