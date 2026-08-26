import { useState } from 'react'
import { ChevronDown, FileUp, Globe, Menu } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  applicationNavigationGroups,
  primaryNavigation,
  productNavigationGroups,
  type NavigationGroup,
} from '@/data/navigation'
import { siteConfig } from '@/data/site'
import { useLang } from '@/i18n/LanguageContext'
import { languageNames, supportedLanguages } from '@/i18n/language'

interface DesktopMenuProps {
  label: string
  groups: readonly NavigationGroup[]
  allHref: string
  allLabel: string
}

function DesktopMenu({ label, groups, allHref, allLabel }: DesktopMenuProps) {
  const { text } = useLang()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-1 px-3 text-sm font-semibold text-foreground/75 hover:text-primary">
          {text(label)}
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" sideOffset={12} className="w-[min(760px,calc(100vw-32px))] p-0">
        <div className="grid gap-px bg-border md:grid-cols-3">
          {groups.map((group) => (
            <div key={group.label} className="bg-white p-5">
              <DropdownMenuLabel className="px-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground">
                {text(group.label)}
              </DropdownMenuLabel>
              <div className="mt-2 space-y-0.5">
                {group.links.map((link) => (
                  <DropdownMenuItem key={`${group.label}-${link.href}-${link.label}`} asChild className="items-start py-2.5">
                    <Link to={link.href}>
                      <span>
                        <span className="block font-semibold text-foreground">{text(link.label)}</span>
                        {link.description && (
                          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                            {text(link.description)}
                          </span>
                        )}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem asChild className="m-2 justify-between px-3 py-2.5 font-semibold text-primary">
          <Link to={allHref}>
            {text(allLabel)}
            <span aria-hidden="true">→</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Header() {
  const { lang, setLang, text } = useLang()
  const [open, setOpen] = useState(false)
  const desktopItems = primaryNavigation.filter((item) => !('menu' in item))

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[76px]">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="SINOF home">
            <img src="/assets/logo-icon.png" alt="" className="h-9 w-9 object-contain" />
            <span className="leading-none">
              <span className="block text-xl font-extrabold tracking-[-0.03em] text-primary">{siteConfig.brand}</span>
              <span className="mt-1 block text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
                {text(siteConfig.descriptor)}
              </span>
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-0.5 lg:flex">
            <DesktopMenu label="Products" groups={productNavigationGroups} allHref="/products" allLabel="View all products" />
            <DesktopMenu label="Applications" groups={applicationNavigationGroups} allHref="/industries/industrial_machinery/custom-gears" allLabel="Explore application paths" />
            {desktopItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => `px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'text-primary' : 'text-foreground/75 hover:text-primary'}`}
              >
                {text(item.label)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-foreground/75">
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden xl:inline">{languageNames[lang]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {supportedLanguages.map((language) => (
                  <DropdownMenuItem key={language} onClick={() => setLang(language)} className={language === lang ? 'font-bold text-primary' : ''}>
                    {languageNames[language]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild size="sm" className="hidden h-10 gap-2 rounded-md px-4 font-semibold sm:inline-flex">
              <Link to="/contact">
                <FileUp className="h-4 w-4" aria-hidden="true" />
                {text('Submit Drawing')}
              </Link>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(92vw,380px)] overflow-y-auto p-0">
                <div className="border-b p-5 pr-12">
                  <SheetTitle className="text-left text-lg">{text('Find the right path')}</SheetTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{text('Choose a product, application, or technical review route.')}</p>
                </div>
                <nav aria-label="Mobile navigation" className="space-y-7 p-5">
                  <div>
                    <Link to="/products" onClick={() => setOpen(false)} className="text-base font-semibold text-foreground">{text('Products')}</Link>
                    <div className="mt-3 space-y-5">
                      {productNavigationGroups.map((group) => (
                        <div key={group.label}>
                          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground">{text(group.label)}</p>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                            {group.links.map((link) => (
                              <Link key={`${group.label}-${link.href}-${link.label}`} to={link.href} onClick={() => setOpen(false)} className="text-sm leading-5 text-foreground/80 hover:text-primary">
                                {text(link.label)}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <p className="text-base font-semibold text-foreground">{text('Applications')}</p>
                    <div className="mt-3 space-y-4">
                      {applicationNavigationGroups.map((group) => (
                        <div key={group.label}>
                          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground">{text(group.label)}</p>
                          <div className="mt-2 grid gap-2">
                            {group.links.slice(0, 3).map((link) => (
                              <Link key={`${group.label}-${link.href}-${link.label}`} to={link.href} onClick={() => setOpen(false)} className="text-sm text-foreground/80 hover:text-primary">
                                {text(link.label)}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-1 border-t pt-5">
                    {desktopItems.map((item) => (
                      <Link key={item.href} to={item.href} onClick={() => setOpen(false)} className="py-2 text-sm font-semibold text-foreground/80 hover:text-primary">
                        {text(item.label)}
                      </Link>
                    ))}
                  </div>

                  <Button asChild className="h-12 w-full gap-2 rounded-md font-semibold">
                    <Link to="/contact" onClick={() => setOpen(false)}>
                      <FileUp className="h-4 w-4" aria-hidden="true" />
                      {text('Submit Drawing')}
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
