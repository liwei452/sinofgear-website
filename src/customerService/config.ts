import type { CustomerServiceConfig } from './types'

type PublicEnvironment = Record<string, string | undefined>

export function readCustomerServiceConfig(env: PublicEnvironment): CustomerServiceConfig | null {
  if (env.VITE_CUSTOMER_SERVICE_ENABLED !== 'true') return null

  const sdkUrl = env.VITE_CUSTOMER_SERVICE_SDK_URL?.trim()
  const appId = env.VITE_CUSTOMER_SERVICE_APP_ID?.trim()
  const globalName = env.VITE_CUSTOMER_SERVICE_GLOBAL?.trim()

  if (!sdkUrl || !appId || !globalName) return null
  if (!/^https:\/\//i.test(sdkUrl)) return null
  if (!/^[A-Za-z_$][\w$]*$/.test(globalName)) return null

  return { sdkUrl, appId, globalName }
}
