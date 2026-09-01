import { defineGrowthSite, GitHubContentsPublisher } from '@sinofgear/site-bridge-cloudflare'
import type { DeploymentStatusResult, GrowthArticle, GrowthSiteHandlers, RepositoryPublisher } from '@sinofgear/site-bridge-cloudflare'
import { parseGeneratedArticle } from '../../src/data/generatedArticleContract'
import { productSlugs } from '../../src/data/products'

export interface GrowthBindings {
  GROWTH_PUBLISH_TOKEN: string
  GITHUB_CONTENT_TOKEN: string
  GITHUB_REPOSITORY: string
  GITHUB_BRANCH: string
  GROWTH_ORGANIZATION_ID: string
  BLOG_PREVIEWS: KVNamespace
  GROWTH_ASSETS: R2Bucket
  CLOUDFLARE_ACCOUNT_ID?: string
  CLOUDFLARE_PAGES_PROJECT?: string
  CLOUDFLARE_API_TOKEN?: string
}

interface GrowthPublishingDependencies {
  repository?: RepositoryPublisher
  fetch?: typeof fetch
  deploymentStatus?: (input: { deploymentId: string; articleKey: string; version: number; commit?: { id: string; url: string } }) => Promise<DeploymentStatusResult>
}

const coreRoutes = ['/', '/about', '/products', '/capabilities', '/quality', '/contact', '/blog']
const productRoutes = productSlugs.map((slug) => `/products/${slug}`)

function cloudflarePagesStatus(env: GrowthBindings, fetcher: typeof fetch): GrowthPublishingDependencies['deploymentStatus'] | undefined {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_PAGES_PROJECT || !env.CLOUDFLARE_API_TOKEN) return undefined
  return async (input) => {
    const response = await fetcher(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${env.CLOUDFLARE_PAGES_PROJECT}/deployments`, {
      headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
    })
    if (!response.ok) throw new Error(`Cloudflare Pages status failed: ${response.status}`)
    const payload = await response.json() as { result?: Array<{ id: string; environment: string; latest_stage?: { status?: string }; deployment_trigger?: { metadata?: { commit_hash?: string; commit_message?: string } } }> }
    const expectedMessage = `Publish growth deployment ${input.deploymentId}`
    const deployment = payload.result?.find((candidate) => candidate.environment === 'production' && (
      input.commit?.id ? candidate.deployment_trigger?.metadata?.commit_hash === input.commit.id : candidate.deployment_trigger?.metadata?.commit_message === expectedMessage
    ))
    if (!deployment) return { status: 'PUBLISHING' }
    if (deployment.latest_stage?.status === 'failure') return { status: 'FAILED', errorCode: 'CLOUDFLARE_BUILD_FAILED', providerDeploymentId: deployment.id }
    if (deployment.latest_stage?.status !== 'success') return { status: 'PUBLISHING' }
    return { status: 'PUBLISHED', canonicalUrl: `https://sinofgears.com/blog/${input.articleKey}`, providerDeploymentId: deployment.id }
  }
}

function generatedArticleModule(article: GrowthArticle & { cover_asset_path?: string }): string {
  const payload = {
    ...article,
    hero_image: article.cover_asset_path ? `/${article.cover_asset_path.replace(/^public\//, '')}` : '/assets/gear-spur.jpg',
  }
  parseGeneratedArticle(payload)
  return `export default ${JSON.stringify([payload], null, 2)}\n`
}

