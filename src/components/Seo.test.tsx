import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LanguageProvider } from '@/i18n/LanguageContext'
import Seo from './Seo'

describe('Seo article metadata', () => {
  it('adds and removes article publication metadata', async () => {
    const { rerender } = render(
      <LanguageProvider detectCountry={async () => undefined}>
        <Seo
          seo={{ title: 'Article title', description: 'Article description' }}
          pathname="/blog/article"
          type="article"
          publishedAt="2026-08-01"
          updatedAt="2026-08-02"
        />
      </LanguageProvider>,
    )

    await waitFor(() => {
      expect(document.head.querySelector('meta[property="og:type"]')).toHaveAttribute(
        'content',
        'article',
      )
      expect(
        document.head.querySelector('meta[property="article:published_time"]'),
      ).toHaveAttribute('content', '2026-08-01')
      expect(
        document.head.querySelector('meta[property="article:modified_time"]'),
      ).toHaveAttribute('content', '2026-08-02')
    })

    rerender(
      <LanguageProvider detectCountry={async () => undefined}>
        <Seo
          seo={{ title: 'Index title', description: 'Index description' }}
          pathname="/blog"
        />
      </LanguageProvider>,
    )

    await waitFor(() => {
      expect(
        document.head.querySelector('meta[property="article:published_time"]'),
      ).not.toBeInTheDocument()
      expect(
        document.head.querySelector('meta[property="article:modified_time"]'),
      ).not.toBeInTheDocument()
    })
  })
})
