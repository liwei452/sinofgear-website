import type { ProductSlug } from '@/data/products'

export interface AnalyticsConfig {
  gaMeasurementId?: string
  gtmContainerId?: string
}

export interface InquiryAnalyticsData {
  product: ProductSlug | 'other'
  hasDrawing: boolean
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export const analyticsConfig: AnalyticsConfig = {
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID?.trim(),
  gtmContainerId: import.meta.env.VITE_GTM_CONTAINER_ID?.trim(),
}

function enabled(config: AnalyticsConfig): boolean {
  return Boolean(config.gaMeasurementId || config.gtmContainerId)
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
  document.head.append(script)

  push(config, { event: 'analytics_initialized' })
  return true
}

export function trackPageView(pathname: string, config: AnalyticsConfig = analyticsConfig): void {
  push(config, { event: 'page_view', page_path: pathname })
}

export function trackInquirySuccess(
  data: InquiryAnalyticsData,
  config: AnalyticsConfig = analyticsConfig,
): void {
  push(config, {
    event: 'generate_lead',
    product_category: data.product,
    has_drawing: data.hasDrawing,
  })
}
