import type { ProductSlug } from '@/data/products'

export interface AnalyticsConfig {
  gaMeasurementId?: string
  gtmContainerId?: string
  allowedHostnames?: readonly string[]
}

export interface InquiryAnalyticsData {
  product: ProductSlug | 'other'
  hasDrawing: boolean
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>
    gtag?: (...args: unknown[]) => void
  }
}

export const analyticsConfig: AnalyticsConfig = {
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID?.trim(),
  gtmContainerId: import.meta.env.VITE_GTM_CONTAINER_ID?.trim(),
}

function enabled(config: AnalyticsConfig): boolean {
  if (typeof window === 'undefined' || !(config.gaMeasurementId || config.gtmContainerId)) return false
  const hosts = config.allowedHostnames ?? ['sinofgears.com', 'www.sinofgears.com']
  if (!hosts.includes(window.location.hostname)) return false
  if (/^\/(growth-preview|growth|crm|admin)(\/|$)/.test(window.location.pathname)) return false
  const optedOut = new URLSearchParams(window.location.search).get('analytics') === 'off'
  try {
    if (optedOut) sessionStorage.setItem('sinof-analytics-disabled', 'true')
    if (sessionStorage.getItem('sinof-analytics-disabled') === 'true') return false
  } catch {
    // Storage restrictions must not break the website or the URL opt-out.
  }
  return !optedOut
}

function push(config: AnalyticsConfig, event: Record<string, unknown>): void {
  if (!enabled(config) || typeof window === 'undefined') return
  window.dataLayer ??= []
  window.dataLayer.push(event)
}

export function initializeAnalytics(config: AnalyticsConfig = analyticsConfig): boolean {
  if (!enabled(config) || typeof document === 'undefined') return false
  window.dataLayer ??= []
  if (document.head.querySelector('[data-sinof-analytics]')) return true

  const identifier = config.gtmContainerId || config.gaMeasurementId!
  const script = document.createElement('script')
  script.async = true
  script.dataset.sinofAnalytics = identifier
  script.src = config.gtmContainerId
    ? `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(identifier)}`
    : `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(identifier)}`
  if (config.gtmContainerId) {
    push(config, { 'gtm.start': Date.now(), event: 'gtm.js' })
  } else {
    // Google expects the standard arguments queue, not GTM-style event objects.
    // eslint-disable-next-line prefer-rest-params -- gtag's documented queue uses IArguments.
    window.gtag ??= function () { window.dataLayer!.push(arguments) }
    // This integration is for site analytics, not advertising or customer data.
    // Leave any previously queued analytics_storage choice intact.
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    window.gtag('js', new Date())
    window.gtag('config', identifier, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
  }
  document.head.append(script)
  return true
}

export function trackPageView(pathname: string, config: AnalyticsConfig = analyticsConfig): void {
  // GA4 Enhanced Measurement owns initial + History API views. Manual views
  // here would double-count React Router navigation (and StrictMode effects).
  if (!config.gtmContainerId) return
  push(config, { event: 'page_view', page_path: pathname })
}

export function trackInquirySuccess(
  data: InquiryAnalyticsData,
  config: AnalyticsConfig = analyticsConfig,
): void {
  if (!enabled(config)) return
  if (!config.gtmContainerId) {
    window.gtag?.('event', 'generate_lead', {
      send_to: config.gaMeasurementId,
      product_category: data.product,
      has_drawing: data.hasDrawing,
    })
    return
  }
  push(config, {
    event: 'generate_lead',
    product_category: data.product,
    has_drawing: data.hasDrawing,
  })
}
