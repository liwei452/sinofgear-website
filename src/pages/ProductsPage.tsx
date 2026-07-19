import PageHero from '@/components/PageHero'
import ProductCard from '@/components/ProductCard'
import Seo from '@/components/Seo'
import { pages } from '@/data/pages'
import { products } from '@/data/products'
import { useLang } from '@/i18n/LanguageContext'
import { localizeValue } from '@/i18n/messages'

export default function ProductsPage() {
  const { lang } = useLang()
  const page = localizeValue(pages.products, lang)
  return (
    <>
      <Seo seo={page.seo} pathname="/products" />
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        subtitle={page.subtitle}
        compact
      />
      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
