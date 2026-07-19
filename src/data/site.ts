import type { Lang } from '@/i18n/language'

export const siteConfig = {
  brand: 'SINOFORM',
  descriptor: 'Custom Gears',
  legalName: null,
  defaultUrl: 'https://www.sinoforce.net',
  email: null,
  phone: null,
  whatsapp: null,
  address: null,
} as const

export const publicRoutes = [
  '/',
  '/products',
  '/products/spur-gears',
  '/products/helical-gears',
  '/products/bevel-gears',
  '/products/timing-pulleys',
  '/products/gear-racks',
  '/products/custom-gears',
  '/capabilities',
  '/quality',
  '/contact',
] as const

export const navItems = [
  { label: 'Products', href: '/products' },
  { label: 'Capabilities', href: '/capabilities' },
  { label: 'Quality', href: '/quality' },
  { label: 'Contact', href: '/contact' },
] as const

export const htmlLanguageCodes: Record<Lang, string> = {
  en: 'en',
  de: 'de',
  ja: 'ja',
  es: 'es',
  zh: 'zh-CN',
}

export function getSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim()
  return configured || siteConfig.defaultUrl
}
