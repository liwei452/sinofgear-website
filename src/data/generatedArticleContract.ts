import { productSlugs, type ProductSlug } from './products'
import type { Article, ArticleBlock, ArticleSection } from './articleTypes'

export interface GeneratedArticlePayload {
  organization_id: string
  site_code: string
  article_key: string
  version: number
  title: string
  summary: string
  body: string
  language: string
  target_market: string
  topic_cluster: string
  seo_title: string
  seo_description: string
  faq: Array<{ question: string; answer: string }>
  structured_data: Record<string, unknown>
  image_alt: string
  internal_links: Array<{ label: string; url: string }>
  evidence_ids: string[]
  published_at: string
  updated_at: string
}

const articleKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const knownProductSlugs = new Set<string>(productSlugs)
const knownCoreRoutes = new Set(['/', '/about', '/products', '/capabilities', '/quality', '/contact', '/blog'])

function fail(field: string): never {
  throw new Error(`Invalid generated article field: ${field}`)
}

function text(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) fail(field)
  return value.trim()
}

function headingId(value: string): string {
  const id = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return id || 'article-section'
}

function uniqueId(title: string, used: Set<string>): string {
  const base = headingId(title)
  let candidate = base
  let suffix = 2
  while (used.has(candidate)) candidate = `${base}-${suffix++}`
  used.add(candidate)
  return candidate
}

function parseTable(lines: string[], start: number): { block: ArticleBlock; next: number } | null {
  if (start + 1 >= lines.length || !lines[start].trim().startsWith('|')) return null
  if (!/^\|?(?:\s*:?-+:?\s*\|)+\s*$/.test(lines[start + 1].trim())) return null
  const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())
  const headers = cells(lines[start])
  const rows: string[][] = []
  let index = start + 2
  while (index < lines.length && lines[index].trim().startsWith('|')) rows.push(cells(lines[index++]))
  if (!headers.length || rows.some((row) => row.length !== headers.length)) fail('body')
  return { block: { type: 'table', headers, rows }, next: index }
}

function parseSections(body: string): ArticleSection[] {
  if (/<\/?[a-z][^>]*>/i.test(body)) fail('body')
  const lines = body.replace(/\r/g, '').split('\n')
  const usedIds = new Set<string>()
  const sections: ArticleSection[] = []
  let current: ArticleSection | null = null
  const section = (title: string) => {
    current = { id: uniqueId(title, usedIds), title, blocks: [] }
    sections.push(current)
  }
  let index = 0
  while (index < lines.length) {
    const line = lines[index].trim()
    if (!line) { index += 1; continue }
    if (line.startsWith('## ')) { section(text(line.slice(3), 'body')); index += 1; continue }
    if (!current) section('Overview')
    const active = current as ArticleSection
    if (line.startsWith('### ')) {
      const title = text(line.slice(4), 'body')
      active.blocks.push({ type: 'subheading', id: uniqueId(title, usedIds), title })
      index += 1
      continue
    }
    const table = parseTable(lines, index)
    if (table) { active.blocks.push(table.block); index = table.next; continue }
    const bullet = /^[-*]\s+(.+)$/.exec(line)
    const numbered = /^\d+\.\s+(.+)$/.exec(line)
    if (bullet || numbered) {
      const style = bullet ? 'bullet' : 'number'
      const items: string[] = []
      const pattern = bullet ? /^[-*]\s+(.+)$/ : /^\d+\.\s+(.+)$/
      while (index < lines.length) {
        const match = pattern.exec(lines[index].trim())
        if (!match) break
        items.push(match[1].trim())
        index += 1
      }
      active.blocks.push({ type: 'list', style, items })
      continue
    }
    const paragraph = [line]
    index += 1
    while (index < lines.length && lines[index].trim() && !/^#{2,3}\s|^[-*]\s|^\d+\.\s|^\|/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    active.blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
  }
  if (!sections.length || sections.some(({ blocks }) => !blocks.length)) fail('body')
  return sections
}

function parseFaq(value: unknown): Array<{ question: string; answer: string }> {
  if (!Array.isArray(value) || value.length < 3 || value.length > 8) fail('faq')
  return value.map((item) => {
    if (!item || typeof item !== 'object') fail('faq')
    const row = item as Record<string, unknown>
    return { question: text(row.question, 'faq'), answer: text(row.answer, 'faq') }
  })
}

function parseLinks(value: unknown): { links: GeneratedArticlePayload['internal_links']; products: ProductSlug[] } {
  if (!Array.isArray(value)) fail('internal_links')
  const products: ProductSlug[] = []
  const links = value.map((item) => {
    if (!item || typeof item !== 'object') fail('internal_links')
    const row = item as Record<string, unknown>
    const label = text(row.label, 'internal_links')
    const url = text(row.url, 'internal_links')
    const productMatch = /^\/products\/([a-z0-9-]+)$/.exec(url)
    if (!knownCoreRoutes.has(url) && !productMatch) fail('internal_links')
    if (productMatch) {
      if (!knownProductSlugs.has(productMatch[1])) fail('internal_links')
      products.push(productMatch[1] as ProductSlug)
    }
    return { label, url }
  })
  if (!products.length) fail('internal_links')
  return { links, products: [...new Set(products)] }
}

export function parseGeneratedArticle(input: unknown): Article {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('article')
  const value = input as Record<string, unknown>
  const articleKey = text(value.article_key, 'article_key')
  if (!articleKeyPattern.test(articleKey)) fail('article_key')
  if (!Number.isInteger(value.version) || Number(value.version) <= 0) fail('version')
  if (value.organization_id !== 'sinofgear') fail('organization_id')
  if (value.site_code !== 'sinofgears') fail('site_code')
  if (value.language !== 'en') fail('language')
  const title = text(value.title, 'title')
  const summary = text(value.summary, 'summary')
  const body = text(value.body, 'body')
  const seoDescription = text(value.seo_description, 'seo_description')
  if (seoDescription.length > 165) fail('seo_description')
  const publishedAt = text(value.published_at, 'published_at')
  const updatedAt = text(value.updated_at, 'updated_at')
  if (!datePattern.test(publishedAt) || !datePattern.test(updatedAt)) fail('published_at')
  const { products } = parseLinks(value.internal_links)
  const words = body.split(/\s+/).filter(Boolean).length
  return {
    slug: articleKey,
    title,
    description: seoDescription,
    excerpt: summary,
    topic: text(value.topic_cluster, 'topic_cluster'),
    publishedAt,
    updatedAt,
    readingMinutes: Math.max(5, Math.ceil(words / 220)),
    author: 'SINOF Engineering Team',
    heroImage: '/assets/gear-spur.jpg',
    heroImageAlt: text(value.image_alt, 'image_alt'),
    sections: parseSections(body),
    faq: parseFaq(value.faq),
    relatedProductSlugs: products,
    version: Number(value.version),
  }
}
