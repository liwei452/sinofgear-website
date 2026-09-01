import type { CustomerServiceConfig } from './types'

type PublicEnvironment = Record<string, string | undefined>

const TRUSTED_SDK_URL = 'https://static.t.venorzom.com/loader.js'
const TRUSTED_ENDPOINT = 'https://apigw.t.venorzom.com/'

export function readCustomerServiceConfig(env: PublicEnvironment): CustomerServiceConfig | null {
  if (env.VITE_CUSTOMER_SERVICE_ENABLED !== 'true') return null

  const sdkUrl = env.VITE_CUSTOMER_SERVICE_SDK_URL?.trim()
  const siteKey = env.VITE_CUSTOMER_SERVICE_SITE_KEY?.trim()
  const endpoint = env.VITE_CUSTOMER_SERVICE_ENDPOINT?.trim()
  const locale = env.VITE_CUSTOMER_SERVICE_LOCALE?.trim() || 'en'

  if (!sdkUrl || !siteKey || !endpoint) return null
  if (sdkUrl !== TRUSTED_SDK_URL) return null
  if (endpoint !== TRUSTED_ENDPOINT) return null
  if (!/^pk_(?:live|test)_[A-Za-z0-9]{24,64}$/.test(siteKey)) return null
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale)) return null

  return { sdkUrl, siteKey, endpoint, locale }
}
