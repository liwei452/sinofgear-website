import { describe, expect, it } from 'vitest'
import { getLocalizedValue, resolveInitialLanguage } from './language'

describe('language selection', () => {
  it.each([
    ['en-US', 'en'],
    ['de-DE', 'de'],
    ['ja-JP', 'ja'],
    ['es-MX', 'es'],
    ['zh-CN', 'zh'],
  ] as const)('maps browser locale %s to %s', (browserLocale, expected) => {
    expect(resolveInitialLanguage(null, [browserLocale])).toBe(expected)
  })

  it('falls back to English for unsupported browser languages', () => {
    expect(resolveInitialLanguage(null, ['fr-FR'])).toBe('en')
  })

  it('uses a saved supported language before browser languages', () => {
    expect(resolveInitialLanguage('de', ['ja-JP'])).toBe('de')
  })

  it('uses a supported IP country before browser languages when there is no saved choice', () => {
    expect(resolveInitialLanguage(null, ['en-US'], 'CN')).toBe('zh')
  })

  it('keeps a saved choice ahead of IP country and browser language', () => {
    expect(resolveInitialLanguage('es', ['en-US'], 'CN')).toBe('es')
  })

  it('falls back to English content when a translation is missing', () => {
    expect(getLocalizedValue({ en: 'Products', de: 'Produkte' }, 'ja')).toBe('Products')
  })
})
