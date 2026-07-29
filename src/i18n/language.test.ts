import { describe, expect, it } from 'vitest'
import { getLocalizedValue, resolveInitialLanguage } from './language'

describe('language selection', () => {
  it('defaults to English without a saved choice or mapped country', () => {
    expect(resolveInitialLanguage(null)).toBe('en')
    expect(resolveInitialLanguage(null, 'FR')).toBe('en')
  })

  it('uses a mapped IP country when there is no saved choice', () => {
    expect(resolveInitialLanguage(null, 'CN')).toBe('zh')
    expect(resolveInitialLanguage(null, 'DE')).toBe('de')
  })

  it('keeps a saved choice ahead of IP country', () => {
    expect(resolveInitialLanguage('es', 'CN')).toBe('es')
  })

  it('falls back to English content when a translation is missing', () => {
    expect(getLocalizedValue({ en: 'Products', de: 'Produkte' }, 'ja')).toBe('Products')
  })
})
