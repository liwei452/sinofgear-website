import { describe, expect, it } from 'vitest'
import { articles, articleRoutes, getArticleBySlug, getRelatedArticles } from './articles'
import { productSlugs } from './products'
import { publicRoutes } from './site'

const approvedSlugs = [
  'what-information-is-needed-for-custom-gear-rfq',
  'spur-gear-vs-helical-gear',
  'iso-1328-gbt-10095-gear-accuracy-grades',
  'custom-gear-materials-heat-treatment',
  'prepare-gear-drawing-for-manufacturing',
  'custom-gear-prototype-to-production',
]

describe('technical articles', () => {
  it('publishes the six approved unique routes', () => {
    expect(articles.map(({ slug }) => slug)).toEqual(approvedSlugs)
    expect(new Set(articles.map(({ slug }) => slug)).size).toBe(6)
    expect(articleRoutes).toEqual(approvedSlugs.map((slug) => `/blog/${slug}`))
  })

  it('provides complete editorial metadata', () => {
    for (const article of articles) {
      expect(article.title.length).toBeGreaterThan(20)
      expect(article.description.length).toBeGreaterThan(80)
      expect(article.description.length).toBeLessThanOrEqual(165)
      expect(article.excerpt.length).toBeGreaterThan(80)
      expect(article.author).toBe('SINOF Engineering Team')
      expect(article.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(article.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(article.readingMinutes).toBeGreaterThanOrEqual(5)
      expect(article.heroImage).toMatch(/^\/assets\//)
    }
  })

  it('contains structured, useful article bodies', () => {
    for (const article of articles) {
      expect(article.sections.length).toBeGreaterThanOrEqual(4)
      expect(article.sections.some(({ blocks }) => blocks.some(({ type }) => type === 'table'))).toBe(true)
      expect(article.faq.length).toBeGreaterThanOrEqual(3)

      const headingIds = article.sections.flatMap((section) => [
        section.id,
        ...section.blocks.flatMap((block) => (block.type === 'subheading' ? [block.id] : [])),
      ])
      expect(new Set(headingIds).size).toBe(headingIds.length)
    }
  })

  it('only links to known products', () => {
    const known = new Set<string>(productSlugs)
    for (const article of articles) {
      expect(article.relatedProductSlugs.length).toBeGreaterThan(0)
      expect(article.relatedProductSlugs.every((slug) => known.has(slug))).toBe(true)
    }
  })

  it('qualifies manufacturing outcomes for engineering review', () => {
    for (const article of articles) {
      expect(JSON.stringify(article)).toMatch(/drawing review|engineering review/i)
    }
  })

  it('looks up known slugs and leaves unknown slugs unresolved', () => {
    expect(getArticleBySlug(approvedSlugs[0])).toBe(articles[0])
    expect(getArticleBySlug('missing')).toBeUndefined()
  })

  it('returns related articles without returning the current article', () => {
    const related = getRelatedArticles(articles[0], 3)
    expect(related).toHaveLength(3)
    expect(related).not.toContain(articles[0])
  })

  it('keeps every blog and related-product link inside known public routes', () => {
    const knownRoutes = new Set<string>(publicRoutes)
    for (const route of articleRoutes) expect(knownRoutes.has(route)).toBe(true)
    for (const article of articles) {
      for (const productSlug of article.relatedProductSlugs) {
        expect(knownRoutes.has(`/products/${productSlug}`)).toBe(true)
      }
    }
    expect(knownRoutes.has('/contact')).toBe(true)
  })
})
