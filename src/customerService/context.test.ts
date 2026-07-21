import { describe, expect, it } from 'vitest'
import { buildCustomerServiceContext } from './context'

describe('customer-service public context', () => {
  it('allows product and campaign context without copying personal query data', () => {
    const result = buildCustomerServiceContext(
      {
        pathname: '/products/spur-gears',
        search: '?utm_source=google&utm_campaign=gear&email=x@example.com&message=secret',
        href: 'https://www.sinoforce.net/products/spur-gears?utm_source=google',
        referrer: 'https://www.google.com/search',
      },
      'de',
      { slug: 'spur-gears', name: 'Stirnräder' },
    )

    expect(result).toMatchObject({
      language: 'de',
      pathname: '/products/spur-gears',
      productSlug: 'spur-gears',
      productName: 'Stirnräder',
      campaign: { source: 'google', campaign: 'gear' },
      referrerOrigin: 'https://www.google.com',
    })
    expect(JSON.stringify(result)).not.toContain('email')
    expect(JSON.stringify(result)).not.toContain('secret')
  })
})