export function growthPublishing(env: GrowthBindings, dependencies: GrowthPublishingDependencies = {}): GrowthSiteHandlers {
  const fetcher = dependencies.fetch ?? fetch
  let repository = dependencies.repository
  if (!repository) {
    const repositoryParts = env.GITHUB_REPOSITORY.split('/')
    if (repositoryParts.length !== 2 || !repositoryParts[0] || !repositoryParts[1]) {
      throw new Error('GITHUB_REPOSITORY must use the owner/repository format')
    }
    repository = new GitHubContentsPublisher({
      owner: repositoryParts[0], repository: repositoryParts[1], branch: env.GITHUB_BRANCH,
      token: env.GITHUB_CONTENT_TOKEN, fetch: fetcher,
    })
  }
  return defineGrowthSite({
    token: env.GROWTH_PUBLISH_TOKEN,
    capabilities: {
      contract_version: 'v1', site_code: 'sinofgears', languages: ['en'],
      seo_description_max_length: 165, faq_min_items: 3, faq_max_items: 8,
      allowed_internal_routes: [...coreRoutes, ...productRoutes],
      allowed_product_slugs: [...productSlugs],
      image_mime_types: ['image/jpeg', 'image/png', 'image/webp'], image_max_bytes: 5_000_000,
      cover_image_required: true,
    },
    deployments: { get: (key) => env.BLOG_PREVIEWS.get(key), put: (key, value) => env.BLOG_PREVIEWS.put(key, value) },
    repository,
    canonicalBaseUrl: 'https://sinofgears.com', previewBaseUrl: 'https://sinofgears.com',
    validateArticle: (article) => { parseGeneratedArticle(article) },
    async listPages() {
      const response = await fetcher('https://sinofgears.com/growth-content-index.json')
      return response.ok ? response.json() : []
    },
    async loadAsset(assetId) {
      const object = await env.GROWTH_ASSETS.get(assetId)
      if (!object) throw new Error('Reviewed growth asset was not found')
      return { bytes: new Uint8Array(await object.arrayBuffer()), mimeType: object.httpMetadata?.contentType ?? 'application/octet-stream' }
    },
    async storePreview(article) {
      if (article.organization_id !== env.GROWTH_ORGANIZATION_ID || article.site_code !== 'sinofgears') {
        throw new Error('Growth preview scope does not match this site')
      }
      await env.BLOG_PREVIEWS.put(
        `preview:${article.article_key}:v${article.version}`,
        JSON.stringify(article),
        { expirationTtl: 7 * 24 * 60 * 60 },
      )
    },
    async stageReviewedAsset(input) {
      if (input.organizationId !== env.GROWTH_ORGANIZATION_ID) {
        throw new Error('Growth asset organization does not match this site')
      }
      const objectKey = `growth/${input.organizationId}/${input.siteCode}/${input.articleKey}/v${input.version}/${input.assetId}`
      await env.GROWTH_ASSETS.put(objectKey, input.bytes, { httpMetadata: { contentType: input.mimeType } })
      await env.BLOG_PREVIEWS.put(`growth:manifest:${objectKey}`, JSON.stringify({
        organization_id: input.organizationId, site_code: input.siteCode, article_key: input.articleKey, version: input.version,
        asset_id: input.assetId, mime_type: input.mimeType, size_bytes: input.bytes.byteLength,
        reviewed_revision: input.reviewedRevision, status: 'APPROVED', object_key: objectKey,
      }))
    },
    async getReviewedAsset(input) {
      if (input.organizationId !== env.GROWTH_ORGANIZATION_ID) return null
      const objectKey = `growth/${input.organizationId}/${input.siteCode}/${input.articleKey}/v${input.version}/${input.assetId}`
      const raw = await env.BLOG_PREVIEWS.get(`growth:manifest:${objectKey}`)
      if (!raw) return null
      const manifest = JSON.parse(raw) as { status: string; mime_type: string; reviewed_revision: string; object_key: string; size_bytes: number }
      if (manifest.status !== 'APPROVED') return null
      const object = await env.GROWTH_ASSETS.get(manifest.object_key)
      if (!object) return null
      const bytes = new Uint8Array(await object.arrayBuffer())
      if (bytes.byteLength !== manifest.size_bytes || object.httpMetadata?.contentType !== manifest.mime_type) return null
      return { reviewedRevision: manifest.reviewed_revision, mimeType: manifest.mime_type, bytes }
    },
    deploymentStatus: dependencies.deploymentStatus ?? cloudflarePagesStatus(env, fetcher),
    renderArticle: generatedArticleModule,
  })
}
