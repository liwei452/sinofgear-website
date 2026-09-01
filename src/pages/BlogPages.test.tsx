import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { articles } from '@/data/articles'
import { parseGeneratedArticle } from '@/data/generatedArticleContract'
import { LANGUAGE_STORAGE_KEY } from '@/i18n/language'

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('blog pages', () => {
  beforeEach(() => localStorage.clear())

  it('renders the insights index and all six article cards', () => {
    renderAt('/blog')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Gear Sourcing Insights' }),
    ).toBeVisible()
    expect(screen.getAllByTestId('article-card')).toHaveLength(6)
  })

  it('renders an article with contents, FAQ, product links, and RFQ CTA', () => {
    renderAt(`/blog/${articles[0].slug}`)

    expect(screen.getByRole('heading', { level: 1, name: articles[0].title })).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 2, name: 'Frequently asked questions' })).toBeVisible()
    expect(within(screen.getByLabelText('Related products')).getByRole('link', { name: 'Custom Gears' })).toHaveAttribute(
      'href',
      '/products/custom-gears',
    )
    expect(screen.getByRole('link', { name: 'Request drawing review' })).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  it('shows the English notice in a non-English site mode', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de')
    renderAt('/blog')

    expect(
      screen.getByText('Technical articles are currently available in English.'),
    ).toBeVisible()
  })

  it('uses the not-found experience for an unknown article slug', () => {
    renderAt('/blog/not-a-real-article')

    expect(screen.getByRole('heading', { level: 1, name: 'Page Not Found' })).toBeVisible()
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
  })

  it('renders generated Markdown with approved SEO, JSON-LD, and internal links', () => {
    const generated = parseGeneratedArticle({
      organization_id: 'org-1', site_code: 'sinofgears', article_key: 'generated-review', version: 2,
      title: 'Generated review', summary: 'Summary for the generated review.',
      body: '## Review\n\nBody with [helical gears](/products/helical-gears).', language: 'en', target_market: 'US',
      topic_cluster: 'Inspection', seo_title: 'Approved SEO title', seo_description: 'Approved description for an industrial sourcing review.',
      faq: [
        { question: 'What starts the review?', answer: 'A controlled drawing.' },
        { question: 'What context is useful?', answer: 'Quantity and application.' },
        { question: 'What should be agreed?', answer: 'Inspection scope.' },
      ],
      structured_data: { '@type': 'TechArticle', proficiencyLevel: 'Expert' }, image_alt: 'Gear',
      internal_links: [
        { label: 'Helical gears', url: '/products/helical-gears' },
        { label: 'Quality approach', url: '/quality' },
      ],
      evidence_ids: ['fact-1'], published_at: '2026-09-02', updated_at: '2026-09-03',
      hero_image: '/assets/gear-helical.jpg',
    })
    articles.push(generated)
    try {
      renderAt('/blog/generated-review')
      expect(screen.getByRole('heading', { level: 2, name: 'Review' })).toBeVisible()
      expect(screen.queryByText(/## Review/)).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'helical gears' })).toHaveAttribute('href', '/products/helical-gears')
      expect(within(screen.getByLabelText('Related products')).getByRole('link', { name: 'Helical Gears' })).toHaveAttribute('href', '/products/helical-gears')
      expect(within(screen.getByLabelText('Related resources')).getByRole('link', { name: 'Quality approach' })).toHaveAttribute('href', '/quality')
      expect(document.title).toBe('Approved SEO title | SINOF')
      expect(document.getElementById('sinoform-route-schema')?.textContent).toContain('TechArticle')
      expect(document.querySelector('article')).toHaveAttribute('data-article-version', '2')
    } finally {
      articles.pop()
    }
  })
})
