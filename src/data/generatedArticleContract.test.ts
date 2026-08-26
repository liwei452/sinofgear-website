import { describe, expect, it } from 'vitest'

import { parseGeneratedArticle } from './generatedArticleContract'

const validPayload = {
  organization_id: 'sinofgear',
  site_code: 'sinofgears',
  article_key: 'gear-inspection-guide',
  version: 1,
  title: 'A Practical Gear Inspection Guide for Industrial Buyers',
  summary: 'A practical guide to drawing review, inspection scope, and supplier communication for custom gear sourcing projects.',
  body: [
    '## Start with the controlled drawing',
    '',
    'Confirm the drawing revision before engineering review.',
    '',
    '### Buyer checklist',
    '',
    '- Drawing revision',
    '- Quantity and application',
    '',
    '## Compare the inspection scope',
    '',
    '| Item | Evidence |',
    '| --- | --- |',
    '| Profile | Gear inspection chart |',
    '',
    '1. Agree the scope',
    '2. Review the report',
  ].join('\n'),
  language: 'en',
  target_market: 'United States',
  topic_cluster: 'gear inspection',
  seo_title: 'Gear Inspection Guide for Industrial Buyers',
  seo_description: 'Review drawing, measurement, reporting, and supplier communication considerations for industrial custom gear sourcing.',
  faq: [
    { question: 'What should a buyer provide?', answer: 'Provide the controlled drawing and application context.' },
    { question: 'How should inspection be agreed?', answer: 'Agree the characteristics, methods, and report before production.' },
    { question: 'Why does revision control matter?', answer: 'It keeps quotation, production, and acceptance aligned.' },
  ],
  structured_data: { '@type': 'Article' },
  image_alt: 'Gear inspection report reviewed beside a precision gear',
  internal_links: [{ label: 'Custom gears', url: '/products/custom-gears' }],
  evidence_ids: ['approved-fact-1'],
  published_at: '2026-08-26',
  updated_at: '2026-08-26',
}

describe('generated article contract', () => {
  it('turns approved English content into the existing Article shape', () => {
    const article = parseGeneratedArticle(validPayload)

    expect(article.slug).toBe('gear-inspection-guide')
    expect(article.sections).toHaveLength(2)
    expect(article.sections[0].blocks.map(({ type }) => type)).toEqual(['paragraph', 'subheading', 'list'])
    expect(article.sections[1].blocks.map(({ type }) => type)).toEqual(['table', 'list'])
    expect(article.relatedProductSlugs).toEqual(['custom-gears'])
  })

  it.each([
    ['body', { body: '<script>alert(1)</script>' }],
    ['language', { language: 'zh-CN' }],
    ['version', { version: 0 }],
    ['article_key', { article_key: 'Gear Inspection' }],
    ['title', { title: '' }],
    ['body', { body: '' }],
    ['internal_links', { internal_links: [{ label: 'Outside', url: 'https://example.com' }] }],
  ])('rejects an invalid %s field', (field, override) => {
    expect(() => parseGeneratedArticle({ ...validPayload, ...override })).toThrow(field)
  })
})
