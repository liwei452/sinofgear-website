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

function languageFromLocale(locale: string): Lang | undefined {
  const base = locale.trim().toLowerCase().split(/[-_]/)[0]
  return isSupportedLanguage(base) ? base : undefined
}

export function resolveInitialLanguage(
  saved: string | null,
  browserLanguages: readonly string[],
  countryCode?: string | null,
): Lang {
  if (isSupportedLanguage(saved)) return saved

  const countryLanguage = languageFromCountryCode(countryCode)
  if (countryLanguage) return countryLanguage

  for (const browserLanguage of browserLanguages) {
    const match = languageFromLocale(browserLanguage)
    if (match) return match
  }

  return 'en'
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
