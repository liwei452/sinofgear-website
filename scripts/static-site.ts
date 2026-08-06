import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { articles, getRelatedArticles, type Article, type ArticleBlock } from '../src/data/articles'
import { getProductBySlug } from '../src/data/products'
import { publicRoutes } from '../src/data/site'
import {
  buildArticleSchema,
  buildBlogBreadcrumbSchema,
  buildFaqSchema,
  buildOrganizationSchema,
} from '../src/lib/seo'

export interface GenerateStaticSiteOptions {
  distDir: string
  siteUrl?: string
}

interface StaticPageMeta {
  title: string
  description: string
  pathname: string
  type: 'website' | 'article'
  image: string
  structuredData: Array<Record<string, unknown>>
  publishedAt?: string
  updatedAt?: string
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeXml(value: string): string {
  return escapeHtml(value)
}

function buildSitemap(siteUrl: string): string {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '')
  const articleDates = new Map(
    articles.map((article) => [`/blog/${article.slug}`, article.updatedAt]),
  )
  const uniqueRoutes = [...new Set<string>(publicRoutes)]
  const entries = uniqueRoutes
    .map((route) => {
      const location = route === '/' ? `${normalizedSiteUrl}/` : `${normalizedSiteUrl}${route}`
      const lastModified = articleDates.get(route)
      return `<url><loc>${escapeXml(location)}</loc>${
        lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : ''
      }</url>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>\n`
}

function buildRobots(siteUrl: string): string {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '')
  return `User-agent: *\nAllow: /\n\nSitemap: ${normalizedSiteUrl}/sitemap.xml\n`
}

function renderBlock(block: ArticleBlock): string {
  switch (block.type) {
    case 'paragraph':
      return `<p>${escapeHtml(block.text)}</p>`
    case 'list': {
      const tag = block.style === 'number' ? 'ol' : 'ul'
      return `<${tag}>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`
    }
    case 'table':
      return `<div class="static-table-wrap"><table><thead><tr>${block.headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    case 'note':
      return `<aside><h3>${escapeHtml(block.title)}</h3><p>${escapeHtml(block.text)}</p></aside>`
    case 'subheading':
      return `<h3 id="${escapeHtml(block.id)}">${escapeHtml(block.title)}</h3>`
  }
}

function renderBlogIndex(): string {
  return `<main data-static-blog><header><p>SINOF Insights</p><h1>Gear Sourcing Insights</h1><p>Practical engineering and sourcing guidance for drawing-led custom gear projects.</p></header><section aria-label="Technical articles">${articles
    .map(
      (article) =>
        `<article data-static-article-card><img src="${escapeHtml(article.heroImage)}" alt="${escapeHtml(article.heroImageAlt)}"><p>${escapeHtml(article.topic)}</p><h2><a href="/blog/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.excerpt)}</p><p>${article.readingMinutes} min read · <time datetime="${article.publishedAt}">${article.publishedAt}</time></p></article>`,
    )
    .join('')}</section><section><h2>Have a gear drawing ready for review?</h2><p>Send the drawing, quantity, material, accuracy target, and application context.</p><a href="/contact">Request drawing review</a></section></main>`
}

function renderArticle(article: Article): string {
  const relatedProducts = article.relatedProductSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((product) => product !== undefined)
  const relatedArticles = getRelatedArticles(article)

  return `<main data-static-blog><article><header><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Insights</a></nav><p>${escapeHtml(article.topic)}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.excerpt)}</p><p>${escapeHtml(article.author)} · <time datetime="${article.publishedAt}">${article.publishedAt}</time> · ${article.readingMinutes} min read</p><img src="${escapeHtml(article.heroImage)}" alt="${escapeHtml(article.heroImageAlt)}"></header><nav aria-label="Table of contents"><h2>In this article</h2><ol>${article.sections.map((section) => `<li><a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a></li>`).join('')}</ol></nav><div>${article.sections.map((section) => `<section><h2 id="${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2>${section.blocks.map(renderBlock).join('')}</section>`).join('')}</div><section><h2>Frequently asked questions</h2>${article.faq.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</section><section><h2>Discuss your gear drawing with our team</h2><p>Share the drawing, quantity, material, accuracy target, heat treatment, and application context for engineering review.</p><a href="/contact">Request drawing review</a></section><section aria-label="Related products"><h2>Related products</h2>${relatedProducts.map((product) => `<a href="/products/${escapeHtml(product.slug)}">${escapeHtml(product.shortName)}</a>`).join(' ')}</section><section><h2>Related insights</h2>${relatedArticles.map((related) => `<article><h3><a href="/blog/${escapeHtml(related.slug)}">${escapeHtml(related.title)}</a></h3></article>`).join('')}</section></article></main>`
}

function serializeJsonLd(data: Array<Record<string, unknown>>): string {
  return JSON.stringify(data).replaceAll('<', '\\u003c')
}

export function injectStaticPage(
  template: string,
  body: string,
  meta: StaticPageMeta,
  siteUrl: string,
): string {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, '')
  const canonical = `${normalizedSiteUrl}${meta.pathname === '/' ? '/' : meta.pathname}`
  const image = `${normalizedSiteUrl}${meta.image}`
  const articleMeta = [
    meta.publishedAt
      ? `<meta property="article:published_time" content="${escapeHtml(meta.publishedAt)}">`
      : '',
    meta.updatedAt
      ? `<meta property="article:modified_time" content="${escapeHtml(meta.updatedAt)}">`
      : '',
  ].join('')
  const additions = `<link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:title" content="${escapeHtml(meta.title)}"><meta property="og:description" content="${escapeHtml(meta.description)}"><meta property="og:type" content="${meta.type}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(image)}">${articleMeta}<script type="application/ld+json">${serializeJsonLd(meta.structuredData)}</script>`

