import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { localizeProduct, type Product } from '@/data/products'
import { useLang } from '@/i18n/LanguageContext'

export default function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useLang()
  const localizedProduct = localizeProduct(product, lang)
  return (
    <article
      data-product-slug={product.slug}
      className="group flex h-full flex-col overflow-hidden border border-border/80 bg-card transition-colors hover:border-primary/45"
    >
      <Link to={`/products/${product.slug}`} className="relative aspect-[3/2] overflow-hidden">
        <img
          src={localizedProduct.image}
          alt={localizedProduct.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-semibold tracking-[-0.02em]">
          <Link to={`/products/${product.slug}`} className="transition-colors hover:text-primary">
            {localizedProduct.shortName}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{localizedProduct.valueProposition}</p>
        <Link
          to={`/products/${product.slug}`}
          className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {t('action.details')}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
