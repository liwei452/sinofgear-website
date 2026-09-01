import { articleError, deploymentId } from './config.js'
import type { GrowthArticle, GrowthSiteConfig, GrowthSiteHandlers, PublishFile } from './contracts.js'

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
})

export function defineGrowthSite(config: GrowthSiteConfig): GrowthSiteHandlers {
  return { async fetch(request) {
    if (request.headers.get('Authorization') !== `Bearer ${config.token}`) return json({ code: 'UNAUTHORIZED' }, 401)
    const path = new URL(request.url).pathname.replace(/^.*\/growth\/v1\/?/, '').split('/').filter(Boolean)
    if (request.method === 'GET' && path[0] === 'capabilities') return json(config.capabilities)
    if (request.method === 'GET' && path[0] === 'pages') return json(config.listPages ? await config.listPages() : [])
    if (request.method === 'GET' && path[0] === 'assets' && path[1]) return assetResponse(path[1], config)
    if (request.method === 'PUT' && path[0] === 'assets' && path[1]) return stageAsset(request, path[1], config)
    if (path[0] !== 'articles' || !path[1]) return json({ code: 'NOT_FOUND' }, 404)
    const action = path[2]
    if (request.method === 'POST' && action === 'preview') return preview(request, path[1], config)
    if (request.method === 'POST' && action === 'publish') return publish(request, path[1], config)
    if (request.method === 'GET' && action === 'status') return status(new URL(request.url), path[1], config)
    return json({ code: 'NOT_FOUND' }, 404)
  } }
}

async function assetResponse(assetId: string, config: GrowthSiteConfig): Promise<Response> {
  const asset = await config.loadAsset(assetId)
  return new Response(asset.bytes as unknown as BodyInit, { headers: { 'Content-Type': asset.mimeType, 'Cache-Control': 'private, max-age=300' } })
}

async function stageAsset(request: Request, assetId: string, config: GrowthSiteConfig): Promise<Response> {
  if (!config.stageReviewedAsset) return json({ code: 'ASSET_STAGING_UNAVAILABLE' }, 501)
  const organizationId = request.headers.get('X-Growth-Organization')
  const articleKey = request.headers.get('X-Growth-Article')
  const version = Number(request.headers.get('X-Growth-Version'))
  const reviewedRevision = request.headers.get('X-Growth-Reviewed-Revision')
  const mimeType = request.headers.get('Content-Type')
  if (!organizationId || !articleKey || !Number.isInteger(version) || version < 1 || !reviewedRevision || !mimeType) return json({ code: 'ASSET_INVALID' }, 422)
  try {
    await config.stageReviewedAsset({ assetId, organizationId, siteCode: config.capabilities.site_code, articleKey, version, reviewedRevision, mimeType, bytes: new Uint8Array(await request.arrayBuffer()) })
  } catch {
    return json({ code: 'ASSET_STAGE_FAILED' }, 500)
  }
  return json({ status: 'STAGED', asset_id: assetId })
}

async function parseArticle(request: Request, key: string, config: GrowthSiteConfig): Promise<GrowthArticle | Response> {
  let article: GrowthArticle
  try { article = await request.json() as GrowthArticle } catch { return json({ code: 'ARTICLE_INVALID', field: 'body' }, 422) }
  if (article.article_key !== key) return json({ code: 'ARTICLE_INVALID', field: 'article_key' }, 422)
  const invalid = articleError(article, config)
  if (invalid) return json({ code: 'ARTICLE_INVALID', field: invalid.field }, 422)
  try {
    config.validateArticle?.(article)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return json({ code: 'ARTICLE_INVALID', field: message.split(':').at(-1)?.trim() || 'article' }, 422)
  }
  return article
}

async function preview(request: Request, key: string, config: GrowthSiteConfig): Promise<Response> {
  const parsed = await parseArticle(request, key, config)
  if (parsed instanceof Response) return parsed
  const html = config.renderArticle(parsed)
  if (config.storePreview) {
    await config.storePreview(parsed)
    return json({ status: 'PREVIEW_READY', preview_url: `${config.previewBaseUrl.replace(/\/$/, '')}/growth-preview/${parsed.article_key}?version=${parsed.version}`, html }, 201)
  }
  return json({ status: 'PREVIEW', preview_url: `${config.previewBaseUrl.replace(/\/$/, '')}/blog/${parsed.article_key}?version=${parsed.version}`, html })
}

