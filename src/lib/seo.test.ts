import { describe, expect, it } from 'vitest'
import { products } from '@/data/products'
import {
  buildBreadcrumbSchema,
  buildCanonicalUrl,
  buildFaqSchema,
  buildOrganizationSchema,
  buildProductSchema,
} from './seo'

describe('SEO builders', () => {
  it('normalizes canonical URLs without duplicate slashes', () => {
    expect(buildCanonicalUrl('https://www.sinoforce.net/', '/products')).toBe(
      'https://www.sinoforce.net/products',
    )
    expect(buildCanonicalUrl('https://www.sinoforce.net/', '/')).toBe('https://www.sinoforce.net/')
  })

  it('limits Organization data to confirmed brand and URL', () => {
    expect(buildOrganizationSchema('https://www.sinoforce.net')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SINOFORM',
      url: 'https://www.sinoforce.net/',
    })
  })

  it('does not invent product commercial data', () => {
    const schema = buildProductSchema(products[0], 'https://www.sinoforce.net')
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
    const schema = buildBreadcrumbSchema(products[0], 'https://www.sinoforce.net')
    expect(schema.itemListElement).toHaveLength(3)
    expect(schema.itemListElement.map((item) => item.position)).toEqual([1, 2, 3])
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
