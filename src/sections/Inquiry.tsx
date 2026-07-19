import { useMemo, useState } from 'react'
import {
  Mail, Phone, Clock3, ShieldCheck, Send, CheckCircle2, Loader2, Paperclip, Headset,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLang } from '@/i18n/LanguageContext'
import SectionHead from './SectionHead'

const EMAIL = 'sales@sinoform-gear.com'
const PHONE = '+86 574 8888 6666'

const COUNTRIES = [
  'United States', 'Germany', 'Japan', 'United Kingdom', 'France', 'Italy', 'Spain', 'Netherlands',
  'Switzerland', 'Austria', 'Sweden', 'Poland', 'Czech Republic', 'Canada', 'Mexico', 'Brazil',
  'Australia', 'South Korea', 'Singapore', 'India', 'Turkey', 'United Arab Emirates', 'Israel',
  'South Africa', 'China', 'Other',
]

interface Props {
  product: string
  setProduct: (p: string) => void
}

interface Errors {
  name?: string
  email?: string
}

export default function Inquiry({ product, setProduct }: Props) {
  const { t } = useLang()
  const f = t.inquiry.form

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('')
  const [quantity, setQuantity] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [refNo, setRefNo] = useState<string | null>(null)

  const productOptions = useMemo(
    () => t.products.items.map((p) => ({ id: p.id, name: p.name })),
    [t],
  )

  const validate = (): boolean => {
    const e: Errors = {}
    if (!name.trim()) e.name = f.required
    if (!email.trim()) e.email = f.required
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = f.invalidEmail
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSending(true)
    // Simulate submission (front-end demo — wire to email/CRM in production)
    setTimeout(() => {
      const now = new Date()
      const ref = `SF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate(),
      ).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const record = {
        ref, name, email, company, country, product, quantity, message, at: now.toISOString(),
      }
      const prev = JSON.parse(localStorage.getItem('sf-inquiries') || '[]')
      localStorage.setItem('sf-inquiries', JSON.stringify([...prev, record]))
      setRefNo(ref)
      setSending(false)
    }, 1200)
  }

  const reset = () => {
    setRefNo(null)
    setName(''); setEmail(''); setCompany(''); setCountry('')
    setProduct(''); setQuantity(''); setMessage(''); setErrors({})
  }

  return (
    <section id="inquiry" className="relative overflow-hidden py-20 lg:py-28 bg-steel">
      <div className="absolute inset-0 bg-industrial-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow={t.inquiry.eyebrow}
          title={t.inquiry.title}
          subtitle={t.inquiry.subtitle}
          dark
        />

        <div className="grid gap-8 lg:grid-cols-5">
          {/* form card */}
          <div className="reveal lg:col-span-3">
            <div className="rounded-2xl bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">
              {refNo ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-9 w-9 text-green-600" />
                  </span>
                  <h3 className="mt-5 text-2xl font-extrabold text-foreground">{f.successTitle}</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {f.successMsg}{' '}
                    <span className="font-bold text-primary">{refNo}</span>. {f.successMsg2}{' '}
                    <a href={`mailto:${EMAIL}`} className="font-semibold text-primary hover:underline">
                      {EMAIL}
                    </a>
                    .
                  </p>
                  <Button variant="outline" className="mt-7" onClick={reset}>
                    {f.again}
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="iq-name" className="font-semibold">
                        {f.name} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="iq-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={f.namePh}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="iq-email" className="font-semibold">
                        {f.email} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="iq-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={f.emailPh}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="iq-company" className="font-semibold">{f.company}</Label>
                      <Input
                        id="iq-company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={f.companyPh}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold">{f.country}</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger>
                          <SelectValue placeholder={f.countryPh} />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="font-semibold">{f.product}</Label>
                      <Select value={product} onValueChange={setProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder={f.productPh} />
                        </SelectTrigger>
                        <SelectContent>
                          {productOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="iq-qty" className="font-semibold">{f.quantity}</Label>
                      <Input
                        id="iq-qty"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder={f.quantityPh}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="iq-msg" className="font-semibold">{f.message}</Label>
                    <Textarea
                      id="iq-msg"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={f.messagePh}
                      rows={5}
                    />
                    <p className="flex items-start gap-1.5 pt-1 text-xs leading-relaxed text-muted-foreground">
                      <Paperclip className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {f.fileNote}{' '}
                        <a href={`mailto:${EMAIL}`} className="font-semibold text-primary hover:underline">
                          {EMAIL}
                        </a>
                      </span>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={sending}
                    className="w-full gap-2 bg-sky-600 hover:bg-sky-500 font-bold text-white h-12 text-base shadow-lg shadow-sky-900/30"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {f.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {f.submit}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* aside */}
          <div className="reveal space-y-6 lg:col-span-2" style={{ animationDelay: '120ms' }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-7">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <ShieldCheck className="h-5 w-5 text-sky-400" />
                {t.inquiry.aside.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {t.inquiry.aside.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xl shadow-black/20 sm:p-7">
              <h3 className="flex items-center gap-2 font-bold text-foreground">
                <Headset className="h-5 w-5 text-primary" />
                {t.nav.contact}
              </h3>
              <ul className="mt-4 space-y-4 text-sm">
                <li>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.inquiry.aside.emailLabel}
                  </p>
                  <a href={`mailto:${EMAIL}`} className="mt-1 flex items-center gap-2 font-semibold text-primary hover:underline">
                    <Mail className="h-4 w-4" /> {EMAIL}
                  </a>
                </li>
                <li>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.inquiry.aside.phoneLabel}
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold text-foreground">
                    <Phone className="h-4 w-4 text-primary" /> {PHONE}
                  </p>
                </li>
                <li>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.inquiry.aside.hoursLabel}
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-foreground">
                    <Clock3 className="h-4 w-4 text-primary" /> {t.inquiry.aside.hours}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
