import { isProductSlug, type ProductSlug } from '@/data/products'

export interface InquiryValues {
  name: string
  company: string
  email: string
  country: string
  product: ProductSlug | ''
  quantity: string
  material: string
  drawingFileName: string
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
    drawingFileName: '',
    message: '',
  }
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

  return errors
}

export function parseProductPrefill(search: string): ProductSlug | '' {
  const value = new URLSearchParams(search).get('product')
  return value && isProductSlug(value) ? value : ''
}
