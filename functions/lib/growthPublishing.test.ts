import { describe, expect, it, vi } from 'vitest'

import { handleGrowthRequest, type GrowthPublishingEnv } from './growthPublishing'

class MemoryKv {
  rows = new Map<string, string>()
  async get(key: string) { return this.rows.get(key) ?? null }
  async put(key: string, value: string) { this.rows.set(key, value) }
}

const article = {
  organization_id: 'org-sinof', site_code: 'sinofgears', article_key: 'gear-inspection-guide', version: 2,
  title: 'A Practical Gear Inspection Guide for Industrial Buyers',
  summary: 'A practical guide to drawing review, inspection scope, and supplier communication for custom gear sourcing projects.',
  body: '## Prepare the review\n\nConfirm the controlled drawing before engineering review.\n\n## Compare evidence\n\nUse the agreed report.',
  language: 'en', target_market: 'United States', topic_cluster: 'gear inspection', seo_title: 'Gear Inspection Guide',
  seo_description: 'A practical gear inspection guide covering drawing review, sourcing evidence, and supplier communication for industrial buyers.',
  faq: [
    { question: 'What starts the review?', answer: 'A controlled drawing.' },
    { question: 'What context is useful?', answer: 'Quantity and application.' },
    { question: 'What should be agreed?', answer: 'Inspection scope.' },
  ],
  structured_data: { '@type': 'Article' }, image_alt: 'Gear inspection report',
  internal_links: [{ label: 'Custom gears', url: '/products/custom-gears' }], evidence_ids: [],
  published_at: '2026-08-26', updated_at: '2026-08-26',
}

function env(): GrowthPublishingEnv {
  return {
    BLOG_PREVIEWS: new MemoryKv(), GROWTH_PUBLISH_TOKEN: 'site-secret', GROWTH_ORGANIZATION_ID: 'org-sinof',
    GITHUB_CONTENT_TOKEN: 'github-secret', GITHUB_REPOSITORY: 'liwei452/sinofgear-website', GITHUB_BRANCH: 'master',
  }
}

function request(path: string, method = 'POST', body: unknown = article, token = 'site-secret') {
  return new Request(`https://sinofgears.com${path}`, {
    method, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  })
}

describe('SINOF growth publishing bridge', () => {
  it('rejects invalid credentials before reading the payload', async () => {
    const response = await handleGrowthRequest({ request: request('/growth/v1/articles/gear-inspection-guide/preview', 'POST', article, 'wrong'), env: env() })
    expect(response.status).toBe(401)
  })

  it('stores a seven-day noindex preview', async () => {
    const runtime = env()
    const response = await handleGrowthRequest({ request: request('/growth/v1/articles/gear-inspection-guide/preview'), env: runtime })
    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({ status: 'PREVIEW_READY', preview_url: 'https://sinofgears.com/growth-preview/gear-inspection-guide?version=2' })
    expect(await runtime.BLOG_PREVIEWS.get('preview:gear-inspection-guide:v2')).toContain('Gear Inspection Guide')
  })

  it('commits only the readable article JSON path and reports publishing', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response('Not found', { status: 404 }))
      .mockResolvedValueOnce(Response.json({ commit: { html_url: 'https://github.com/commit/1' } }, { status: 201 }))
    const response = await handleGrowthRequest({ request: request('/growth/v1/articles/gear-inspection-guide/publish'), env: env() }, fetcher)
    expect(response.status).toBe(202)
    expect(await response.json()).toMatchObject({ status: 'PUBLISHING' })
    expect(fetcher.mock.calls[0][0]).toContain('/contents/content/blog/gear-inspection-guide.json')
    const put = JSON.parse(String(fetcher.mock.calls[1][1]?.body))
    expect(put.message).toBe('content: publish gear-inspection-guide v2')
    expect(put.branch).toBe('master')
  })

  it('marks an article published only after the canonical page exposes the requested version', async () => {
    const runtime = env()
    await runtime.BLOG_PREVIEWS.put('publication:gear-inspection-guide', JSON.stringify({ article_key: 'gear-inspection-guide', version: 2 }))
    const fetcher = vi.fn().mockResolvedValue(new Response('<article data-article-key="gear-inspection-guide" data-article-version="2">Ready</article>'))
    const response = await handleGrowthRequest({ request: request('/growth/v1/articles/gear-inspection-guide/status', 'GET'), env: runtime }, fetcher)
    expect(await response.json()).toEqual({ status: 'PUBLISHED', canonical_url: 'https://sinofgears.com/blog/gear-inspection-guide' })
  })
})
