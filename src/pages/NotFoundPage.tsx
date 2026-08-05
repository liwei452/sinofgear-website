import { Link } from 'react-router'
import { ArrowLeft, FileQuestion, Mail } from 'lucide-react'
import Seo from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { pages } from '@/data/pages'
import { useLang } from '@/i18n/LanguageContext'
import { localizeValue } from '@/i18n/messages'

export default function NotFoundPage() {
  const { lang, t } = useLang()
  const page = localizeValue(pages.notFound, lang)
  return (
    <>
      <Seo
        seo={{ title: `${page.title} | SINOF`, description: page.description }}
        pathname="/404"
        noIndex
      />
      <section className="bg-steel px-4 py-24 text-center sm:px-6 lg:py-32">
        <FileQuestion className="mx-auto h-14 w-14 text-sky-400" aria-hidden="true" />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white">{page.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">{page.description}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="secondary">
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
              {t('action.viewProducts')}
            </Link>
          </Button>
          <Button asChild>
            <Link to="/contact">
              <Mail className="h-4 w-4" />
              {t('action.requestQuote')}
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
