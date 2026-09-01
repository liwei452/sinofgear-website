import { describe, expect, it } from 'vitest'
import { products } from '@/data/products'
import { articles } from '@/data/articles'
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildBlogBreadcrumbSchema,
  buildCanonicalUrl,
  buildFaqSchema,
  buildOrganizationSchema,
  buildPageBreadcrumbSchema,
  buildProductSchema,
} from './seo'

describe('SEO builders', () => {
  it('normalizes canonical URLs without duplicate slashes', () => {
    expect(buildCanonicalUrl('https://sinfogear.com/', '/products')).toBe(
      'https://sinfogear.com/products',
    )
    expect(buildCanonicalUrl('https://sinfogear.com/', '/')).toBe('https://sinfogear.com/')
  })

  it('includes email contact facts without publishing a telephone in Organization data', () => {
    const schema = buildOrganizationSchema('https://sinfogear.com')

    expect(schema).toMatchObject({
      '@type': 'Organization',
      name: 'SINOF',
      legalName: 'Changsha Xingfeng Transmission Machinery Co., Ltd.',
      foundingDate: '2008',
      email: 'wei.li@sinofgears.com',
    })
    expect(schema).not.toHaveProperty('telephone')
  })

  it('does not invent product commercial data', () => {
    const schema = buildProductSchema(products[0], 'https://sinfogear.com')
    expect(schema).toMatchObject({
      '@type': 'Product',
      name: products[0].name,
      description: products[0].valueProposition,
    })
    expect(schema).not.toHaveProperty('offers')
    expect(schema).not.toHaveProperty('aggregateRating')
    expect(schema).not.toHaveProperty('sku')
  })

  it('builds ordered product breadcrumbs', () => {
    const schema = buildBreadcrumbSchema(products[0], 'https://sinfogear.com')
    expect(schema.itemListElement).toHaveLength(3)
    expect(schema.itemListElement.map((item) => item.position)).toEqual([1, 2, 3])
  })

  it('builds breadcrumbs for a standalone public page', () => {
    const schema = buildPageBreadcrumbSchema(
      'About SINOF',
      '/about',
      'https://sinfogear.com',
    )
    expect(schema.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://sinfogear.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About SINOF',
        item: 'https://sinfogear.com/about',
      },
    ])
  })

  it('maps the visible product FAQ into FAQPage data', () => {
    const schema = buildFaqSchema(products[0].faq)
    expect(schema.mainEntity).toHaveLength(products[0].faq.length)
    expect(schema.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: products[0].faq[0].question,
    })
  })

  it('builds BlogPosting data with canonical URLs', () => {
    const article = articles[0]
    const schema = buildArticleSchema(article, 'https://sinfogear.com')

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: { '@type': 'Organization', name: 'SINOF Engineering Team' },
      publisher: { '@type': 'Organization', name: 'SINOF' },
      image: `https://sinfogear.com${article.heroImage}`,
      mainEntityOfPage: `https://sinfogear.com/blog/${article.slug}`,
    })
  })

  it('builds blog and article breadcrumbs', () => {
    const indexSchema = buildBlogBreadcrumbSchema(undefined, 'https://sinfogear.com')
    const articleSchema = buildBlogBreadcrumbSchema(articles[0], 'https://sinfogear.com')

    expect(indexSchema.itemListElement.map((item) => item.name)).toEqual(['Home', 'Insights'])
    expect(articleSchema.itemListElement.map((item) => item.name)).toEqual([
      'Home',
      'Insights',
      articles[0].title,
    ])
    expect(articleSchema.itemListElement.map((item) => item.position)).toEqual([1, 2, 3])
  })
})
