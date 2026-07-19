import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  htmlLanguageCodes,
} from '@/data/site'
import {
  LANGUAGE_STORAGE_KEY,
  resolveInitialLanguage,
  type Lang,
} from './language'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return resolveInitialLanguage(saved, navigator.languages)
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, l)
  }

  useEffect(() => {
    document.documentElement.lang = htmlLanguageCodes[lang]
  }, [lang])

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
