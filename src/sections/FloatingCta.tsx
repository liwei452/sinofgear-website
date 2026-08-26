import { FileUp } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useLang } from '@/i18n/LanguageContext'

export default function FloatingCta() {
  const { pathname } = useLocation()
  const { text } = useLang()
  if (pathname === '/contact') return null

  return (
    <Link
      to="/contact"
      aria-label={text('Submit Drawing')}
      className="fixed bottom-4 right-4 z-40 flex min-h-12 items-center gap-2 rounded-md border border-primary/20 bg-primary px-4 py-3 font-semibold text-white shadow-[0_14px_36px_-18px_hsl(var(--primary)/.9)] transition duration-200 hover:-translate-y-0.5 hover:bg-[hsl(209_100%_31%)] sm:bottom-6 sm:right-6"
    >
      <FileUp className="h-5 w-5" aria-hidden="true" />
      <span className="hidden text-sm sm:inline">{text('Submit Drawing')}</span>
    </Link>
  )
}
