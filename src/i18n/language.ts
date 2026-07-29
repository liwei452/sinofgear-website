export const supportedLanguages = ['en', 'de', 'ja', 'es', 'zh'] as const

export type Lang = (typeof supportedLanguages)[number]

export const LANGUAGE_STORAGE_KEY = 'sinoform-language'

export const languageNames: Record<Lang, string> = {
  en: 'English',
  de: 'Deutsch',
  ja: '日本語',
  es: 'Español',
  zh: '中文',
}

export function isSupportedLanguage(value: string | null | undefined): value is Lang {
  return supportedLanguages.includes(value as Lang)
}

export function resolveInitialLanguage(
  saved: string | null,
  countryCode?: string | null,
): Lang {
  if (isSupportedLanguage(saved)) return saved
  return languageFromCountryCode(countryCode) ?? 'en'
}

export function languageFromCountryCode(countryCode?: string | null): Lang | undefined {
  const code = countryCode?.trim().toUpperCase()
  if (!code) return undefined

  if (['DE', 'AT', 'CH', 'LI'].includes(code)) return 'de'
  if (code === 'JP') return 'ja'
  if (['ES', 'MX', 'AR', 'CL', 'CO', 'PE'].includes(code)) return 'es'
  if (['CN', 'HK', 'MO', 'TW'].includes(code)) return 'zh'
  return undefined
}

export function getLocalizedValue<T>(values: { en: T } & Partial<Record<Lang, T>>, lang: Lang): T {
  return values[lang] ?? values.en
}
