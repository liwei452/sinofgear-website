import { FileText, Globe2, LockKeyhole, Mail, MapPin, Phone } from 'lucide-react'
import { useLocation } from 'react-router'
import InquiryForm, { type InquirySubmitter } from '@/components/InquiryForm'
import PageHero from '@/components/PageHero'
import Seo from '@/components/Seo'
import { pages } from '@/data/pages'
import { siteConfig } from '@/data/site'
import { parseProductPrefill } from '@/lib/inquiry'
import { useLang } from '@/i18n/LanguageContext'
import { localizeValue } from '@/i18n/messages'
import type { ContactUsSubmitter } from '@/customerService/types'

interface ContactPageProps {
  submitter?: InquirySubmitter
  crmSubmitter?: ContactUsSubmitter
}

export default function ContactPage({ submitter, crmSubmitter }: ContactPageProps) {
  const location = useLocation()
  const { lang, text } = useLang()
  const page = localizeValue(pages.contact, lang)
  const initialProduct = parseProductPrefill(location.search)

  return (
    <>
      <Seo seo={page.seo} pathname="/contact" />
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        subtitle={page.subtitle}
        compact
      />
      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <aside className="space-y-6">
            <div className="border border-primary/15 bg-[hsl(210_45%_97%)] p-7 text-foreground">
              <h2 className="text-2xl font-extrabold">{text('Prepare a useful RFQ')}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {text('A controlled drawing and clear acceptance criteria help reduce assumptions during technical review.')}
              </p>
              <ul className="mt-6 space-y-5">
                {[
                  {
                    icon: FileText,
                    title: 'Drawing context',
                    text: 'Include revision, quantity, material, gear data, tolerances, and mating information.',
                  },
                  {
                    icon: Globe2,
                    title: 'Application context',
                    text: 'Explain the equipment, operating environment, load, speed, and approval workflow.',
                  },
                  {
                    icon: LockKeyhole,
                    title: 'Secure inquiry delivery',
                    text: 'Your inquiry and optional drawing are sent securely to our engineering team for review.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold">{text(item.title)}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text(item.text)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-border bg-white p-7">
              <h2 className="text-xl font-extrabold">{text('Direct contact')}</h2>
              <div className="mt-5 space-y-4 text-sm">
                <p className="font-bold text-foreground">{lang === 'zh' ? siteConfig.businessContactZh : siteConfig.businessContact}</p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-3 font-semibold text-primary hover:text-sky-600"
                >
                  <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {siteConfig.email}
                </a>
                <a
                  href={`tel:${siteConfig.mobile.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary"
                >
                  <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {siteConfig.mobile}
                </a>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary"
                >
                  <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {siteConfig.phone}
                </a>
                <p className="flex items-start gap-3 leading-6 text-muted-foreground">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{siteConfig.address}</span>
                </p>
              </div>
            </div>
          </aside>
          <InquiryForm
            initialProduct={initialProduct}
            submitter={submitter}
            crmSubmitter={crmSubmitter}
          />
        </div>
      </section>
    </>
  )
}
