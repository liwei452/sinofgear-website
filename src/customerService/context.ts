import type { Lang } from '@/i18n/language'
import type { CustomerServiceCampaign, CustomerServiceContext } from './types'

interface PublicLocation {
  pathname: string
  search: string
  href: string
  referrer?: string
}

interface ProductContext {
  slug: string
  name: string
}

const campaignKeys = {
  utm_source: 'source',
  utm_medium: 'medium',
  utm_campaign: 'campaign',
  utm_term: 'term',
  utm_content: 'content',
} as const

export function buildCustomerServiceContext(
  location: PublicLocation,
  language: Lang,
  product?: ProductContext,
): CustomerServiceContext {
  const params = new URLSearchParams(location.search)
  const campaign: CustomerServiceCampaign = {}

  for (const [queryKey, contextKey] of Object.entries(campaignKeys)) {
    const value = params.get(queryKey)?.trim()
    if (value) campaign[contextKey] = value.slice(0, 200)
  }

  let referrerOrigin: string | undefined
  if (location.referrer) {
    try {
      referrerOrigin = new URL(location.referrer).origin
    } catch {
      referrerOrigin = undefined
    }
  }

  return {
    language,
    pathname: location.pathname,
    url: location.href,
    ...(referrerOrigin ? { referrerOrigin } : {}),
    ...(product ? { productSlug: product.slug, productName: product.name } : {}),
    ...(Object.keys(campaign).length > 0 ? { campaign } : {}),
  }
}
