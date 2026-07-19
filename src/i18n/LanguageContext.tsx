import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  htmlLanguageCodes,
} from '@/data/site'
import { detectVisitorCountry } from '@/services/geoLanguage'
import { translate, type MessageKey } from './messages'
import {
  LANGUAGE_STORAGE_KEY,
  languageFromCountryCode,
  resolveInitialLanguage,
  type Lang,
} from './language'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: MessageKey) => string
}

const Ctx = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translate('en', key),
})

interface LanguageProviderProps {
  children: ReactNode
  detectCountry?: () => Promise<string | undefined>
}

const detectConfiguredCountry = () => detectVisitorCountry({
  injectedCode: import.meta.env.VITE_VISITOR_COUNTRY_CODE,
  endpoint: import.meta.env.VITE_GEO_API_URL,
})

export function LanguageProvider({
  children,
  detectCountry = detectConfiguredCountry,
}: LanguageProviderProps) {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  const [lang, setLangState] = useState<Lang>(() => {
    return resolveInitialLanguage(savedLanguage, navigator.languages)
  })
  const manualSelectionRef = useRef(Boolean(savedLanguage))

  const setLang = (l: Lang) => {
    manualSelectionRef.current = true
    setLangState(l)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, l)
  }

  useEffect(() => {
    if (savedLanguage) return

    let active = true
    void detectCountry().then((countryCode) => {
      const detectedLanguage = languageFromCountryCode(countryCode)
      if (active && detectedLanguage && !manualSelectionRef.current) {
        setLangState(detectedLanguage)
      }
    })

    return () => {
      active = false
    }
  }, [detectCountry, savedLanguage])

  useEffect(() => {
    document.documentElement.lang = htmlLanguageCodes[lang]
  }, [lang])

  return (
    <Ctx.Provider value={{ lang, setLang, t: (key) => translate(lang, key) }}>
      {children}
    </Ctx.Provider>
  )
}

export const useLang = () => useContext(Ctx)
