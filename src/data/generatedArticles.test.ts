import { describe, expect, it } from 'vitest'

import type { Article } from './articleTypes'
import { loadGeneratedArticleModules, mergeArticles } from './generatedArticles'

const payload = {
  organization_id: 'sinofgear', site_code: 'sinofgears', article_key: 'generated-gear-guide', version: 1,
  title: 'Generated Gear Guide for Industrial Sourcing Teams',
  summary: 'A practical generated guide for industrial buyers preparing a controlled drawing and supplier engineering review.',
  body: '## Prepare the review\n\nConfirm the controlled drawing before engineering review.\n\n## Compare evidence\n\n| Item | Evidence |\n| --- | --- |\n| Drawing | Revision |',
  language: 'en', target_market: 'United States', topic_cluster: 'Sourcing',
  seo_title: 'Generated Gear Guide',
  seo_description: 'A practical generated gear guide covering drawing review, sourcing evidence, and supplier communication for industrial buyers.',
  faq: [
    { question: 'What starts the review?', answer: 'A controlled drawing.' },
    { question: 'What context is useful?', answer: 'Quantity and application.' },
    { question: 'What should be agreed?', answer: 'Inspection scope.' },
  ],
  structured_data: { '@type': 'Article' }, image_alt: 'Gear drawing review',
  internal_links: [{ label: 'Custom gears', url: '/products/custom-gears' }], evidence_ids: [],
  published_at: '2026-08-26', updated_at: '2026-08-26',
}

describe('generated article loading', () => {
  it('loads JSON modules in newest-first order', () => {
    const articles = loadGeneratedArticleModules({
      '../../content/blog/older.json': { default: { ...payload, article_key: 'older-guide', published_at: '2026-08-20', updated_at: '2026-08-20' } },
      '../../content/blog/newer.json': { default: payload },
    })
    expect(articles.map(({ slug }) => slug)).toEqual(['generated-gear-guide', 'older-guide'])
  })

  it('loads versioned generated TypeScript module arrays without dropping existing articles', () => {
    const generated = loadGeneratedArticleModules({
      './generatedArticles/one.ts': { default: [payload, { ...payload, article_key: 'second-generated-guide' }] },
    })

    expect(generated.map(({ slug }) => slug)).toEqual(['generated-gear-guide', 'second-generated-guide'])
  })

  it('rejects a generated slug that duplicates an existing article', () => {
    const existing = { slug: 'generated-gear-guide' } as Article
    const generated = loadGeneratedArticleModules({ '../../content/blog/generated.json': { default: payload } })
    expect(() => mergeArticles([existing], generated)).toThrow('generated-gear-guide')
  })
})
