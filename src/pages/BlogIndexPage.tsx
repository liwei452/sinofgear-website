import { ArrowRight, Clock, FileText, Mail } from 'lucide-react'
import { Link } from 'react-router'
import Seo from '@/components/Seo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { articles } from '@/data/articles'
import { getSiteUrl } from '@/data/site'
import { useLang } from '@/i18n/LanguageContext'
import { buildBlogBreadcrumbSchema } from '@/lib/seo'

const englishNotice = 'Technical articles are currently available in English.'

function ArticleCard({ article, featured = false }: { article: (typeof articles)[number]; featured?: boolean }) {
  return (
    <article
      data-testid="article-card"
      className={`group overflow-hidden border border-border bg-card transition-colors hover:border-primary/45 ${
        featured ? 'grid md:grid-cols-2' : 'flex h-full flex-col'
      }`}
    >
      <Link to={`/blog/${article.slug}`} className="block overflow-hidden">
        <img
          src={article.heroImage}
          alt={article.heroImageAlt}
          className={`w-full object-cover transition duration-500 group-hover:scale-105 ${featured ? 'h-full min-h-72' : 'aspect-[16/9]'}`}
          loading={featured ? 'eager' : 'lazy'}
        />
      </Link>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <Badge variant="secondary" className="w-fit">{article.topic}</Badge>
        <h2 className={`${featured ? 'text-3xl' : 'text-xl'} mt-4 font-extrabold tracking-tight`}>
          <Link to={`/blog/${article.slug}`} className="transition-colors hover:text-primary">
            {article.title}
          </Link>
        </h2>
        <p className="mt-3 flex-1 leading-7 text-muted-foreground">{article.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {article.readingMinutes} min read
          </span>
          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
        </div>
        <Link
          to={`/blog/${article.slug}`}
          className="mt-6 inline-flex items-center gap-2 font-bold text-primary"
        >
          Read article <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

export default function BlogIndexPage() {
  const { lang } = useLang()
  const [featured, ...remaining] = articles

  return (
    <>
      <Seo
        seo={{
          title: 'Gear Sourcing Insights | SINOF',
          description:
            'Practical guidance for custom gear RFQs, drawings, accuracy grades, materials, heat treatment, supplier review, and production planning.',
        }}
        pathname="/blog"
        image={featured.heroImage}
        structuredData={[buildBlogBreadcrumbSchema(undefined, getSiteUrl())]}
      />

      <section className="border-b border-border bg-[hsl(210_45%_98%)] px-4 py-20 text-foreground sm:px-6 lg:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-primary/20 bg-accent text-primary">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-primary">SINOF Insights</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Gear Sourcing Insights</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            Practical engineering and sourcing guidance for drawing-led custom gear projects.
          </p>
          {lang !== 'en' && (
            <p className="mx-auto mt-6 max-w-2xl border border-primary/20 bg-accent px-4 py-3 text-sm text-primary">
              {englishNotice}
            </p>
          )}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <ArticleCard article={featured} featured />
          <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {remaining.map((article) => <ArticleCard key={article.slug} article={article} />)}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/50 px-4 py-14 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Have a gear drawing ready for review?</h2>
            <p className="mt-2 text-muted-foreground">Send the drawing, quantity, material, accuracy target, and application context.</p>
          </div>
          <Button asChild size="lg">
            <Link to="/contact"><Mail className="h-4 w-4" />Request drawing review</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
