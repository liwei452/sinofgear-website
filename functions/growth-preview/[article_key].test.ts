import { expect, it } from 'vitest'

import { handleGrowthPreview } from './[article_key]'
import { growthPublishing } from '../lib/growthPublishing'

class MemoryKV {
  values = new Map<string, string>()
  get(key: string) { return Promise.resolve(this.values.get(key) ?? null) }
  put(key: string, value: string) { this.values.set(key, value); return Promise.resolve() }
}

it('renders an escaped noindex preview from KV', async () => {
  const payload = {
    organization_id: 'org-sinof', site_code: 'sinofgears', article_key: 'gear-guide', version: 1,
    title: 'Gear Guide for Industrial Buyers', summary: 'A practical guide for industrial buyers preparing a controlled drawing and engineering review.',
    body: '## Drawing review\n\nConfirm the drawing & application.', language: 'en', target_market: 'US', topic_cluster: 'Sourcing',
    seo_title: 'Gear Guide', seo_description: 'A practical gear guide covering drawing review, sourcing evidence, and supplier communication for industrial buyers.',
    faq: [{ question: 'One?', answer: 'One.' }, { question: 'Two?', answer: 'Two.' }, { question: 'Three?', answer: 'Three.' }],
    structured_data: {}, image_alt: 'Gear review', internal_links: [{ label: 'Gears', url: '/products/custom-gears' }], evidence_ids: [],
    published_at: '2026-08-26', updated_at: '2026-08-26',
  }
  const response = await handleGrowthPreview({
    request: new Request('https://sinofgears.com/growth-preview/gear-guide?version=1&access_token=preview-token'),
    env: { BLOG_PREVIEWS: { get: async () => JSON.stringify({ access_token: 'preview-token', article: payload }) } },
    params: { article_key: 'gear-guide' },
  })
  const html = await response.text()
  expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  expect(html).toContain('<meta name="robots" content="noindex,nofollow">')
  expect(html).toContain('Confirm the drawing &amp; application.')
})

it.each([
  ['missing', 'https://sinofgears.com/growth-preview/gear-guide?version=1'],
  ['incorrect', 'https://sinofgears.com/growth-preview/gear-guide?version=1&access_token=wrong-token'],
])('rejects a %s preview access token', async (_case, url) => {
  const response = await handleGrowthPreview({
    request: new Request(url),
    env: { BLOG_PREVIEWS: { get: async () => JSON.stringify({
      access_token: 'correct-token',
      article: { article_key: 'gear-guide', version: 1 },
    }) } },
    params: { article_key: 'gear-guide' },
  })

  expect(response.status).toBe(404)
})

it('does not expose a legacy preview record without an access token', async () => {
  const response = await handleGrowthPreview({
    request: new Request('https://sinofgears.com/growth-preview/gear-guide?version=1'),
    env: { BLOG_PREVIEWS: { get: async () => JSON.stringify({ article_key: 'gear-guide', version: 1 }) } },
    params: { article_key: 'gear-guide' },
  })

  expect(response.status).toBe(404)
})

it('opens the handler-returned versioned URL through the formal noindex preview Function', async () => {
  const kv = new MemoryKV()
  const handlers = growthPublishing({
    GROWTH_PUBLISH_TOKEN: 'token', GITHUB_CONTENT_TOKEN: 'unused',
    GITHUB_REPOSITORY: 'sinofgear/website', GITHUB_BRANCH: 'master', GROWTH_ORGANIZATION_ID: 'org-1',
    BLOG_PREVIEWS: kv, GROWTH_ASSETS: { get: async () => null, put: async () => undefined },
  }, { repository: { putFiles: async () => ({ id: 'commit', url: 'https://github.example/commit' }) } })
  const payload = {
    organization_id: 'org-1', site_code: 'sinofgears', article_key: 'reviewed-guide', version: 2,
    title: 'Reviewed guide for industrial buyers', summary: 'A practical reviewed guide for industrial buyers.',
    body: '## Review\n\nBody & evidence.', language: 'en', target_market: 'US', topic_cluster: 'Inspection',
    seo_title: 'Reviewed SEO title', seo_description: 'A reviewed industrial sourcing guide with practical engineering context.',
    faq: [
      { question: 'What starts the review?', answer: 'A controlled drawing.' },
      { question: 'What context is useful?', answer: 'Quantity and application.' },
      { question: 'What should be agreed?', answer: 'Inspection scope.' },
    ],
    structured_data: { '@type': 'TechArticle' }, image_alt: 'Gear',
    internal_links: [{ label: 'Helical gears', url: '/products/helical-gears' }], evidence_ids: ['source-1'],
    published_at: '2026-09-02', updated_at: '2026-09-03',
    cover_image: { asset_id: 'cover-1', filename: 'cover.webp', mime_type: 'image/webp', size_bytes: 3, alt: 'Gear', cover_role: 'HERO', reviewed_revision: 'review-2' },
  }
  const response = await handlers.fetch(new Request(
    'https://sinofgears.com/growth/v1/articles/reviewed-guide/preview',
    { method: 'POST', headers: { Authorization: 'Bearer token' }, body: JSON.stringify(payload) },
  ))
  const result = await response.json() as { preview_url: string }
  const preview = await handleGrowthPreview({
    request: new Request(result.preview_url), env: { BLOG_PREVIEWS: kv }, params: { article_key: 'reviewed-guide' },
  })
  const html = await preview.text()

  expect(response.status).toBe(201)
  expect(preview.status).toBe(200)
  expect(preview.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  expect(html).toContain('Version 2')
  expect(html).toContain('Body &amp; evidence.')
})
