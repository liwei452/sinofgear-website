import { beforeEach, describe, expect, it } from 'vitest'
import { analyticsConfig, initializeAnalytics, trackInquirySuccess, trackPageView } from './analytics'

describe('privacy-conscious analytics', () => {
  beforeEach(() => {
    document.head.querySelectorAll('[data-sinof-analytics]').forEach((node) => node.remove())
    delete window.dataLayer
    delete window.gtag
    sessionStorage.clear()
    history.replaceState(null, '', '/')
  })

  it('is a no-op when no GA or GTM identifier is configured', () => {
    expect(initializeAnalytics({})).toBe(false)
    trackPageView('/products', {})
    trackInquirySuccess({ product: 'spur-gears', hasDrawing: true }, {})
    expect(window.dataLayer).toBeUndefined()
  })

  it('loads the configured analytics script only once', () => {
    expect(initializeAnalytics({ gaMeasurementId: 'G-TEST123', allowedHostnames: ['localhost'] })).toBe(true)
    expect(initializeAnalytics({ gaMeasurementId: 'G-TEST123', allowedHostnames: ['localhost'] })).toBe(true)
    expect(document.head.querySelectorAll('[data-sinof-analytics]')).toHaveLength(1)
  })

  it('tracks page views and successful inquiries without personal data', () => {
    const config = { gtmContainerId: 'GTM-TEST123', allowedHostnames: ['localhost'] }
    initializeAnalytics(config)
    trackPageView('/products/worm-gears', config)
    trackInquirySuccess({ product: 'worm-gears', hasDrawing: true }, config)

    expect(window.dataLayer).toContainEqual({ event: 'page_view', page_path: '/products/worm-gears' })
    expect(window.dataLayer).toContainEqual({ event: 'generate_lead', product_category: 'worm-gears', has_drawing: true })
    expect(JSON.stringify(window.dataLayer)).not.toMatch(/email|name|company|message/i)
  })

  it('uses a fixed category for buyer-written product descriptions', () => {
    const config = { gtmContainerId: 'GTM-TEST123', allowedHostnames: ['localhost'] }
    trackInquirySuccess({ product: 'other', hasDrawing: false }, config)

    expect(window.dataLayer).toContainEqual({
      event: 'generate_lead',
      product_category: 'other',
      has_drawing: false,
    })
    expect(JSON.stringify(window.dataLayer)).not.toContain('Custom ring gear for kiln drive')
  })

  it('queues standard GA commands once and leaves page views to enhanced measurement', () => {
    const config = { gaMeasurementId: 'G-LR5GZ47F66', allowedHostnames: ['localhost'] }
    initializeAnalytics(config)
    initializeAnalytics(config)
    trackPageView('/', config)
    trackPageView('/about', config)
    const commands = window.dataLayer!.map((item) => Array.from(item as ArrayLike<unknown>))
    expect(commands.filter((item) => item[0] === 'js')).toHaveLength(1)
    expect(commands.filter((item) => item[0] === 'config')).toEqual([
      ['config', 'G-LR5GZ47F66', expect.objectContaining({ allow_google_signals: false })],
    ])
    expect(commands.some((item) => item[0] === 'event' && item[1] === 'page_view')).toBe(false)
    expect(window.dataLayer!.some((item) => 'event' in item && item.event === 'page_view')).toBe(false)
    expect(window.gtag).toBeTypeOf('function')
  })

  it('does not load the production tag on local or preview hosts', () => {
    expect(initializeAnalytics({ ...analyticsConfig, gaMeasurementId: 'G-LR5GZ47F66' })).toBe(false)
    expect(window.dataLayer).toBeUndefined()
  })

  it('honors the session opt-out used for CRM acceptance visits', () => {
    sessionStorage.setItem('sinof-analytics-disabled', 'true')
    expect(initializeAnalytics({ gaMeasurementId: 'G-LR5GZ47F66', allowedHostnames: ['localhost'] })).toBe(false)
    expect(window.dataLayer).toBeUndefined()
  })

  it('keeps GTM precedence without also initializing a Google tag', () => {
    initializeAnalytics({ gaMeasurementId: 'G-LR5GZ47F66', gtmContainerId: 'GTM-TEST123', allowedHostnames: ['localhost'] })
    expect(window.gtag).toBeUndefined()
    expect(document.querySelector('script[data-sinof-analytics]')?.getAttribute('src')).toContain('/gtm.js?')
  })

  it('preserves existing consent commands and never grants analytics consent', () => {
    const prior = { event: 'existing-consent-choice' }
    window.dataLayer = [prior]
    initializeAnalytics({ gaMeasurementId: 'G-LR5GZ47F66', allowedHostnames: ['localhost'] })
    expect(window.dataLayer[0]).toBe(prior)
    expect(JSON.stringify(window.dataLayer)).not.toContain('granted')
  })

  it('persists the URL opt-out across client navigation', () => {
    const config = { gaMeasurementId: 'G-LR5GZ47F66', allowedHostnames: ['localhost'] }
    history.replaceState(null, '', '/?analytics=off')
    expect(initializeAnalytics(config)).toBe(false)
    history.replaceState(null, '', '/about')
    expect(initializeAnalytics(config)).toBe(false)
  })

  it.each(['/growth-preview/draft', '/growth/status', '/crm', '/admin/settings'])('excludes %s', (path) => {
    history.replaceState(null, '', path)
    expect(initializeAnalytics({ gaMeasurementId: 'G-LR5GZ47F66', allowedHostnames: ['localhost'] })).toBe(false)
    expect(window.dataLayer).toBeUndefined()
  })

  it('sends only the existing anonymous inquiry fields to the configured GA destination', () => {
    const config = { gaMeasurementId: 'G-LR5GZ47F66', allowedHostnames: ['localhost'] }
    initializeAnalytics(config)
    trackInquirySuccess({ product: 'spur-gears', hasDrawing: false }, config)
    expect(Array.from(window.dataLayer!.at(-1) as IArguments)).toEqual([
      'event', 'generate_lead', { send_to: 'G-LR5GZ47F66', product_category: 'spur-gears', has_drawing: false },
    ])
  })
})
