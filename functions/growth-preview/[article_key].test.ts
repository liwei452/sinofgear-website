import { expect, it } from 'vitest'

import { handleGrowthPreview } from './[article_key]'

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
    request: new Request('https://sinofgears.com/growth-preview/gear-guide?version=1'),
    env: { BLOG_PREVIEWS: { get: async () => JSON.stringify(payload) } },
    params: { article_key: 'gear-guide' },
  })
  const html = await response.text()
  expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  expect(html).toContain('<meta name="robots" content="noindex,nofollow">')
  expect(html).toContain('Confirm the drawing &amp; application.')
})
