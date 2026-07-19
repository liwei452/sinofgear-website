import { FileText, Globe2, LockKeyhole } from 'lucide-react'
import { useLocation } from 'react-router'
import InquiryForm, { type InquirySubmitter } from '@/components/InquiryForm'
import PageHero from '@/components/PageHero'
import Seo from '@/components/Seo'
import { pages } from '@/data/pages'
import { parseProductPrefill } from '@/lib/inquiry'
import { useLang } from '@/i18n/LanguageContext'
import { localizeValue } from '@/i18n/messages'

export default function ContactPage({ submitter }: { submitter?: InquirySubmitter }) {
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
            <div className="rounded-3xl bg-steel p-7 text-white">
              <h2 className="text-2xl font-extrabold">{text('Prepare a useful RFQ')}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
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
                    title: 'Production API pending',
                    text: 'This first version uses a local mock. Direct contact and secure file transfer appear after business details are confirmed.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold">{text(item.title)}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{text(item.text)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <InquiryForm initialProduct={initialProduct} submitter={submitter} />
        </div>
      </section>
    </>
  )
}
