interface GeoDetectionOptions {
  injectedCode?: string
  endpoint?: string
  fetcher?: typeof fetch
  timeoutMs?: number
}

const CLOUDFLARE_TRACE_ENDPOINT = '/cdn-cgi/trace'

function normalizeCountryCode(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const code = value.trim().toUpperCase()
  return /^[A-Z]{2}$/.test(code) ? code : undefined
}

export function parseCountryCode(value: unknown): string | undefined {
  if (typeof value === 'string') return normalizeCountryCode(value)
  if (!value || typeof value !== 'object') return undefined

  const record = value as Record<string, unknown>
  return normalizeCountryCode(record.countryCode)
    ?? normalizeCountryCode(record.country)
    ?? normalizeCountryCode(record.country_code)
}

export function parseCloudflareTrace(value: string): string | undefined {
  const countryLine = value
    .split(/\r?\n/)
    .find((line) => line.startsWith('loc='))
  const code = countryLine?.slice(4)
  return code === 'XX' ? undefined : normalizeCountryCode(code)
}

export async function detectVisitorCountry({
  injectedCode,
  endpoint,
  fetcher = fetch,
  timeoutMs = 2500,
}: GeoDetectionOptions = {}): Promise<string | undefined> {
  const injected = parseCountryCode(injectedCode)
  if (injected) return injected
  const target = endpoint?.trim() || CLOUDFLARE_TRACE_ENDPOINT

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetcher(
      target,
      target === CLOUDFLARE_TRACE_ENDPOINT
        ? { signal: controller.signal }
        : {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          },
    )
    if (!response.ok) return undefined
    return target === CLOUDFLARE_TRACE_ENDPOINT
      ? parseCloudflareTrace(await response.text())
      : parseCountryCode(await response.json())
  } catch {
    return undefined
  } finally {
    window.clearTimeout(timer)
  }
}
