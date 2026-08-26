import type { ProductSlug } from './products'

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; style: 'bullet' | 'number'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'note'; title: string; text: string }
  | { type: 'subheading'; id: string; title: string }

export interface ArticleSection {
  id: string
  title: string
  blocks: ArticleBlock[]
}

export interface Article {
  slug: string
  title: string
  description: string
  excerpt: string
  topic: string
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  author: 'SINOF Engineering Team'
  heroImage: string
  heroImageAlt: string
  sections: ArticleSection[]
  faq: Array<{ question: string; answer: string }>
  relatedProductSlugs: ProductSlug[]
  version?: number
}
