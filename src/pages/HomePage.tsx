import { ArrowRight, FileCheck2, Mail, SearchCheck, Settings2 } from 'lucide-react'
import { Link } from 'react-router'
import ProductCard from '@/components/ProductCard'
import Seo from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { pages } from '@/data/pages'
import { products } from '@/data/products'
import { useLang } from '@/i18n/LanguageContext'
import { localizeValue } from '@/i18n/messages'

const inquirySteps = [
  {
    icon: FileCheck2,
    title: 'Share controlled requirements',
    description: 'Send a drawing or model, quantity, material preference, and application context.',
  },
  {
    icon: SearchCheck,
    title: 'Complete technical review',
    description: 'Geometry, tolerances, process assumptions, inspection, and open questions are reviewed.',
  },
  {
    icon: Settings2,
    title: 'Confirm the quotation scope',
    description: 'Production and documentation requirements are aligned before an order is placed.',
  },
]

export default function HomePage() {
  const { lang, text, t } = useLang()
  const page = localizeValue(pages.home, lang)
  return (
    <>
      <Seo seo={page.seo} pathname="/" image="/assets/hero.jpg" />

      <section className="relative isolate min-h-[690px] overflow-hidden bg-slate-950">
        <img
          src="/assets/hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/35" />
        <div className="absolute inset-0 bg-industrial-grid opacity-30" />
        <div className="relative mx-auto flex min-h-[690px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
              {page.eyebrow}
            </p>
            <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              {page.subtitle}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 gap-2 bg-sky-500 px-6 font-bold hover:bg-sky-400">
                <Link to="/contact">
                  <Mail className="h-5 w-5" />
                  {t('action.requestQuote')}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/30 bg-white/5 px-6 font-bold text-white hover:bg-white/15 hover:text-white">
                <Link to="/products">
                  {t('action.viewProducts')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-3xl gap-3 text-sm text-slate-300 sm:grid-cols-3">
              {['Drawing-led review', 'Product-specific requirements', 'Agreed inspection scope'].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  {text(item)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{text('Product range')}</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{text('Start With the Right Product Family')}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                {text('Each page explains the information needed to review materials, geometry, precision, customization, and inspection.')}
              </p>
            </div>
            <Button asChild variant="outline" className="self-start md:self-auto">
              <Link to="/products">
                {text('View all products')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{text('Inquiry process')}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{text('From Drawing to a Clear RFQ')}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {text('Phase-one content focuses on the decisions buyers and suppliers need to align before production.')}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {inquirySteps.map((step, index) => (
              <article key={step.title} className="relative rounded-2xl border bg-white p-6 shadow-sm">
                <span className="absolute right-5 top-4 text-5xl font-black text-secondary">{index + 1}</span>
                <step.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                <h3 className="mt-6 text-lg font-bold">{text(step.title)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text(step.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-steel py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-400">{t('nav.capabilities')}</p>
            <h2 className="mt-3 text-2xl font-extrabold">{text('Review the complete manufacturing brief')}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {text('See which geometry, material, process, and commercial inputs help create a meaningful quotation.')}
            </p>
            <Link to="/capabilities" className="mt-5 inline-flex items-center gap-2 font-bold text-sky-400 hover:text-sky-300">
              {text('Explore capabilities')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-400">{text('Quality planning')}</p>
            <h2 className="mt-3 text-2xl font-extrabold">{text('Agree on measurable acceptance criteria')}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {text('Define critical features, datums, gear checks, records, and change control before production.')}
            </p>
            <Link to="/quality" className="mt-5 inline-flex items-center gap-2 font-bold text-sky-400 hover:text-sky-300">
              {text('Review quality planning')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
