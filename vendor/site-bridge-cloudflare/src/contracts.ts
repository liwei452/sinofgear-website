export interface GrowthCapabilities {
  contract_version: 'v1'
  site_code: string
  languages: string[]
  seo_description_max_length: number
  faq_min_items: number
  faq_max_items: number
  allowed_internal_routes: string[]
  allowed_product_slugs: string[]
  image_mime_types: string[]
  image_max_bytes: number
  cover_image_required: boolean
}

export interface GrowthArticle {
  organization_id?: string
  site_code?: string
  article_key: string
  version: number
  title: string
  summary: string
  body: string
  language: string
  target_market: string
  topic_cluster: string
  seo_title: string
  seo_description: string
  faq: Array<{ question: string; answer: string }>
  structured_data: Record<string, unknown>
  image_alt: string
  internal_links: Array<{ label: string; url: string }>
  evidence_ids: string[]
  published_at: string
  updated_at: string
  cover_image?: {
    asset_id: string
    filename: string
    mime_type: string
    size_bytes: number
    alt: string
    cover_role: 'HERO'
    reviewed_revision?: string
  }
}

export interface PublishFile { path: string; content: string | Uint8Array }
export interface RepositoryCommit { id: string; url: string }
export interface RepositoryPublisher {
  putFiles(input: { deploymentId: string; files: PublishFile[] }): Promise<RepositoryCommit>
}

export interface KeyValueStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

export type DeploymentStatusResult =
  | { status: 'PUBLISHING' }
  | { status: 'PUBLISHED'; canonicalUrl: string; providerDeploymentId?: string }
  | { status: 'FAILED'; errorCode: string; providerDeploymentId?: string }

export interface GrowthSiteConfig {
  token: string
  capabilities: GrowthCapabilities
  deployments: KeyValueStore
  repository: RepositoryPublisher
  canonicalBaseUrl: string
  previewBaseUrl: string
  validateArticle?(article: GrowthArticle): void
  listPages?(): Promise<unknown>
  loadAsset(assetId: string): Promise<{ bytes: Uint8Array; mimeType: string }>
  storePreview?(article: GrowthArticle): Promise<void>
  stageReviewedAsset?(input: { assetId: string; organizationId: string; siteCode: string; articleKey: string; version: number; reviewedRevision: string; mimeType: string; bytes: Uint8Array }): Promise<void>
  getReviewedAsset?(input: { assetId: string; organizationId: string; siteCode: string; articleKey: string; version: number }): Promise<{ reviewedRevision: string; mimeType: string; bytes: Uint8Array } | null>
  deploymentStatus?(input: { deploymentId: string; articleKey: string; version: number; commit?: RepositoryCommit }): Promise<DeploymentStatusResult>
  renderArticle(article: GrowthArticle & { cover_asset_path?: string }): string
}

export interface GrowthSiteHandlers { fetch(request: Request): Promise<Response> }
