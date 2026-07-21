import { describe, expect, it } from 'vitest'
import { readCustomerServiceConfig } from './config'

describe('customer-service configuration', () => {
  it('stays disabled by default', () => {
    expect(readCustomerServiceConfig({ VITE_CUSTOMER_SERVICE_ENABLED: 'false' })).toBeNull()
  })

  it('accepts complete public HTTPS configuration', () => {
    expect(readCustomerServiceConfig({
      VITE_CUSTOMER_SERVICE_ENABLED: 'true',
      VITE_CUSTOMER_SERVICE_SDK_URL: 'https://cdn.example.com/sdk.js',
      VITE_CUSTOMER_SERVICE_APP_ID: 'public-app-id',
      VITE_CUSTOMER_SERVICE_GLOBAL: 'SinoformSupport',
    })).toEqual({
      sdkUrl: 'https://cdn.example.com/sdk.js',
      appId: 'public-app-id',
      globalName: 'SinoformSupport',
    })
  })

  it('rejects insecure or incomplete configuration', () => {
    expect(readCustomerServiceConfig({
      VITE_CUSTOMER_SERVICE_ENABLED: 'true',
      VITE_CUSTOMER_SERVICE_SDK_URL: 'http://cdn.example.com/sdk.js',
      VITE_CUSTOMER_SERVICE_APP_ID: 'public-app-id',
      VITE_CUSTOMER_SERVICE_GLOBAL: 'Support',
    })).toBeNull()
    expect(readCustomerServiceConfig({
      VITE_CUSTOMER_SERVICE_ENABLED: 'true',
      VITE_CUSTOMER_SERVICE_SDK_URL: 'https://cdn.example.com/sdk.js',
    })).toBeNull()
  })
})
