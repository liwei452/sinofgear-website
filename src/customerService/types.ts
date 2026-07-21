import type { Lang } from '@/i18n/language'

export interface CustomerServiceConfig {
  sdkUrl: string
  appId: string
  globalName: string
}

export interface CustomerServiceCampaign {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

export interface CustomerServiceContext {
  language: Lang
  pathname: string
  url: string
  referrerOrigin?: string
  productSlug?: string
  productName?: string
  campaign?: CustomerServiceCampaign
}

export interface CustomerServiceVisitor {
  id: string
  displayName?: string
  company?: string
}

export interface CustomerServiceAdapter {
  init(config: CustomerServiceConfig, context: CustomerServiceContext): Promise<void>
  open(): void
  close(): void
  identify(visitor: CustomerServiceVisitor): void
  setContext(context: CustomerServiceContext): void
  destroy(): void
}
