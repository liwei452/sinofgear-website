import { describe, expect, it } from 'vitest'
import type { RepositoryPublisher } from '@sinofgear/site-bridge-cloudflare'
import { parseGeneratedArticle } from '../../src/data/generatedArticleContract'
import { growthPublishing } from './growthPublishing'

class MemoryKV {
  values = new Map<string, string>()
  get(key: string) { return Promise.resolve(this.values.get(key) ?? null) }
  put(key: string, value: string) { this.values.set(key, value); return Promise.resolve() }
}

class FailingSecondDeploymentPutKV extends MemoryKV {
  deploymentPuts = 0
  override put(key: string, value: string) {
    if (key === 'growth:reviewed-guide:v2') {
      this.deploymentPuts += 1
      if (this.deploymentPuts === 2) return Promise.reject(new Error('KV unavailable'))
    }
    return super.put(key, value)
  }
}

class MemoryR2 {
  values = new Map<string, { bytes: Uint8Array; type?: string }>()
  async put(key: string, value: Uint8Array, options?: { httpMetadata?: { contentType?: string } }) {
    this.values.set(key, { bytes: new Uint8Array(value), type: options?.httpMetadata?.contentType })
  }
  async get(key: string) {
    const value = this.values.get(key)
    return value ? {
      httpMetadata: { contentType: value.type },
      arrayBuffer: async () => value.bytes.buffer.slice(value.bytes.byteOffset, value.bytes.byteOffset + value.bytes.byteLength),
    } : null
  }
}

class FakeRepository implements RepositoryPublisher {
  calls: Array<{ deploymentId: string; files: Array<{ path: string; content: string | Uint8Array }> }> = []
  async putFiles(input: { deploymentId: string; files: Array<{ path: string; content: string | Uint8Array }> }) {
    this.calls.push(input)
    return { id: 'source-commit', url: 'https://github.example/source-commit' }
  }
}

const article = {
  organization_id: 'org-1', site_code: 'sinofgears', article_key: 'reviewed-guide', version: 2,
  title: 'Reviewed guide for industrial buyers', summary: 'A practical reviewed guide for industrial buyers.',
  body: '## Review\n\nBody with the approved evidence and sourcing context.', language: 'en', target_market: 'US',
  topic_cluster: 'Inspection', seo_title: 'Reviewed SEO title', seo_description: 'A reviewed industrial sourcing guide with practical evidence and engineering context.',
  faq: [
    { question: 'What starts the review?', answer: 'A controlled drawing.' },
    { question: 'What context is useful?', answer: 'Quantity and application.' },
    { question: 'What should be agreed?', answer: 'Inspection scope.' },
  ],
  structured_data: { '@type': 'TechArticle' }, image_alt: 'Gear', internal_links: [{ label: 'Helical gears', url: '/products/helical-gears' }],
  evidence_ids: ['source-1'], published_at: '2026-09-02', updated_at: '2026-09-03',
  cover_image: { asset_id: 'cover-1', filename: 'cover.webp', mime_type: 'image/webp', size_bytes: 3, alt: 'Gear', cover_role: 'HERO', reviewed_revision: 'review-2' },
}

function request(path: string, init: RequestInit = {}) {
  return new Request(`https://site.example/growth/v1/${path}`, { ...init, headers: { Authorization: 'Bearer token', ...init.headers } })
}

function setup(envOverrides: Record<string, unknown> = {}, dependencies: Record<string, unknown> = {}) {
  const kv = new MemoryKV()
  const r2 = new MemoryR2()
  const repository = new FakeRepository()
  const handlers = growthPublishing({
    GROWTH_PUBLISH_TOKEN: 'token', GITHUB_CONTENT_TOKEN: 'unused',
    GITHUB_REPOSITORY: 'sinofgear/website', GITHUB_BRANCH: 'master', GROWTH_ORGANIZATION_ID: 'org-1',
    BLOG_PREVIEWS: kv, GROWTH_ASSETS: r2, ...envOverrides,
  } as never, { repository, ...dependencies })
  return { handlers, kv, r2, repository }
}

async function stage(handlers: ReturnType<typeof growthPublishing>) {
  return handlers.fetch(request('assets/cover-1', { method: 'PUT', body: new Uint8Array([1, 2, 3]), headers: {
    'Content-Type': 'image/webp', 'X-Growth-Organization': 'org-1', 'X-Growth-Article': 'reviewed-guide',
    'X-Growth-Version': '2', 'X-Growth-Reviewed-Revision': 'review-2',
  } }))
}

