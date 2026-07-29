import { describe, expect, it, vi } from 'vitest'
import {
  detectVisitorCountry,
  parseCloudflareTrace,
  parseCountryCode,
} from './geoLanguage'

describe('geo language adapter', () => {
  it.each([
    [{ countryCode: 'cn' }, 'CN'],
    [{ country: 'DE' }, 'DE'],
    [{ country_code: 'jp' }, 'JP'],
  ])('parses supported country response shape %#', (value, expected) => {
    expect(parseCountryCode(value)).toBe(expected)
  })

  it('rejects malformed country values', () => {
    expect(parseCountryCode({ countryCode: 'China' })).toBeUndefined()
    expect(parseCountryCode(null)).toBeUndefined()
  })

  it('parses the Cloudflare trace country line', () => {
    expect(parseCloudflareTrace('ip=203.0.113.8\nloc=CN\ntls=TLSv1.3\n')).toBe('CN')
    expect(parseCloudflareTrace('ip=203.0.113.8\nloc=XX\n')).toBeUndefined()
    expect(parseCloudflareTrace('ip=203.0.113.8\n')).toBeUndefined()
  })

  it('uses the same-origin Cloudflare trace endpoint by default', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'ip=203.0.113.8\nloc=DE\n',
    })

    await expect(
      detectVisitorCountry({ fetcher: fetcher as typeof fetch }),
    ).resolves.toBe('DE')
    expect(fetcher).toHaveBeenCalledWith(
      '/cdn-cgi/trace',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('prefers an injected code without making a request', async () => {
    const fetcher = vi.fn()
    await expect(detectVisitorCountry({ injectedCode: 'es', endpoint: '/geo', fetcher })).resolves.toBe('ES')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('returns undefined when the endpoint fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'))
    await expect(detectVisitorCountry({ endpoint: '/geo', fetcher })).resolves.toBeUndefined()
  })
})
