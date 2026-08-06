import {
  BadgeCheck,
  CalendarDays,
  Cog,
  Factory,
  Mail,
  Microscope,
  PackageCheck,
  Ruler,
  Warehouse,
} from 'lucide-react'
import { Link } from 'react-router'
import PageHero from '@/components/PageHero'
import Seo from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { companyGallery, companyProfile } from '@/data/company'
import { pages } from '@/data/pages'
import { getSiteUrl, siteConfig } from '@/data/site'
import { useLang } from '@/i18n/LanguageContext'
import { localizeValue } from '@/i18n/messages'
import { buildPageBreadcrumbSchema } from '@/lib/seo'

const factIcons = [CalendarDays, Warehouse, Factory]

export default function AboutPage() {
  const { lang, t } = useLang()
  const profile = companyProfile[lang]
  const page = localizeValue(pages.about, lang)
  const breadcrumb = buildPageBreadcrumbSchema(profile.title, '/about', getSiteUrl())

  return (
    <>
      <Seo
        seo={page.seo}
        pathname="/about"
        image="/assets/factory-exterior.webp"
        structuredData={[breadcrumb]}
      />
      <PageHero
        eyebrow={profile.eyebrow}
        title={profile.title}
        subtitle={profile.subtitle}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                {siteConfig.brand}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {profile.overviewTitle}
              </h2>
              <p className="mt-5 font-semibold text-foreground">{siteConfig.legalName}</p>
              {profile.overview.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-sm leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
            <img
              src="/assets/factory-showroom.webp"
              alt={companyGallery[1].alt}
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
            />
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {profile.facts.map((fact, index) => {
              const Icon = factIcons[index]
              return (
                <article key={fact.label} className="rounded-2xl border bg-white p-6 shadow-sm">
                  {Icon && (
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  )}
                  <p className="mt-4 text-sm font-semibold text-muted-foreground">{fact.label}</p>
                  <p className="mt-1 text-xl font-extrabold text-foreground">{fact.value}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight">{profile.equipmentTitle}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {companyGallery.map((image) => (
              <figure key={image.src} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <img src={image.src} alt={image.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-3xl border bg-white p-7 shadow-sm sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
              <Cog className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold">{profile.equipmentTitle}</h2>
            <ul className="mt-6 space-y-3">
              {profile.equipment.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl bg-steel p-7 text-white shadow-sm sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sky-400">
              <Microscope className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold">{profile.qualityTitle}</h2>
            <ul className="mt-6 space-y-3">
              {profile.quality.map((item, index) => {
                const Icon = index === 1 ? Ruler : BadgeCheck
                return (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                )
              })}
            </ul>
          </article>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                {siteConfig.brand}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold">{profile.productsTitle}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.products.map((item) => (
                <div key={item} className="rounded-2xl border bg-white p-5 text-sm font-semibold leading-6 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">{profile.ctaTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-sky-100">{profile.ctaText}</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-3 inline-block text-sm font-bold text-white underline decoration-sky-300 underline-offset-4"
            >
              {siteConfig.email}
            </a>
          </div>
          <Button asChild size="lg" className="shrink-0 gap-2 bg-white text-primary hover:bg-sky-50">
            <Link to="/contact">
              <Mail className="h-5 w-5" />
              {t('action.requestQuote')}
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