describe('SINOF growth publishing adapter', () => {
  it('exposes SINOF contract v1 capabilities', async () => {
    const { handlers } = setup()
    const response = await handlers.fetch(request('capabilities'))
    await expect(response.json()).resolves.toMatchObject({ contract_version: 'v1', site_code: 'sinofgears', cover_image_required: true })
  })

  it('keeps the existing pages index endpoint', async () => {
    const fetcher = async () => Response.json([{ path: '/blog/reviewed-guide' }])
    const { handlers } = setup({}, { fetch: fetcher })
    const response = await handlers.fetch(request('pages'))
    await expect(response.json()).resolves.toEqual([{ path: '/blog/reviewed-guide' }])
  })

  it('reuses the production token, KV, full repository, and branch bindings', async () => {
    const kv = new MemoryKV()
    const r2 = new MemoryR2()
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const githubFetch = async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      if (url.endsWith('/ref/heads/production')) return Response.json({ object: { sha: 'head' } })
      if (url.endsWith('/commits/head')) return Response.json({ tree: { sha: 'base-tree' } })
      if (url.endsWith('/blobs')) return Response.json({ sha: `blob-${calls.length}` }, { status: 201 })
      if (url.endsWith('/trees')) return Response.json({ sha: 'new-tree' }, { status: 201 })
      if (url.endsWith('/commits')) return Response.json({ sha: 'source-commit', html_url: 'https://github.example/source-commit' }, { status: 201 })
      return Response.json({}, { status: 200 })
    }
    const handlers = growthPublishing({
      GROWTH_PUBLISH_TOKEN: 'token', GITHUB_CONTENT_TOKEN: 'github-token',
      GITHUB_REPOSITORY: 'sinofgear/sinofgear-website', GITHUB_BRANCH: 'production',
      GROWTH_ORGANIZATION_ID: 'org-1', BLOG_PREVIEWS: kv, GROWTH_ASSETS: r2,
    } as never, { fetch: githubFetch as typeof fetch })

    expect((await handlers.fetch(request('capabilities'))).status).toBe(200)
    expect((await stage(handlers)).status).toBe(200)
    expect((await handlers.fetch(request('articles/reviewed-guide/publish', {
      method: 'POST', body: JSON.stringify(article),
    }))).status).toBe(202)

    expect(calls.some(({ url }) => url === 'https://api.github.com/repos/sinofgear/sinofgear-website/git/ref/heads/production')).toBe(true)
    expect(calls.some(({ url }) => url.endsWith('/refs/heads/production'))).toBe(true)
    expect(new Headers(calls[0]?.init?.headers).get('Authorization')).toBe('Bearer github-token')
  })

  it('stores approved bytes and their semantic manifest binding', async () => {
    const { handlers, kv, r2 } = setup()
    expect((await stage(handlers)).status).toBe(200)
    const objectKey = 'growth/org-1/sinofgears/reviewed-guide/v2/cover-1'
    expect(r2.values.get(objectKey)?.bytes).toEqual(new Uint8Array([1, 2, 3]))
    expect(JSON.parse(kv.values.get(`growth:manifest:${objectKey}`)!)).toMatchObject({
      organization_id: 'org-1', site_code: 'sinofgears', article_key: 'reviewed-guide', version: 2,
      asset_id: 'cover-1', mime_type: 'image/webp', size_bytes: 3, reviewed_revision: 'review-2', status: 'APPROVED',
    })
  })

  it('does not stage an asset outside the configured organization', async () => {
    const { handlers, r2 } = setup()
    const response = await handlers.fetch(request('assets/cover-1', {
      method: 'PUT', body: new Uint8Array([1, 2, 3]), headers: {
        'Content-Type': 'image/webp', 'X-Growth-Organization': 'org-other',
        'X-Growth-Article': 'reviewed-guide', 'X-Growth-Version': '2',
        'X-Growth-Reviewed-Revision': 'review-2',
      },
    }))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ code: 'ASSET_STAGE_FAILED' })
    expect(r2.values.size).toBe(0)
  })

  it('stores the canonical payload for the formal preview URL without writing the repository', async () => {
    const { handlers, kv, repository } = setup()
    await stage(handlers)
    const response = await handlers.fetch(request('articles/reviewed-guide/preview', { method: 'POST', body: JSON.stringify(article) }))
    expect(response.status).toBe(201)
    const result = await response.json() as { status: string; preview_url: string }
    const previewUrl = new URL(result.preview_url)
    const accessToken = previewUrl.searchParams.get('access_token')
    expect(result.status).toBe('PREVIEW_READY')
    expect(previewUrl.origin + previewUrl.pathname).toBe('https://sinofgears.com/growth-preview/reviewed-guide')
    expect(previewUrl.searchParams.get('version')).toBe('2')
    expect(accessToken).toMatch(/^[0-9a-f-]{36}$/)
    expect(JSON.parse(kv.values.get('preview:reviewed-guide:v2')!)).toEqual({ access_token: accessToken, article })
    expect(repository.calls).toHaveLength(0)
  })

  it('publishes only the exact approved manifest and immutable bytes', async () => {
    const { handlers, repository } = setup()
    await stage(handlers)
    const response = await handlers.fetch(request('articles/reviewed-guide/publish', { method: 'POST', body: JSON.stringify(article) }))
    expect(response.status).toBe(202)
    expect(repository.calls).toHaveLength(1)
    expect(repository.calls[0]?.files.map((file) => file.path)).toContain('public/assets/growth/reviewed-guide/v2/cover.webp')
    const rejected = await handlers.fetch(request('articles/reviewed-guide/publish', { method: 'POST', body: JSON.stringify({ ...article, cover_image: { ...article.cover_image, reviewed_revision: 'review-other' } }) }))
    expect(rejected.status).toBe(422)
    expect(repository.calls).toHaveLength(1)
  })

  it('maps canonical Growth Engine links into the generated website article', async () => {
    const { handlers } = setup()
    const response = await handlers.fetch(request('articles/reviewed-guide/preview', {
      method: 'POST', body: JSON.stringify(article),
    }))

    expect(response.status).toBe(201)
    const payload = await response.json() as { html: string }
    const generatedPayload = JSON.parse(payload.html.replace(/^export default /, ''))[0]
    const generated = parseGeneratedArticle(generatedPayload)
    expect(generated.relatedProductSlugs).toEqual(['helical-gears'])
    expect(generated.internalLinks).toEqual([{ url: '/products/helical-gears', label: 'Helical gears' }])
  })

  it('returns an actionable status error when Cloudflare Pages is not configured', async () => {
    const { handlers } = setup()
    await stage(handlers)
    await handlers.fetch(request('articles/reviewed-guide/publish', { method: 'POST', body: JSON.stringify(article) }))
    const response = await handlers.fetch(request('articles/reviewed-guide/status?version=2'))
    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({ code: 'DEPLOYMENT_STATUS_NOT_CONFIGURED' })
  })

  it.each([
    ['active', 'PUBLISHING'],
    ['success', 'PUBLISHED'],
    ['failure', 'FAILED'],
  ])('maps a matching production Cloudflare deployment in %s state to %s', async (stageStatus, expected) => {
    const pagesFetch = async () => Response.json({ result: [{
      id: 'pages-deployment-7', environment: 'production', latest_stage: { status: stageStatus },
      deployment_trigger: { metadata: { commit_hash: 'source-commit', commit_message: 'Publish growth deployment reviewed-guide-v2' } },
    }] })
    const { handlers } = setup({
      CLOUDFLARE_ACCOUNT_ID: 'account-1', CLOUDFLARE_PAGES_PROJECT: 'website', CLOUDFLARE_API_TOKEN: 'pages-token',
    }, { fetch: pagesFetch })
    await stage(handlers)
    await handlers.fetch(request('articles/reviewed-guide/publish', { method: 'POST', body: JSON.stringify(article) }))
    const response = await handlers.fetch(request('articles/reviewed-guide/status?version=2'))
    await expect(response.json()).resolves.toMatchObject({ status: expected })
  })

  it('recovers a committed source attempt without matching an unrelated production deployment', async () => {
    const deployments = new FailingSecondDeploymentPutKV()
    let statusCalls = 0
    const pagesFetch = async () => {
      statusCalls += 1
      const commitMessage = statusCalls === 1
        ? 'Publish growth deployment reviewed-guide-v2-attempt-99'
        : 'Publish growth deployment reviewed-guide-v2-attempt-1'
      return Response.json({ result: [{
        id: `pages-deployment-${statusCalls}`, environment: 'production', latest_stage: { status: 'success' },
        deployment_trigger: { metadata: { commit_hash: 'unavailable-after-kv-failure', commit_message: commitMessage } },
      }] })
    }
    const { handlers, repository } = setup({
      BLOG_PREVIEWS: deployments,
      CLOUDFLARE_ACCOUNT_ID: 'account-1', CLOUDFLARE_PAGES_PROJECT: 'website', CLOUDFLARE_API_TOKEN: 'pages-token',
    }, { fetch: pagesFetch })
    await stage(handlers)

    await expect(handlers.fetch(request('articles/reviewed-guide/publish', {
      method: 'POST', body: JSON.stringify(article),
    }))).rejects.toThrow('KV unavailable')
    expect(repository.calls).toHaveLength(1)
    expect(repository.calls[0]?.deploymentId).toBe('reviewed-guide-v2-attempt-1')

    const unrelated = await handlers.fetch(request('articles/reviewed-guide/status?version=2'))
    await expect(unrelated.json()).resolves.toMatchObject({ status: 'PUBLISHING' })
    const recovered = await handlers.fetch(request('articles/reviewed-guide/status?version=2'))
    await expect(recovered.json()).resolves.toMatchObject({
      status: 'PUBLISHED', provider_deployment_id: 'pages-deployment-2',
    })
  })
})
