import { useState } from 'react'
import { AlertCircle, CheckCircle2, FileUp, Loader2, RotateCcw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { inquiryCopy, inquiryOptions } from '@/data/pages'
import { products, type ProductSlug } from '@/data/products'
import {
  createEmptyInquiry,
  validateInquiry,
  type InquiryErrors,
  type InquiryValues,
} from '@/lib/inquiry'
import { submitInquiry, type InquiryResult } from '@/services/inquiryApi'

export type InquirySubmitter = (values: InquiryValues) => Promise<InquiryResult>

interface InquiryFormProps {
  initialProduct?: ProductSlug | ''
  submitter?: InquirySubmitter
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50'

export default function InquiryForm({
  initialProduct = '',
  submitter = submitInquiry,
}: InquiryFormProps) {
  const [values, setValues] = useState<InquiryValues>(() => createEmptyInquiry(initialProduct))
  const [errors, setErrors] = useState<InquiryErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const [result, setResult] = useState<InquiryResult | null>(null)
  const [failureMessage, setFailureMessage] = useState('')

  const setField = <K extends keyof InquiryValues>(field: K, value: InquiryValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const submitValues = async () => {
    setStatus('submitting')
    setFailureMessage('')
    try {
      const response = await submitter(values)
      setResult(response)
      setStatus('success')
    } catch (error) {
      setFailureMessage(
        error instanceof Error
          ? error.message
          : 'We could not submit your inquiry. Please try again.',
      )
      setStatus('error')
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateInquiry(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await submitValues()
  }

  const reset = () => {
    setValues(createEmptyInquiry(initialProduct))
    setErrors({})
    setStatus('idle')
    setResult(null)
    setFailureMessage('')
  }

  if (status === 'success' && result) {
    return (
      <div className="flex min-h-[560px] flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-xl" aria-live="polite">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-2xl font-extrabold">{inquiryCopy.successTitle}</h2>
        <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">{inquiryCopy.successMessage}</p>
        <p className="mt-4 rounded-lg bg-accent px-4 py-2 font-mono text-sm font-bold text-primary">
          Reference: {result.reference}
        </p>
        <Button type="button" variant="outline" className="mt-7 gap-2" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          {inquiryCopy.reset}
        </Button>
      </div>
    )
  }

  const fieldError = (field: keyof InquiryValues) =>
    errors[field] ? (
      <p id={`${field}-error`} className="text-xs font-medium text-destructive">
        {errors[field]}
      </p>
    ) : null

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      {status === 'error' && (
        <div role="alert" className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">{failureMessage}</p>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={submitValues}>
                {inquiryCopy.retry}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{inquiryCopy.fields.name} *</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder={inquiryCopy.placeholders.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {fieldError('name')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">{inquiryCopy.fields.company} *</Label>
          <Input
            id="company"
            value={values.company}
            onChange={(event) => setField('company', event.target.value)}
            placeholder={inquiryCopy.placeholders.company}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? 'company-error' : undefined}
          />
          {fieldError('company')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{inquiryCopy.fields.email} *</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(event) => setField('email', event.target.value)}
            placeholder={inquiryCopy.placeholders.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {fieldError('email')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">{inquiryCopy.fields.country} *</Label>
          <select
            id="country"
            value={values.country}
            onChange={(event) => setField('country', event.target.value)}
            className={selectClassName}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={errors.country ? 'country-error' : undefined}
          >
            <option value="">Select a country</option>
            {inquiryOptions.countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {fieldError('country')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="product">{inquiryCopy.fields.product} *</Label>
          <select
            id="product"
            value={values.product}
            onChange={(event) => setField('product', event.target.value as ProductSlug | '')}
            className={selectClassName}
            aria-invalid={Boolean(errors.product)}
            aria-describedby={errors.product ? 'product-error' : undefined}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>{product.shortName}</option>
            ))}
          </select>
          {fieldError('product')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">{inquiryCopy.fields.quantity}</Label>
          <Input
            id="quantity"
            value={values.quantity}
            onChange={(event) => setField('quantity', event.target.value)}
            placeholder={inquiryCopy.placeholders.quantity}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="material">{inquiryCopy.fields.material}</Label>
          <select
            id="material"
            value={values.material}
            onChange={(event) => setField('material', event.target.value)}
            className={selectClassName}
          >
            <option value="">{inquiryCopy.placeholders.material}</option>
            {inquiryOptions.materials.map((material) => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="drawing">{inquiryCopy.fields.drawing}</Label>
          <div className="relative">
            <FileUp className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="drawing"
              type="file"
              accept=".pdf,.step,.stp,.iges,.igs,.dxf,.dwg"
              className="h-auto min-h-10 pl-9 file:mr-3"
              onChange={(event) => setField('drawingFileName', event.target.files?.[0]?.name ?? '')}
            />
          </div>
          {values.drawingFileName && <p className="text-xs font-medium text-primary">{values.drawingFileName}</p>}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="message">{inquiryCopy.fields.message} *</Label>
        <Textarea
          id="message"
          rows={6}
          value={values.message}
          onChange={(event) => setField('message', event.target.value)}
          placeholder={inquiryCopy.placeholders.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {fieldError('message')}
      </div>

      <p className="mt-4 text-xs leading-6 text-muted-foreground">{inquiryCopy.drawingNote}</p>

      <Button type="submit" size="lg" disabled={status === 'submitting'} className="mt-6 h-12 w-full gap-2 font-bold">
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {inquiryCopy.submitting}
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            {inquiryCopy.submit}
          </>
        )}
      </Button>
    </form>
  )
}
