import { useEffect, useState } from 'react'
import { Globe, Menu, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLang } from '@/i18n/LanguageContext'
import { langNames, type Lang } from '@/i18n/translations'

const anchors = [
  { id: 'products', key: 'products' },
  { id: 'capabilities', key: 'capabilities' },
  { id: 'quality', key: 'quality' },
  { id: 'industries', key: 'industries' },
  { id: 'process', key: 'process' },
  { id: 'faq', key: 'faq' },
] as const

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Header() {
  const { t, lang, setLang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const Logo = (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="flex items-center gap-2.5 shrink-0"
      aria-label="SINOFORM home"
    >
      <img src="/assets/logo-icon.png" alt="SINOFORM logo" className="h-9 w-9 object-contain" />
      <span className="leading-none text-left">
        <span className="block text-xl font-extrabold tracking-tight text-primary">{t.brand}</span>
        <span className="block text-[10px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          {t.brandSuffix}
        </span>
      </span>
    </button>
  )

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/92 backdrop-blur-md shadow-[0_1px_0_0_hsl(var(--border)),0_8px_30px_-12px_rgb(0_60_120/0.25)]' : 'bg-white/70 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-[72px] items-center justify-between gap-4">
          {Logo}

          <nav className="hidden lg:flex items-center gap-1">
            {anchors.map((a) => (
              <button
                key={a.id}
                onClick={() => scrollToId(a.id)}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {t.nav[a.key]}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-foreground/80">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{langNames[lang]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(langNames) as Lang[]).map((l) => (
                  <DropdownMenuItem
                    key={l}
                    onClick={() => setLang(l)}
                    className={l === lang ? 'font-bold text-primary' : ''}
                  >
                    {langNames[l]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              className="hidden sm:inline-flex gap-1.5 font-semibold shadow-md shadow-primary/25"
              onClick={() => scrollToId('inquiry')}
            >
              <Mail className="h-4 w-4" />
              {t.nav.getQuote}
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="mt-8 flex flex-col gap-1">
                  {anchors.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setOpen(false)
                        setTimeout(() => scrollToId(a.id), 250)
                      }}
                      className="rounded-lg px-4 py-3 text-left text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {t.nav[a.key]}
                    </button>
                  ))}
                  <Button
                    className="mt-4 gap-2"
                    onClick={() => {
                      setOpen(false)
                      setTimeout(() => scrollToId('inquiry'), 250)
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    {t.nav.getQuote}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
