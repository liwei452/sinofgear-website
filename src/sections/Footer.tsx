import { Link } from 'react-router'
import { navItems, siteConfig } from '@/data/site'
import { products } from '@/data/products'

export default function Footer() {
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
                  {siteConfig.descriptor}
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Drawing-led inquiries for custom gears, timing pulleys, gear racks, and geared components.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Products</h2>
            <ul className="mt-4 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
              {products.map((product) => (
                <li key={product.slug}>
                  <Link to={`/products/${product.slug}`} className="transition-colors hover:text-sky-400">
                    {product.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">SINOFORM</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="transition-colors hover:text-sky-400">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {siteConfig.brand}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
