import { describe, expect, it } from 'vitest'

import { defineGrowthSite } from '../src/index'
import type { GrowthArticle, GrowthSiteConfig } from '../src/index'

const article: GrowthArticle = {
  organization_id: 'org-1', site_code: 'sinofgears', article_key: 'reviewed-guide', version: 2,
  title: 'Reviewed guide', summary: 'Summary', body: '## Review\n\nBody', language: 'en', target_market: 'US',
  topic_cluster: 'Inspection', seo_title: 'Reviewed SEO title', seo_description: 'Description',
  faq: [{ question: 'Q?', answer: 'A.' }], structured_data: { '@type': 'TechArticle' }, image_alt: 'Gear',
  internal_links: [{ label: 'Helical gears', url: '/products/helical-gears' }], evidence_ids: ['source-1'],
  published_at: '2026-09-02', updated_at: '2026-09-03',
}

describe('growth preview handler', () => {
  it('stores the complete canonical payload before returning the formal preview URL', async () => {
    const stored: GrowthArticle[] = []
    const config: GrowthSiteConfig = {
      token: 'token',
      capabilities: {
        contract_version: 'v1', site_code: 'sinofgears', languages: ['en'], seo_description_max_length: 165,
        faq_min_items: 1, faq_max_items: 6, allowed_internal_routes: ['/products/helical-gears'],
        allowed_product_slugs: ['helical-gears'], image_mime_types: ['image/webp'], image_max_bytes: 5_000_000,
        cover_image_required: false,
      },
      deployments: { get: async () => null, put: async () => undefined },
      repository: { putFiles: async () => ({ id: 'commit', url: 'https://github.example/commit' }) },
      canonicalBaseUrl: 'https://sinofgears.com', previewBaseUrl: 'https://sinofgears.com',
      loadAsset: async () => ({ bytes: new Uint8Array(), mimeType: 'image/webp' }),
      storePreview: async (payload) => { stored.push(payload); return { accessToken: 'preview-token' } },
      renderArticle: () => 'rendered',
    }
    const response = await defineGrowthSite(config).fetch(new Request(
      'https://sinofgears.com/growth/v1/articles/reviewed-guide/preview',
      { method: 'POST', headers: { Authorization: 'Bearer token' }, body: JSON.stringify(article) },
    ))

    expect(response.status).toBe(201)
    const result = await response.json() as { status: string; preview_url: string }
    const previewUrl = new URL(result.preview_url)
    expect(result.status).toBe('PREVIEW_READY')
    expect(previewUrl.origin + previewUrl.pathname).toBe('https://sinofgears.com/growth-preview/reviewed-guide')
    expect(previewUrl.searchParams.get('version')).toBe('2')
    expect(previewUrl.searchParams.get('access_token')).toBe('preview-token')
    expect(stored).toEqual([article])
  })

  it('fails closed when preview storage does not return an access token', async () => {
    const config: GrowthSiteConfig = {
      token: 'token',
      capabilities: {
        contract_version: 'v1', site_code: 'sinofgears', languages: ['en'], seo_description_max_length: 165,
        faq_min_items: 1, faq_max_items: 6, allowed_internal_routes: ['/products/helical-gears'],
        allowed_product_slugs: ['helical-gears'], image_mime_types: ['image/webp'], image_max_bytes: 5_000_000,
        cover_image_required: false,
      },
      deployments: { get: async () => null, put: async () => undefined },
      repository: { putFiles: async () => ({ id: 'commit', url: 'https://github.example/commit' }) },
      canonicalBaseUrl: 'https://sinofgears.com', previewBaseUrl: 'https://sinofgears.com',
      loadAsset: async () => ({ bytes: new Uint8Array(), mimeType: 'image/webp' }),
      storePreview: async () => ({ accessToken: '' }),
      renderArticle: () => 'rendered',
    }
    const response = await defineGrowthSite(config).fetch(new Request(
      'https://sinofgears.com/growth/v1/articles/reviewed-guide/preview',
      { method: 'POST', headers: { Authorization: 'Bearer token' }, body: JSON.stringify(article) },
    ))

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ code: 'PREVIEW_UNAVAILABLE' })
  })
})
