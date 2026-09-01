import { beforeEach, describe, expect, it } from 'vitest'
import { initializeAnalytics, trackInquirySuccess, trackPageView } from './analytics'

describe('privacy-conscious analytics', () => {
  beforeEach(() => {
    document.head.querySelectorAll('[data-sinof-analytics]').forEach((node) => node.remove())
    delete window.dataLayer
  })

  it('is a no-op when no GA or GTM identifier is configured', () => {
    expect(initializeAnalytics({})).toBe(false)
    trackPageView('/products', {})
    trackInquirySuccess({ product: 'spur-gears', hasDrawing: true }, {})
    expect(window.dataLayer).toBeUndefined()
  })

  it('loads the configured analytics script only once', () => {
    expect(initializeAnalytics({ gaMeasurementId: 'G-TEST123' })).toBe(true)
    expect(initializeAnalytics({ gaMeasurementId: 'G-TEST123' })).toBe(true)
    expect(document.head.querySelectorAll('[data-sinof-analytics]')).toHaveLength(1)
  })

  it('tracks page views and successful inquiries without personal data', () => {
    const config = { gtmContainerId: 'GTM-TEST123' }
    initializeAnalytics(config)
    trackPageView('/products/worm-gears', config)
    trackInquirySuccess({ product: 'worm-gears', hasDrawing: true }, config)

    expect(window.dataLayer).toContainEqual({ event: 'page_view', page_path: '/products/worm-gears' })
    expect(window.dataLayer).toContainEqual({ event: 'generate_lead', product_category: 'worm-gears', has_drawing: true })
    expect(JSON.stringify(window.dataLayer)).not.toMatch(/email|name|company|message/i)
  })

  it('uses a fixed category for buyer-written product descriptions', () => {
    const config = { gtmContainerId: 'GTM-TEST123' }
    trackInquirySuccess({ product: 'other', hasDrawing: false }, config)

    expect(window.dataLayer).toContainEqual({
      event: 'generate_lead',
      product_category: 'other',
      has_drawing: false,
    })
    expect(JSON.stringify(window.dataLayer)).not.toContain('Custom ring gear for kiln drive')
  })
})
