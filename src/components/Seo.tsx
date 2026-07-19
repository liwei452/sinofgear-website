import { useEffect } from 'react'
import type { PageSeo } from '@/data/pages'
import { getSiteUrl } from '@/data/site'
import { buildCanonicalUrl, buildOrganizationSchema, type JsonLdRecord } from '@/lib/seo'

interface SeoProps {
  seo: PageSeo
  pathname: string
  type?: 'website' | 'product'
  image?: string
  noIndex?: boolean
  structuredData?: JsonLdRecord[]
}

const JSON_LD_ID = 'sinoform-route-schema'

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value))
}

export default function Seo({
  seo,
  pathname,
  type = 'website',
  image,
  noIndex = false,
  structuredData = [],
}: SeoProps) {
  useEffect(() => {
    const siteUrl = getSiteUrl()
    const canonicalUrl = buildCanonicalUrl(siteUrl, pathname)
    document.title = seo.title

    setMeta('meta[name="description"]', { name: 'description', content: seo.description })
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow',
    })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: seo.title })
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: seo.description,
    })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'SINOFORM' })

    if (image) {
      setMeta('meta[property="og:image"]', {
        property: 'og:image',
        content: buildCanonicalUrl(siteUrl, image),
      })
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove()
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    document.getElementById(JSON_LD_ID)?.remove()
    if (!noIndex) {
      const script = document.createElement('script')
      script.id = JSON_LD_ID
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify([
        buildOrganizationSchema(siteUrl),
        ...structuredData,
      ])
      document.head.appendChild(script)
    }

    return () => {
      document.getElementById(JSON_LD_ID)?.remove()
    }
  }, [image, noIndex, pathname, seo.description, seo.title, structuredData, type])

  return null
}
