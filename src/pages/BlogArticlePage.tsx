import { ArrowLeft, ArrowRight, Clock, Mail } from 'lucide-react'
import { Link, useParams } from 'react-router'
import Seo from '@/components/Seo'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getArticleBySlug,
  getRelatedArticles,
  type ArticleBlock,
} from '@/data/articles'
import { getProductBySlug } from '@/data/products'
import { getSiteUrl } from '@/data/site'
import { useLang } from '@/i18n/LanguageContext'
import {
  buildArticleSchema,
  buildBlogBreadcrumbSchema,
  buildFaqSchema,
} from '@/lib/seo'
import NotFoundPage from './NotFoundPage'
import './blog.css'

const englishNotice = 'Technical articles are currently available in English.'

function ArticleContentBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="mt-4 text-muted-foreground">{block.text}</p>
    case 'list': {
      const List = block.style === 'number' ? 'ol' : 'ul'
      return (
        <List className={`mt-4 space-y-2 pl-6 text-muted-foreground ${block.style === 'number' ? 'list-decimal' : 'list-disc'}`}>
          {block.items.map((item) => <li key={item}>{item}</li>)}
        </List>
      )
    }
    case 'table':
      return (
        <div className="mt-6 overflow-x-auto rounded-xl border">
          <table>
            <thead><tr>{block.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${row[0]}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'note':
      return (
        <aside className="mt-6 rounded-xl border-l-4 border-sky-500 bg-sky-50 p-5">
          <h3 className="font-bold text-slate-950">{block.title}</h3>
          <p className="mt-2 text-slate-700">{block.text}</p>
        </aside>
      )
    case 'subheading':
      return <h3 id={block.id} className="mt-8 text-xl font-bold tracking-tight">{block.title}</h3>
  }
}

export default function BlogArticlePage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const article = getArticleBySlug(slug)

  if (!article) return <NotFoundPage />

  const baseUrl = getSiteUrl()
  const relatedProducts = article.relatedProductSlugs
    .map((productSlug) => getProductBySlug(productSlug))
    .filter((product) => product !== undefined)
  const relatedArticles = getRelatedArticles(article)

  return (
    <>
      <Seo
        seo={{ title: `${article.title} | SINOF`, description: article.description }}
        pathname={`/blog/${article.slug}`}
        type="article"
        image={article.heroImage}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        structuredData={[
          buildArticleSchema(article, baseUrl),
          buildBlogBreadcrumbSchema(article, baseUrl),
          buildFaqSchema(article.faq),
        ]}
      />

      <article>
        <header className="bg-steel px-4 py-16 text-white sm:px-6 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <nav aria-label="Breadcrumb" className="text-sm text-slate-300">
              <Link to="/" className="hover:text-white">Home</Link>
              <span aria-hidden="true" className="mx-2">/</span>
              <Link to="/blog" className="hover:text-white">Insights</Link>
            </nav>
            <Badge className="mt-7 bg-sky-500/20 text-sky-100 hover:bg-sky-500/20">{article.topic}</Badge>
            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{article.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-300">
              <span>{article.author}</span>
              <time dateTime={article.publishedAt}>{article.publishedAt}</time>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{article.readingMinutes} min read</span>
            </div>
            {lang !== 'en' && (
              <p className="mt-6 max-w-2xl rounded-lg border border-sky-300/25 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
                {englishNotice}
              </p>
            )}
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-20">
          <aside>
            <nav aria-label="Table of contents" className="sticky top-24 rounded-xl border bg-card p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider">In this article</h2>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                {article.sections.map((section) => (
                  <li key={section.id}><a href={`#${section.id}`} className="hover:text-primary">{section.title}</a></li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0">
            <img src={article.heroImage} alt={article.heroImageAlt} className="aspect-[16/7] w-full rounded-2xl object-cover" />
            <div className="blog-prose mx-auto max-w-4xl">
              {article.sections.map((section) => (
                <section key={section.id} aria-labelledby={section.id} className="pt-10">
                  <h2 id={section.id} className="text-3xl font-extrabold tracking-tight">{section.title}</h2>
                  {section.blocks.map((block, index) => <ArticleContentBlock key={`${section.id}-${index}`} block={block} />)}
                </section>
              ))}
            </div>

            <section className="mt-14 border-t pt-10" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight">Frequently asked questions</h2>
              <Accordion type="single" collapsible className="mt-5">
                {article.faq.map((item, index) => (
                  <AccordionItem key={item.question} value={`faq-${index}`}>
                    <AccordionTrigger className="text-base font-bold">{item.question}</AccordionTrigger>
                    <AccordionContent className="leading-7 text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <section className="mt-12 rounded-2xl bg-steel p-7 text-white sm:p-9">
              <h2 className="text-2xl font-extrabold">Discuss your gear drawing with our team</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">Share the drawing, quantity, material, accuracy target, heat treatment, and application context for engineering review.</p>
              <Button asChild className="mt-6" size="lg"><Link to="/contact"><Mail className="h-4 w-4" />Request drawing review</Link></Button>
            </section>

            <section aria-label="Related products" className="mt-12">
              <h2 className="text-2xl font-extrabold tracking-tight">Related products</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {relatedProducts.map((product) => (
                  <Button key={product.slug} asChild variant="outline"><Link to={`/products/${product.slug}`}>{product.shortName}</Link></Button>
                ))}
              </div>
            </section>

            <section className="mt-12 border-t pt-10">
              <h2 className="text-2xl font-extrabold tracking-tight">Related insights</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link key={related.slug} to={`/blog/${related.slug}`} className="rounded-xl border p-5 transition hover:border-primary hover:shadow-md">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{related.topic}</span>
                    <span className="mt-2 block font-bold leading-6">{related.title}</span>
                    <ArrowRight className="mt-4 h-4 w-4 text-primary" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>

            <Link to="/blog" className="mt-10 inline-flex items-center gap-2 font-bold text-primary"><ArrowLeft className="h-4 w-4" />Back to Insights</Link>
          </div>
        </div>
      </article>
    </>
  )
}
