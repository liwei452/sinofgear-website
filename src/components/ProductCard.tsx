import { ArrowRight, Mail } from 'lucide-react'
import { Link } from 'react-router'
import { localizeProduct, type Product } from '@/data/products'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLang } from '@/i18n/LanguageContext'

export default function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useLang()
  const localizedProduct = localizeProduct(product, lang)
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <Link to={`/products/${product.slug}`} className="relative aspect-[3/2] overflow-hidden">
        <img
          src={localizedProduct.image}
          alt={localizedProduct.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h2 className="text-xl font-bold tracking-tight">
          <Link to={`/products/${product.slug}`} className="transition-colors hover:text-primary">
            {localizedProduct.shortName}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{localizedProduct.valueProposition}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {localizedProduct.industries.slice(0, 2).map((industry) => (
            <Badge key={industry} variant="secondary" className="font-medium">
              {industry}
            </Badge>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button asChild variant="outline">
            <Link to={`/products/${product.slug}`}>
              {t('action.details')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/contact?product=${product.slug}`}>
              <Mail className="h-4 w-4" />
              {t('action.requestQuote')}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
