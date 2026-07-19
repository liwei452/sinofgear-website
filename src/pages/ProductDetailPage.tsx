import {
  ArrowRight,
  CheckCircle2,
  Factory,
  Gauge,
  Layers3,
  Mail,
  Ruler,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { Link, useParams } from 'react-router'
import Seo from '@/components/Seo'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { getProductBySlug, localizeProduct } from '@/data/products'
import { getSiteUrl } from '@/data/site'
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductSchema,
} from '@/lib/seo'
import NotFoundPage from './NotFoundPage'
import { useLang } from '@/i18n/LanguageContext'

function ListPanel({
  title,
  items,
  icon: Icon,
}: {
  title: string
  items: string[]
  icon: typeof Layers3
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const sourceProduct = getProductBySlug(slug)
  const { lang, text, t } = useLang()
  if (!sourceProduct) return <NotFoundPage />
  const product = localizeProduct(sourceProduct, lang)

  const siteUrl = getSiteUrl()
  const quoteHref = `/contact?product=${product.slug}`
  const structuredData = [
    buildProductSchema(product, siteUrl),
    buildBreadcrumbSchema(product, siteUrl),
    buildFaqSchema(product.faq),
  ]

  return (
    <>
      <Seo
        seo={product.seo}
        pathname={`/products/${product.slug}`}
        type="product"
        image={product.image}
        structuredData={structuredData}
      />

      <section className="relative overflow-hidden bg-steel py-12 lg:py-20">
        <div className="absolute inset-0 bg-industrial-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link to="/" className="hover:text-white">{t('nav.home')}</Link>
            <span aria-hidden="true">/</span>
            <Link to="/products" className="hover:text-white">{t('nav.products')}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">{product.shortName}</span>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">{text('Made to drawing')}</p>
              <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{product.valueProposition}</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">{product.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 bg-sky-500 font-bold hover:bg-sky-400">
                  <Link to={quoteHref}>
                    <Mail className="h-5 w-5" />
                    {t('action.requestQuote')}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                  <Link to="/products">
                    {t('action.viewAllProducts')}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/30">
              <img
                src={product.image}
                alt={product.imageAlt}
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <ListPanel title={t('section.features')} items={product.features} icon={Layers3} />
          <ListPanel title={t('section.materials')} items={product.materials} icon={Factory} />
          <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                <Gauge className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">{t('section.precision')}</h2>
            </div>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">{product.precision}</p>
          </section>
          <ListPanel title={t('section.customization')} items={product.customization} icon={Wrench} />
          <ListPanel title={t('section.industries')} items={product.industries} icon={Ruler} />
          <ListPanel title={t('section.inspection')} items={product.inspection} icon={ShieldCheck} />
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-primary">{t('section.buyerGuidance')}</p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t('section.faq')}
          </h2>
          <Accordion type="single" collapsible className="mt-10 rounded-2xl border bg-white px-5 sm:px-7">
            {product.faq.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-left font-bold">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-primary py-14 text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">{text('Have a drawing for this product?')}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/75">
              {text('Share the controlled drawing, quantity, material preference, and application context for review.')}
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="shrink-0 font-bold">
            <Link to={quoteHref}>
              <Mail className="h-5 w-5" />
              {t('action.requestQuote')}
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
