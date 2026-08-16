import { Link, useParams } from 'react-router'
import PageHero from '@/components/PageHero'
import Seo from '@/components/Seo'
import { Button } from '@/components/ui/button'
import {
  industries,
  isIndustrySlug,
  isNeedSlug,
  landingTitle,
  needProducts,
  needs,
} from '@/data/landingPages'
import { getProductBySlug, type Product } from '@/data/products'
import NotFoundPage from './NotFoundPage'

export default function IndustryLandingPage() {
  const { industry, need } = useParams()
  if (!isIndustrySlug(industry) || !isNeedSlug(need)) return <NotFoundPage />

  const industryConfig = industries[industry]
  const needConfig = needs[need]
  const title = landingTitle(industry, need)
  const products = needProducts[need]
    .map(getProductBySlug)
    .filter((product): product is Product => product !== undefined)

  return (
    <>
      <Seo
        seo={{
          title: `${title} | SINOF`,
          description: `${needConfig.description} ${industryConfig.description}`,
        }}
        pathname={`/industries/${industry}/${need}/`}
        type="website"
      />
      <PageHero
        eyebrow={`${industryConfig.label} · ${needConfig.label}`}
        title={title}
        subtitle={`${needConfig.description} ${industryConfig.description}`}
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight">Related products</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          Start with the product group most likely to match your application, then send a drawing,
          sample, or application note for a specific review.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.slug}
              to={`/products/${product.slug}`}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:border-sky-300"
            >
              <h3 className="text-lg font-bold group-hover:text-sky-700">{product.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{product.valueProposition}</p>
            </Link>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <Button asChild><Link to="/contact">Request a quote</Link></Button>
          <Button asChild variant="outline"><Link to="/capabilities">View capabilities</Link></Button>
        </div>
      </section>
    </>
  )
}
