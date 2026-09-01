import type { Lang } from '@/i18n/language'

export interface CustomerServiceConfig {
  sdkUrl: string
  siteKey: string
  endpoint: string
  locale: string
}

export type CustomerServiceComponent = 'agent_chat' | 'contact_us'

export interface ContactUsSubmitOptions {
  pageURL?: string
  submissionID?: string
  attachments?: {
    files: Iterable<File>
    onProgress?: (attachmentID: string, sent: number, total: number) => void
  }
}

export interface ContactUsSubmissionResult {
  accepted: true
  created: boolean
}

export type ContactUsFields = Record<string, string[]>

export type ContactUsSubmitter = (
  fields: ContactUsFields,
  options?: ContactUsSubmitOptions,
) => Promise<ContactUsSubmissionResult | null>

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

export interface CustomerServiceAdapter {
  init(config: CustomerServiceConfig): Promise<void>
  open(): void
  submitContactUs(
    fields: ContactUsFields,
    options?: ContactUsSubmitOptions,
  ): Promise<ContactUsSubmissionResult>
  destroy(): void
}
