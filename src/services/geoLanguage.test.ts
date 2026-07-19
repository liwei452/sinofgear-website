import { describe, expect, it, vi } from 'vitest'
import { detectVisitorCountry, parseCountryCode } from './geoLanguage'

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
