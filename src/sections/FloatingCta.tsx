import { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'
import { useLang } from '@/i18n/LanguageContext'
import { scrollToId } from './Header'

export default function FloatingCta() {
  const { t } = useLang()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const inquiry = document.getElementById('inquiry')
      const rect = inquiry?.getBoundingClientRect()
      const inInquiry = rect && rect.top < window.innerHeight && rect.bottom > 0
      setVisible(window.scrollY > 500 && !inInquiry)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => scrollToId('inquiry')}
      aria-label={t.nav.getQuote}
      className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3.5 font-bold text-white shadow-xl shadow-sky-900/40 transition-all duration-300 hover:bg-sky-500 hover:scale-105 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-16 opacity-0'
      }`}
    >
      <Mail className="h-5 w-5" />
      <span className="text-sm">{t.floating}</span>
    </button>
  )
}
