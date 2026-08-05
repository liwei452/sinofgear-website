import { Link } from 'react-router'
import { navItems, siteConfig } from '@/data/site'
import { localizeProduct, products } from '@/data/products'
import { useLang } from '@/i18n/LanguageContext'

export default function Footer() {
  const { lang, text, t } = useLang()
  const localizedProducts = products.map((product) => localizeProduct(product, lang))
  return (
    <footer className="bg-[hsl(213,45%,9%)] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/assets/logo-icon.png" alt="" className="h-9 w-9 object-contain" />
              <span className="leading-none">
                <span className="block text-xl font-extrabold tracking-tight text-white">{siteConfig.brand}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {text(siteConfig.descriptor)}
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {text('Drawing-led inquiries for custom gears, timing pulleys, gear racks, and geared components.')}
            </p>
            <p className="mt-5 text-sm font-semibold leading-6 text-white">
              {siteConfig.legalName}
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <a
                href={`mailto:${siteConfig.email}`}
                className="block transition-colors hover:text-sky-400"
              >
                {siteConfig.email}
              </a>
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
                className="block transition-colors hover:text-sky-400"
              >
                {siteConfig.phone}
              </a>
              <p className="text-xs leading-5">{siteConfig.address}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">{t('nav.products')}</h2>
            <ul className="mt-4 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
              {localizedProducts.map((product) => (
                <li key={product.slug}>
                  <Link to={`/products/${product.slug}`} className="transition-colors hover:text-sky-400">
                    {product.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">SINOF</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="transition-colors hover:text-sky-400">
                    {text(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {siteConfig.brand}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
