import { isProductSlug, type ProductSlug } from '@/data/products'

export interface InquiryValues {
  name: string
  company: string
  email: string
  country: string
  product: ProductSlug | ''
  quantity: string
  material: string
  drawingFile: File | null
  website: string
  message: string
}

export type InquiryErrors = Partial<Record<keyof InquiryValues, string>>

export function createEmptyInquiry(product: ProductSlug | '' = ''): InquiryValues {
  return {
    name: '',
    company: '',
    email: '',
    country: '',
    product,
    quantity: '',
    material: '',
    drawingFile: null,
    website: '',
    message: '',
  }
}

export const MAX_DRAWING_BYTES = 15 * 1024 * 1024

export const ALLOWED_DRAWING_EXTENSIONS = [
  'pdf',
  'step',
  'stp',
  'iges',
  'igs',
  'dxf',
  'dwg',
] as const

type DrawingExtension = (typeof ALLOWED_DRAWING_EXTENSIONS)[number]

export function validateDrawing(file: File | null): string | undefined {
  if (!file) return undefined

  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_DRAWING_EXTENSIONS.includes(extension as DrawingExtension)) {
    return 'Upload a PDF, STEP, STP, IGES, IGS, DXF, or DWG file.'
  }

  if (file.size > MAX_DRAWING_BYTES) {
    return 'The drawing must be 15 MB or smaller.'
  }

  return undefined
}

export function validateInquiry(values: InquiryValues): InquiryErrors {
  const errors: InquiryErrors = {}
  const required: Array<keyof InquiryValues> = [
    'name',
    'company',
    'email',
    'country',
    'product',
    'message',
  ]

  for (const field of required) {
    if (!values[field].trim()) errors[field] = 'This field is required.'
  }

  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(values.email.trim())) {
    errors.email = 'Enter a valid business email.'
  }

  const drawingError = validateDrawing(values.drawingFile)
  if (drawingError) errors.drawingFile = drawingError

  return errors
}

export function parseProductPrefill(search: string): ProductSlug | '' {
  const value = new URLSearchParams(search).get('product')
  return value && isProductSlug(value) ? value : ''
}
