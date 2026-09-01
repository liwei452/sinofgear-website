import { Link } from 'react-router'
import { primaryNavigation } from '@/data/navigation'
import { productFamilies, productsForFamily } from '@/data/productFamilies'
import { siteConfig } from '@/data/site'
import { useLang } from '@/i18n/LanguageContext'

export default function Footer() {
  const { lang, text, t } = useLang()
  const routeLabels = new Map(primaryNavigation.map((item) => [item.href, item.label]))

  return (
    <footer className="border-t border-border bg-[hsl(210_30%_97%)] text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5" aria-label="SINOF home">
              <img src="/assets/logo-icon.png" alt="" className="h-10 w-10 object-contain" />
              <span className="leading-none">
                <span className="block text-xl font-extrabold tracking-[-0.03em] text-primary">{siteConfig.brand}</span>
                <span className="mt-1 block text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
                  {text(siteConfig.descriptor)}
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              {text('Drawing-led manufacturing review for custom gears, timing-drive components, and industrial belt projects.')}
            </p>
            <p className="mt-5 text-sm font-semibold leading-6">{siteConfig.legalName}</p>
            <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">{siteConfig.address}</p>
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold">{text('Product families')}</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {productFamilies.map((family) => (
                <div key={family.id}>
                  <Link to={`/products#${family.id}`} className="text-sm font-semibold text-primary hover:underline">
                    {text(family.name)}
                  </Link>
                  <ul className="mt-2 space-y-1.5">
                    {productsForFamily(family.id).slice(0, 4).map((product) => (
                      <li key={product.slug}>
                        <Link to={`/products/${product.slug}`} className="text-sm text-muted-foreground hover:text-primary">
                          {text(product.shortName)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold">{text('Buyer paths')}</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-primary">{text('Products')}</Link></li>
              <li><Link to="/capabilities" className="text-muted-foreground hover:text-primary">{text(routeLabels.get('/capabilities') ?? 'Manufacturing')}</Link></li>
              <li><Link to="/quality" className="text-muted-foreground hover:text-primary">{text(routeLabels.get('/quality') ?? 'Quality')}</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">{text(routeLabels.get('/about') ?? 'Company')}</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary">{text('Insights')}</Link></li>
              <li><Link to="/contact" className="font-semibold text-primary hover:underline">{text('Submit Drawing')}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold">{text('Direct contact')}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <p className="font-semibold">{lang === 'zh' ? siteConfig.businessContactZh : siteConfig.businessContact}</p>
              <a href={`mailto:${siteConfig.email}`} className="block break-all text-primary hover:underline">{siteConfig.email}</a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.brand}. {t('footer.rights')}</p>
          <p>{text('Technical review precedes quotation and production confirmation.')}</p>
        </div>
      </div>
    </footer>
  )
}
