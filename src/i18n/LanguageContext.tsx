import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { messages, type Messages } from './translations'
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
  t: Messages
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: messages.en })

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

  // Phase one keeps the locale architecture and falls back to reviewed English
  // until each additional language is approved.
  return <Ctx.Provider value={{ lang, setLang, t: messages.en }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
