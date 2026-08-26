import { ArrowRight, CheckCircle2, FileUp, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import Seo from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { companyFacts, companyGallery } from '@/data/company'
import { pages } from '@/data/pages'
import { productFamilies, productsForFamily } from '@/data/productFamilies'
import { useLang } from '@/i18n/LanguageContext'
import { localizeValue } from '@/i18n/messages'

const applicationPaths = [
  {
    title: 'New custom gear project',
    description: 'Start from a controlled drawing, defined duty, target quantity, and acceptance criteria.',
    href: '/industries/industrial_machinery/custom-gears',
  },
  {
    title: 'Replacement gear',
    description: 'Review a worn component together with mating parts, operating context, and available records.',
    href: '/industries/gearbox_repair/replacement-gears',
  },
  {
    title: 'Reverse-engineering review',
    description: 'Assess whether a sample and the available application information are sufficient to define the next step.',
    href: '/industries/mro/reverse-engineering-gears',
  },
] as const

const reviewActions = [
  {
    title: 'Share the controlled requirement',
    description: 'Send the drawing or model, revision, quantity, material preference, and application context.',
  },
  {
    title: 'Review geometry and acceptance needs',
    description: 'Open questions around tooth data, process assumptions, inspection, and documentation are identified.',
  },
  {
    title: 'Confirm quotation scope',
    description: 'The agreed manufacturing and quality scope becomes the basis for a meaningful quotation.',
  },
] as const

export default function HomePage() {
  const { lang, text } = useLang()
  const page = localizeValue(pages.home, lang)

  return (
    <>
      <Seo seo={page.seo} pathname="/" image="/assets/sinof-precision-gear-hero-v2.webp" />

      <section className="relative overflow-hidden border-b border-border bg-[hsl(210_40%_98%)]">
        <div className="pointer-events-none absolute inset-0 bg-industrial-grid opacity-70" />
        <div className="relative mx-auto grid min-h-[calc(100dvh-76px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.04fr_.96fr] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary">{text(page.eyebrow)}</p>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[4rem] lg:leading-[1.02]">
              {text(page.title)}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              {text('Review product fit, manufacturing requirements, and inspection scope before a quotation is prepared.')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 gap-2 rounded-md px-6 font-semibold">
                <Link to="/contact">
                  <FileUp className="h-4 w-4" aria-hidden="true" />
                  {text('Submit Drawing')}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-md bg-white px-6 font-semibold">
                <Link to="/products">
                  {text('Explore product families')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="mt-9 grid max-w-xl border-y border-border bg-white/60 sm:grid-cols-2">
              <Link to="/products" className="group px-4 py-4 text-sm font-semibold hover:text-primary sm:border-r sm:border-border">
                <span className="flex items-center justify-between gap-3">
                  {text('Find by product')}
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </span>
              </Link>
              <Link to="/industries/industrial_machinery/custom-gears" className="group border-t border-border px-4 py-4 text-sm font-semibold hover:text-primary sm:border-t-0">
                <span className="flex items-center justify-between gap-3">
                  {text('Find by application')}
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </span>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-4 -z-10 translate-x-5 translate-y-5 border border-primary/20 bg-primary/5" />
            <img
              src="/assets/sinof-precision-gear-hero-v2.webp"
              alt={text('Precision-machined helical gear teeth')}
              className="aspect-[5/4] w-full object-cover object-right shadow-[0_30px_80px_-45px_hsl(215_40%_22%/.55)]"
              fetchPriority="high"
            />
            <div className="absolute bottom-0 left-0 max-w-[88%] border-r border-t border-border bg-white px-5 py-4 sm:max-w-[72%]">
              <p className="text-sm font-semibold text-foreground">{text('Made to drawing')}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {text('Geometry, material, process, and inspection are reviewed as one project scope.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={text('Verified operating facts')} className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-border px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            `Founded in ${companyFacts.founded}`,
            companyFacts.facilityArea,
            companyFacts.gearAccuracy,
            companyFacts.certification,
          ].map((fact) => (
            <p key={fact} className="px-0 py-5 text-sm font-semibold leading-6 text-foreground sm:px-5 lg:px-7">
              {text(fact)}
            </p>
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.12em] text-primary">{text('Product routes')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{text('Choose a transmission family')}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              {text('Start with the component family. Each product page then explains the technical inputs needed for review.')}
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
            {productFamilies.map((family, index) => {
              const familyProducts = productsForFamily(family.id)
              return (
                <article
                  key={family.id}
                  id={family.id}
                  data-product-family={family.id}
                  className={`group relative overflow-hidden border border-border bg-slate-900 ${index === 0 ? 'min-h-[520px] lg:col-span-7 lg:row-span-2' : 'min-h-[250px] lg:col-span-5'}`}
                >
                  <img src={family.image} alt={text(family.imageAlt)} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                    <h3 className="text-2xl font-semibold tracking-[-0.025em]">{text(family.name)}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">{text(family.description)}</p>
                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                      {familyProducts.map((product) => (
                        <Link key={product.slug} to={`/products/${product.slug}`} className="text-sm font-semibold text-white underline decoration-white/35 underline-offset-4 hover:decoration-white">
                          {text(product.shortName)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-[hsl(210_35%_97%)] py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div className="max-w-md">
            <p className="text-xs font-semibold tracking-[0.12em] text-primary">{text('Application routes')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{text('Start with the project need')}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {text('A buyer can enter through a new design, a replacement need, or an engineering review when records are incomplete.')}
            </p>
          </div>
          <div className="border-t border-border">
            {applicationPaths.map((path) => (
              <Link key={path.title} to={path.href} className="group grid gap-3 border-b border-border py-6 sm:grid-cols-[1fr_1.35fr_auto] sm:items-center">
                <h3 className="text-lg font-semibold group-hover:text-primary">{text(path.title)}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{text(path.description)}</p>
                <span className="text-primary transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
          <div className="relative">
            <img src={companyGallery[3].src} alt={text(companyGallery[3].alt)} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute -bottom-5 -right-5 -z-10 hidden h-28 w-40 border border-primary/25 bg-primary/5 sm:block" />
          </div>
          <div className="lg:pl-8">
            <p className="text-xs font-semibold tracking-[0.12em] text-primary">{text('Verified facility')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{text('Manufacturing evidence')}</h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {text('Project review connects the released drawing to material, tooth generation, secondary machining, finishing, and inspection requirements.')}
            </p>
            <ul className="mt-7 space-y-3">
              {companyFacts.equipment.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{text(item)}</span>
                </li>
              ))}
            </ul>
            <Link to="/capabilities" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              {text('Review manufacturing capabilities')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-[hsl(210_35%_97%)] py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="max-w-xl">
            <ShieldCheck className="h-8 w-8 text-primary" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{text('Quality planning before production')}</h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {text('Accuracy and inspection claims must be tied to the released drawing, measurable characteristics, agreed methods, and required records.')}
            </p>
            <div className="mt-7 border-l-2 border-primary pl-5">
              <p className="text-sm font-semibold text-foreground">{text(companyFacts.laboratory)}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text(companyFacts.gearAccuracy)}</p>
            </div>
            <Link to="/quality" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              {text('Review quality planning')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <img src="/assets/quality.jpg" alt={text('Gear quality inspection and measurement planning')} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.12em] text-primary">{text('Technical review')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{text('From Drawing to a Clear RFQ')}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              {text('A useful RFQ reduces assumptions before tooling, production, inspection, and commercial terms are confirmed.')}
            </p>
          </div>

          <div className="mt-10 grid border-y border-border md:grid-cols-3">
            {reviewActions.map((action, index) => (
              <article key={action.title} className={`py-6 md:px-7 md:py-8 ${index > 0 ? 'border-t border-border md:border-l md:border-t-0' : ''}`}>
                <h3 className="text-lg font-semibold">{text(action.title)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{text(action.description)}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-6 bg-primary px-6 py-7 text-white sm:flex-row sm:items-center sm:px-8">
            <div>
              <h3 className="text-xl font-semibold">{text('Have a controlled drawing ready?')}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">{text('Share it with quantity and application context for technical review.')}</p>
            </div>
            <Button asChild size="lg" className="shrink-0 gap-2 rounded-md bg-white font-semibold text-primary hover:bg-blue-50">
              <Link to="/contact">
                <FileUp className="h-4 w-4" aria-hidden="true" />
                {text('Submit Drawing')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
