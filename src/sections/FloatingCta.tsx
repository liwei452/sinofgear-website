import { Mail } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useLang } from '@/i18n/LanguageContext'

export default function FloatingCta() {
  const { pathname } = useLocation()
  const { t } = useLang()
  if (pathname === '/contact') return null

  return (
    <Link
      to="/contact"
      aria-label={t('action.requestQuote')}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3.5 font-bold text-white shadow-xl shadow-sky-900/40 transition-all duration-300 hover:scale-105 hover:bg-sky-500"
    >
      <Mail className="h-5 w-5" />
      <span className="text-sm">{t('action.inquire')}</span>
    </Link>
  )
}
