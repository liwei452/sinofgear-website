import type { Lang } from '@/i18n/language'
import { articleRoutes } from './articles'

export const siteConfig = {
  brand: 'SINOF',
  descriptor: 'Custom Gears',
  legalName: 'Changsha Xingfeng Transmission Machinery Co., Ltd.',
  legalNameZh: '长沙市星沣传动机械有限公司',
  founded: '2008',
  defaultUrl: 'https://sinfogear.com',
  email: 'info@sinof.net',
  phone: '+86 731 8888 4918',
  phones: ['+86 731 8888 4918', '+86 731 8686 7700'],
  whatsapp: null,
  address:
    'Third Floor, Building 16, Zone B, Huanghua Comprehensive Bonded Zone, Changsha Airport Economic and Free Trade Zone, Changsha, Hunan, China',
} as const

export const publicRoutes = [
  '/',
  '/about',
  '/products',
  '/products/spur-gears',
  '/products/helical-gears',
  '/products/bevel-gears',
  '/products/timing-pulleys',
  '/products/gear-racks',
  '/products/custom-gears',
  '/products/rubber-timing-belts',
  '/products/polyurethane-timing-belts',
  '/products/conveyor-belts',
  '/products/flat-belts',
  '/products/round-belts',
  '/capabilities',
  '/quality',
  '/contact',
  '/blog',
  ...articleRoutes,
] as const

export const navItems = [
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Capabilities', href: '/capabilities' },
  { label: 'Quality', href: '/quality' },
  { label: 'Insights', href: '/blog' },
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