async function publish(request: Request, key: string, config: GrowthSiteConfig): Promise<Response> {
  const parsed = await parseArticle(request, key, config)
  if (parsed instanceof Response) return parsed
  const id = deploymentId(parsed)
  const assetPath = coverPath(parsed)
  const files: PublishFile[] = [{ path: `src/data/generatedArticles/${parsed.article_key}.ts`, content: config.renderArticle({ ...parsed, ...(assetPath ? { cover_asset_path: assetPath } : {}) }) }]
  if (parsed.cover_image) {
    if (!config.getReviewedAsset) return json({ code: 'CONFIGURATION_REQUIRED', field: 'cover_image' }, 503)
    const asset = await config.getReviewedAsset({ assetId: parsed.cover_image.asset_id, organizationId: parsed.organization_id ?? '', siteCode: parsed.site_code ?? config.capabilities.site_code, articleKey: parsed.article_key, version: parsed.version })
    if (!asset || asset.reviewedRevision !== parsed.cover_image.reviewed_revision || asset.mimeType !== parsed.cover_image.mime_type || asset.bytes.byteLength !== parsed.cover_image.size_bytes || asset.bytes.byteLength > config.capabilities.image_max_bytes) return json({ code: 'ARTICLE_INVALID', field: 'cover_image' }, 422)
    files.push({ path: assetPath!, content: asset.bytes })
  }
  const statusKey = `growth:${parsed.article_key}:v${parsed.version}`
  const canonicalUrl = `${config.canonicalBaseUrl.replace(/\/$/, '')}/blog/${parsed.article_key}`
  const previousValue = await config.deployments.get(statusKey)
  let sourceAttempt = 1
  if (previousValue) {
    try {
      const previous = JSON.parse(previousValue) as { source_attempt?: number }
      if (Number.isInteger(previous.source_attempt) && previous.source_attempt! > 0) sourceAttempt = previous.source_attempt! + 1
    } catch { /* A malformed legacy record starts a fresh readable attempt sequence. */ }
  }
  const sourceDeploymentId = `${id}-attempt-${sourceAttempt}`
  const preparing = { status: 'PREPARING', version: parsed.version, deployment_id: id, source_deployment_id: sourceDeploymentId, source_attempt: sourceAttempt, article_key: parsed.article_key, canonical_url: canonicalUrl }
  await config.deployments.put(statusKey, JSON.stringify(preparing))
  const commit = await config.repository.putFiles({ deploymentId: sourceDeploymentId, files })
  const result = { ...preparing, status: 'PUBLISHING', commit }
  await config.deployments.put(statusKey, JSON.stringify(result))
  return json(result, 202)
}

function coverPath(article: GrowthArticle): string | undefined {
  return article.cover_image ? `public/assets/growth/${article.article_key}/v${article.version}/${article.cover_image.filename}` : undefined
}

async function status(url: URL, key: string, config: GrowthSiteConfig): Promise<Response> {
  const version = url.searchParams.get('version')
  if (!version || !/^\d+$/.test(version)) return json({ code: 'STATUS_INVALID', field: 'version' }, 422)
  const value = await config.deployments.get(`growth:${key}:v${version}`)
  if (!value) return json({ code: 'DEPLOYMENT_NOT_FOUND' }, 404)
  const stored = JSON.parse(value) as { status: string; version: number; deployment_id: string; source_deployment_id?: string; article_key: string; canonical_url: string; commit?: { id: string; url: string } }
  if (!config.deploymentStatus) return json({
    code: 'DEPLOYMENT_STATUS_NOT_CONFIGURED',
    recovery_action: 'Configure a production deployment status provider for this site.',
  }, 503)
  const provider = await config.deploymentStatus({ deploymentId: stored.source_deployment_id ?? stored.deployment_id, articleKey: stored.article_key, version: stored.version, commit: stored.commit })
  const updated = provider.status === 'PUBLISHED'
    ? { ...stored, status: 'PUBLISHED', canonical_url: provider.canonicalUrl, provider_deployment_id: provider.providerDeploymentId }
    : provider.status === 'FAILED'
      ? { ...stored, status: 'FAILED', error_code: provider.errorCode, provider_deployment_id: provider.providerDeploymentId }
      : { ...stored, status: 'PUBLISHING' }
  await config.deployments.put(`growth:${key}:v${version}`, JSON.stringify(updated))
  return json(updated)
}
