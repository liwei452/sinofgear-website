import PageHero from '@/components/PageHero'
import ProductCard from '@/components/ProductCard'
import Seo from '@/components/Seo'
import { pages } from '@/data/pages'
import { productFamilies, productsForFamily } from '@/data/productFamilies'
import { useLang } from '@/i18n/LanguageContext'
import { localizeValue } from '@/i18n/messages'

export default function ProductsPage() {
  const { lang, text } = useLang()
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
      <div className="bg-background">
        {productFamilies.map((family, index) => (
          <section
            id={family.id}
            key={family.id}
            className={index % 2 === 0 ? 'py-16 lg:py-24' : 'border-y border-border/70 bg-secondary/35 py-16 lg:py-24'}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 grid gap-5 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] lg:items-end">
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-primary">{String(index + 1).padStart(2, '0')}</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{text(family.name)}</h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:justify-self-end">
                  {text(family.description)}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {productsForFamily(family.id).map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
