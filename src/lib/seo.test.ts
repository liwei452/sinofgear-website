import { describe, expect, it } from 'vitest'
import { products } from '@/data/products'
import {
  buildBreadcrumbSchema,
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

  it('includes approved legal contact facts in Organization data', () => {
    expect(buildOrganizationSchema('https://sinfogear.com')).toMatchObject({
      '@type': 'Organization',
      name: 'SINOF',
      legalName: 'Changsha Xingfeng Transmission Machinery Co., Ltd.',
      foundingDate: '2008',
      email: 'info@sinof.net',
      telephone: '+86 731 8888 4918',
    })
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
})
