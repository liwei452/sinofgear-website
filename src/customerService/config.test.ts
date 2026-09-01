import { describe, expect, it } from 'vitest'
import { readCustomerServiceConfig } from './config'

describe('customer-service configuration', () => {
  it('stays disabled by default', () => {
    expect(readCustomerServiceConfig({ VITE_CUSTOMER_SERVICE_ENABLED: 'false' })).toBeNull()
  })

  it('accepts complete public HTTPS configuration', () => {
    expect(readCustomerServiceConfig({
      VITE_CUSTOMER_SERVICE_ENABLED: 'true',
      VITE_CUSTOMER_SERVICE_SDK_URL: 'https://static.t.venorzom.com/loader.js',
      VITE_CUSTOMER_SERVICE_SITE_KEY: 'pk_live_1234567890abcdef1234567890abcdef',
      VITE_CUSTOMER_SERVICE_ENDPOINT: 'https://apigw.t.venorzom.com/',
      VITE_CUSTOMER_SERVICE_LOCALE: 'en',
    })).toEqual({
      sdkUrl: 'https://static.t.venorzom.com/loader.js',
      siteKey: 'pk_live_1234567890abcdef1234567890abcdef',
      endpoint: 'https://apigw.t.venorzom.com/',
      locale: 'en',
    })
  })

  it('rejects insecure or incomplete configuration', () => {
    expect(readCustomerServiceConfig({
      VITE_CUSTOMER_SERVICE_ENABLED: 'true',
      VITE_CUSTOMER_SERVICE_SDK_URL: 'http://cdn.example.com/sdk.js',
      VITE_CUSTOMER_SERVICE_SITE_KEY: 'pk_live_1234567890abcdef1234567890abcdef',
      VITE_CUSTOMER_SERVICE_ENDPOINT: 'https://apigw.t.venorzom.com/',
    })).toBeNull()
    expect(readCustomerServiceConfig({
      VITE_CUSTOMER_SERVICE_ENABLED: 'true',
      VITE_CUSTOMER_SERVICE_SDK_URL: 'https://cdn.example.com/sdk.js',
      VITE_CUSTOMER_SERVICE_SITE_KEY: 'pk_live_1234567890abcdef1234567890abcdef',
    })).toBeNull()
  })

  it('rejects untrusted origins and malformed public site keys', () => {
    const base = {
      VITE_CUSTOMER_SERVICE_ENABLED: 'true',
      VITE_CUSTOMER_SERVICE_SDK_URL: 'https://static.t.venorzom.com/loader.js',
      VITE_CUSTOMER_SERVICE_SITE_KEY: 'pk_live_1234567890abcdef1234567890abcdef',
      VITE_CUSTOMER_SERVICE_ENDPOINT: 'https://apigw.t.venorzom.com/',
    }

    expect(readCustomerServiceConfig({
      ...base,
      VITE_CUSTOMER_SERVICE_SDK_URL: 'https://attacker.example/loader.js',
    })).toBeNull()
    expect(readCustomerServiceConfig({
      ...base,
      VITE_CUSTOMER_SERVICE_ENDPOINT: 'https://attacker.example/',
    })).toBeNull()
    expect(readCustomerServiceConfig({
      ...base,
      VITE_CUSTOMER_SERVICE_SITE_KEY: 'pk_live_short',
    })).toBeNull()
  })
})
