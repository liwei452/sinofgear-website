import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { messages, type Lang, type Messages } from './translations'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: Messages
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: messages.en })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('sf-lang') as Lang | null
    if (saved && saved in messages) return saved
    const nav = navigator.language.toLowerCase()
    if (nav.startsWith('de')) return 'de'
    if (nav.startsWith('ja')) return 'ja'
    if (nav.startsWith('es')) return 'es'
    if (nav.startsWith('zh')) return 'zh'
    return 'en'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('sf-lang', l)
  }

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang
  }, [lang])

  return <Ctx.Provider value={{ lang, setLang, t: messages[lang] }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
