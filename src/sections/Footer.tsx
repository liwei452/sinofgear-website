import { MapPin, Mail, Phone } from 'lucide-react'
import { useLang } from '@/i18n/LanguageContext'
import { scrollToId } from './Header'

const EMAIL = 'sales@sinoform-gear.com'
const PHONE = '+86 574 8888 6666'

export default function Footer() {
  const { t } = useLang()

  const companyLinks = [
    { id: 'capabilities', label: t.footer.links.capabilities },
    { id: 'quality', label: t.footer.links.quality },
    { id: 'process', label: t.footer.links.process },
    { id: 'faq', label: t.footer.links.faq },
    { id: 'inquiry', label: t.footer.links.quote },
  ]

  return (
    <footer className="bg-[hsl(213,45%,9%)] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/assets/logo-icon.png" alt="SINOFORM" className="h-9 w-9 object-contain" />
              <span className="leading-none">
                <span className="block text-xl font-extrabold tracking-tight text-white">{t.brand}</span>
                <span className="block text-[10px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                  {t.brandSuffix}
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{t.footer.about}</p>
          </div>

          {/* products */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">{t.footer.productsTitle}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {t.products.items.map((p) => (
                <li key={p.id}>
                  <button onClick={() => scrollToId('products')} className="hover:text-sky-400 transition-colors">
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">{t.footer.companyTitle}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {companyLinks.map((l) => (
                <li key={l.id}>
                  <button onClick={() => scrollToId(l.id)} className="hover:text-sky-400 transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">{t.footer.contactTitle}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                {t.footer.address}
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-2.5 hover:text-sky-400 transition-colors">
                  <Mail className="h-4 w-4 shrink-0 text-sky-400" />
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-sky-400" />
                {PHONE}
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.quality.certs.map((c) => (
                <span key={c} className="rounded border border-white/15 px-2 py-1 text-[10px] font-semibold text-slate-400">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {t.brand} Precision Gears Co., Ltd. {t.footer.rights}
        </div>
      </div>
    </footer>
  )
}
