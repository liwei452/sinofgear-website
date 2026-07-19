import type { Lang } from './language'

const englishMessages = {
  'nav.products': 'Products',
  'action.requestQuote': 'Request a Quote',
  'form.email': 'Email',
  'section.materials': 'Materials',
} as const

export type MessageKey = keyof typeof englishMessages

type LocaleMessages = Partial<Record<MessageKey, string>>

export const messages: Record<Lang, LocaleMessages> & { en: typeof englishMessages } = {
  en: englishMessages,
  de: {
    'nav.products': 'Produkte',
    'action.requestQuote': 'Angebot anfragen',
    'form.email': 'E-Mail',
    'section.materials': 'Materialien',
  },
  ja: {
    'nav.products': '製品',
    'action.requestQuote': '見積もりを依頼',
    'form.email': 'メールアドレス',
    'section.materials': '材料',
  },
  es: {
    'nav.products': 'Productos',
    'action.requestQuote': 'Solicitar cotización',
    'form.email': 'Correo electrónico',
    'section.materials': 'Materiales',
  },
  zh: {
    'nav.products': '产品',
    'action.requestQuote': '获取报价',
    'form.email': '电子邮箱',
    'section.materials': '材料',
  },
}

export function translate(lang: Lang, key: MessageKey): string {
  return messages[lang][key] ?? messages.en[key]
}

const localizedContent: Record<Exclude<Lang, 'en'>, Record<string, string>> = {
  de: {},
  ja: {},
  es: {},
  zh: {},
}

export function localizeText(text: string, lang: Lang): string {
  if (lang === 'en') return text
  return localizedContent[lang][text] ?? text
}
