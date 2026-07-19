import { describe, expect, it } from 'vitest'
import { localizeText, translate } from './messages'

describe('multilingual message catalog', () => {
  it('returns translated shared messages for every supported non-English language', () => {
    expect(translate('zh', 'nav.products')).toBe('产品')
    expect(translate('de', 'action.requestQuote')).toBe('Angebot anfragen')
    expect(translate('ja', 'form.email')).toBe('メールアドレス')
    expect(translate('es', 'section.materials')).toBe('Materiales')
  })

  it('falls back to English when localized content is absent', () => {
    expect(localizeText('English fallback', 'zh')).toBe('English fallback')
  })
})
