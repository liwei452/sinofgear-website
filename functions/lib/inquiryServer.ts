const MAX_DRAWING_BYTES = 15 * 1024 * 1024
const ALLOWED_DRAWING_EXTENSIONS = new Set([
  'pdf',
  'step',
  'stp',
  'iges',
  'igs',
  'dxf',
  'dwg',
])
const ALLOWED_DRAWING_TYPES = new Set([
  '',
  'application/pdf',
  'application/octet-stream',
  'application/step',
  'application/iges',
  'application/dxf',
  'application/acad',
  'image/vnd.dwg',
  'image/vnd.dxf',
  'model/step',
  'model/iges',
])

export interface InquiryEnv {
  RESEND_API_KEY: string
  INQUIRY_TO_EMAIL: string
  INQUIRY_FROM_EMAIL: string
}

export interface SubmissionMeta {
  reference: string
  receivedAt: string
  edgeCountry: string
}

export interface ParsedInquiry {
  name: string
  company: string
  email: string
  country: string
  product: string
  quantity: string
  material: string
  message: string
  sourceUrl: string
  website: string
  drawing: File | null
  isBot: boolean
}

export interface ResendEmailPayload {
  from: string
  to: string[]
  reply_to: string
  subject: string
  html: string
  text: string
  attachments?: Array<{ filename: string; content: string }>
}

type InquiryFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export class InquiryValidationError extends Error {
  constructor() {
    super('Invalid inquiry.')
    this.name = 'InquiryValidationError'
  }
}

export class InquiryDeliveryError extends Error {
  constructor() {
    super('Inquiry delivery failed.')
    this.name = 'InquiryDeliveryError'
  }
}

function readString(form: FormData, key: string, maximum: number, required = false) {
  const value = form.get(key)
  if (typeof value !== 'string') throw new InquiryValidationError()
  const normalized = value.trim()
  if ((required && !normalized) || normalized.length > maximum) {
    throw new InquiryValidationError()
  }
  return normalized
}

function readDrawing(form: FormData) {
  const value = form.get('drawing')
  if (value === null || (typeof value === 'string' && value === '')) return null
  if (!(value instanceof File)) throw new InquiryValidationError()

  const extension = value.name.split('.').pop()?.toLowerCase() ?? ''
  if (
    !ALLOWED_DRAWING_EXTENSIONS.has(extension) ||
    !ALLOWED_DRAWING_TYPES.has(value.type.toLowerCase()) ||
    value.size > MAX_DRAWING_BYTES
  ) {
    throw new InquiryValidationError()
  }
  return value
}

export function parseInquiryForm(form: FormData): ParsedInquiry {
  const email = readString(form, 'email', 254, true)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
    throw new InquiryValidationError()
  }

  const website = readString(form, 'website', 500)
  return {
    name: readString(form, 'name', 120, true),
    company: readString(form, 'company', 160, true),
    email,
    country: readString(form, 'country', 120, true),
    product: readString(form, 'product', 80, true),
    quantity: readString(form, 'quantity', 120),
    material: readString(form, 'material', 120),
    message: readString(form, 'message', 5000, true),
    sourceUrl: readString(form, 'sourceUrl', 2048),
    website,
    drawing: readDrawing(form),
    isBot: website.length > 0,
  }
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character] ?? character,
  )
}

function safeHeader(value: string) {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 160)
}

function safeFilename(value: string) {
  return value.replace(/^.*[\\/]/, '').replace(/[\r\n\0]/g, '_').slice(0, 180)
}

async function fileToBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }
  return btoa(binary)
}

function htmlRow(label: string, value: string) {
  return `<tr><th align="left" style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(value) || '—'}</td></tr>`
}

export async function buildInquiryEmail(
  inquiry: ParsedInquiry,
  meta: SubmissionMeta,
  env: InquiryEnv,
): Promise<ResendEmailPayload> {
  const fields: Array<[string, string]> = [
    ['Reference', meta.reference],
    ['Received at', meta.receivedAt],
    ['Name', inquiry.name],
    ['Company', inquiry.company],
    ['Email', inquiry.email],
    ['Country', inquiry.country],
    ['Cloudflare country', meta.edgeCountry],
    ['Product', inquiry.product],
    ['Quantity', inquiry.quantity],
    ['Material', inquiry.material],
    ['Message', inquiry.message],
    ['Source page', inquiry.sourceUrl],
  ]
  const payload: ResendEmailPayload = {
    from: env.INQUIRY_FROM_EMAIL,
    to: [env.INQUIRY_TO_EMAIL],
    reply_to: inquiry.email,
    subject: safeHeader(`[${meta.reference}] ${inquiry.product} RFQ from ${inquiry.company}`),
    html: `<h1>New SINOF inquiry</h1><table style="border-collapse:collapse">${fields
      .map(([label, value]) => htmlRow(label, value))
      .join('')}</table>`,
    text: fields.map(([label, value]) => `${label}: ${value || '—'}`).join('\n'),
  }

  if (inquiry.drawing) {
    payload.attachments = [
      {
        filename: safeFilename(inquiry.drawing.name),
        content: await fileToBase64(inquiry.drawing),
      },
    ]
  }
  return payload
}

export async function sendInquiryEmail(
  payload: ResendEmailPayload,
  env: InquiryEnv,
  fetcher: InquiryFetcher = fetch,
) {
  if (!env.RESEND_API_KEY || !env.INQUIRY_TO_EMAIL || !env.INQUIRY_FROM_EMAIL) {
    throw new InquiryDeliveryError()
  }

  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new InquiryDeliveryError()
  } catch {
    throw new InquiryDeliveryError()
  }
}