  return template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeHtml(meta.description)}">`,
    )
    .replace('</head>', `${additions}</head>`)
    .replace('<div id="root"></div>', `<div id="root" data-prerendered>${body}</div>`)
}

async function writeRoute(distDir: string, pathname: string, html: string) {
  if (pathname === '/') {
    await writeFile(join(distDir, 'index.html'), html, 'utf8')
    return
  }

  const segments = pathname.split('/').filter(Boolean)
  const fileName = `${segments.at(-1)}.html`
  const routeDirectory = join(distDir, ...segments.slice(0, -1))
  await mkdir(routeDirectory, { recursive: true })
  await writeFile(join(routeDirectory, fileName), html, 'utf8')
}

export async function generateStaticSite({
  distDir,
  siteUrl = 'https://sinfogear.com',
}: GenerateStaticSiteOptions) {
  const template = await readFile(join(distDir, 'index.html'), 'utf8')
  const indexMeta: StaticPageMeta = {
    title: 'Gear Sourcing Insights | SINOF',
    description:
      'Practical guidance for custom gear RFQs, drawings, accuracy grades, materials, heat treatment, supplier review, and production planning.',
    pathname: '/blog',
    type: 'website',
    image: articles[0].heroImage,
    structuredData: [
      buildOrganizationSchema(siteUrl),
      buildBlogBreadcrumbSchema(undefined, siteUrl),
    ],
  }
  await writeRoute(
    distDir,
    '/blog',
    injectStaticPage(template, renderBlogIndex(), indexMeta, siteUrl),
  )

  for (const article of articles) {
    const pathname = `/blog/${article.slug}`
    const articleMeta: StaticPageMeta = {
      title: `${article.title} | SINOF`,
      description: article.description,
      pathname,
      type: 'article',
      image: article.heroImage,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      structuredData: [
        buildOrganizationSchema(siteUrl),
        buildArticleSchema(article, siteUrl),
        buildBlogBreadcrumbSchema(article, siteUrl),
        buildFaqSchema(article.faq),
      ],
    }
    await writeRoute(
      distDir,
      pathname,
      injectStaticPage(template, renderArticle(article), articleMeta, siteUrl),
    )
  }

  await writeFile(join(distDir, 'sitemap.xml'), buildSitemap(siteUrl), 'utf8')
  await writeFile(join(distDir, 'robots.txt'), buildRobots(siteUrl), 'utf8')
}
