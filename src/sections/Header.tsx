import { useEffect, useState } from 'react'
import { Globe, Mail, Menu } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { navItems, siteConfig } from '@/data/site'
import { useLang } from '@/i18n/LanguageContext'
import { languageNames, supportedLanguages } from '@/i18n/language'

export default function Header() {
  const { lang, setLang, text, t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navigation = (onNavigate?: () => void) => (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              isActive ? 'bg-accent text-primary' : 'text-foreground/75 hover:bg-accent/60 hover:text-primary'
            }`
          }
        >
          {text(item.label)}
        </NavLink>
      ))}
    </>
  )

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 shadow-[0_1px_0_0_hsl(var(--border)),0_8px_30px_-12px_rgb(0_60_120/0.25)] backdrop-blur-md'
          : 'bg-white/85 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="SINOF home">
            <img src="/assets/logo-icon.png" alt="" className="h-9 w-9 object-contain" />
            <span className="leading-none">
              <span className="block text-xl font-extrabold tracking-tight text-primary">{siteConfig.brand}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {siteConfig.descriptor}
              </span>
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
            {navigation()}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-foreground/80">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{languageNames[lang]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {supportedLanguages.map((language) => (
                  <DropdownMenuItem
                    key={language}
                    onClick={() => setLang(language)}
                    className={language === lang ? 'font-bold text-primary' : ''}
                  >
                    {languageNames[language]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild size="sm" className="hidden gap-1.5 font-semibold shadow-md shadow-primary/25 sm:inline-flex">
              <Link to="/contact">
                <Mail className="h-4 w-4" />
                {t('action.getQuote')}
              </Link>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="text-left">{text('Navigation')}</SheetTitle>
                <nav aria-label="Mobile navigation" className="mt-6 flex flex-col gap-1">
                  {navigation(() => setOpen(false))}
                  <Button asChild className="mt-4 gap-2">
                    <Link to="/contact" onClick={() => setOpen(false)}>
                      <Mail className="h-4 w-4" />
                      {t('action.requestQuote')}
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
