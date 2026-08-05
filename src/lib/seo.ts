import type { Product, ProductFaq } from '@/data/products'
import { siteConfig } from '@/data/site'

export type JsonLdRecord = Record<string, unknown>

export function buildCanonicalUrl(baseUrl: string, pathname: string): string {
  const normalizedBase = `${baseUrl.replace(/\/+$/, '')}/`
  const normalizedPath = pathname === '/' ? '' : pathname.replace(/^\/+/, '')
  return new URL(normalizedPath, normalizedBase).toString()
}

export function buildOrganizationSchema(baseUrl: string): JsonLdRecord {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.brand,
    legalName: siteConfig.legalName,
    foundingDate: siteConfig.founded,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address,
      addressLocality: 'Changsha',
      addressRegion: 'Hunan',
      addressCountry: 'CN',
    },
    url: buildCanonicalUrl(baseUrl, '/'),
  }
}

export function buildPageBreadcrumbSchema(
  name: string,
  pathname: string,
  baseUrl: string,
): JsonLdRecord & { itemListElement: Array<Record<string, unknown>> } {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: buildCanonicalUrl(baseUrl, '/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: buildCanonicalUrl(baseUrl, pathname),
      },
    ],
  }
}

export function buildProductSchema(product: Product, baseUrl: string): JsonLdRecord {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.valueProposition,
    image: buildCanonicalUrl(baseUrl, product.image),
    brand: {
      '@type': 'Brand',
      name: siteConfig.brand,
    },
    url: buildCanonicalUrl(baseUrl, `/products/${product.slug}`),
  }
}

export function buildBreadcrumbSchema(product: Product, baseUrl: string): JsonLdRecord & {
  itemListElement: Array<Record<string, unknown>>
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: buildCanonicalUrl(baseUrl, '/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: buildCanonicalUrl(baseUrl, '/products'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: buildCanonicalUrl(baseUrl, `/products/${product.slug}`),
      },
    ],
  }
}

export function buildFaqSchema(faq: ProductFaq[]): JsonLdRecord & {
  mainEntity: Array<Record<string, unknown>>
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
