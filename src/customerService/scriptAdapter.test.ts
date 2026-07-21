import { describe, expect, it, vi } from 'vitest'
import { createScriptCustomerServiceAdapter } from './scriptAdapter'
import type { CustomerServiceConfig, CustomerServiceContext } from './types'

const config: CustomerServiceConfig = {
  sdkUrl: 'https://cdn.example.com/sdk.js',
  appId: 'public-app-id',
  globalName: 'SinoformSupport',
}

const context: CustomerServiceContext = {
  language: 'en',
  pathname: '/products',
  url: 'https://www.sinoforce.net/products',
}

describe('script customer-service adapter', () => {
  it('loads once, initializes once, and forwards public operations', async () => {
    const client = {
      open: vi.fn(), close: vi.fn(), identify: vi.fn(), setContext: vi.fn(), destroy: vi.fn(),
    }
    const initialize = vi.fn().mockResolvedValue(client)
    Object.assign(window, { SinoformSupport: { init: initialize } })
    const adapter = createScriptCustomerServiceAdapter(document, window)

    const first = adapter.init(config, context)
    const second = adapter.init(config, context)
    const script = document.querySelector<HTMLScriptElement>('[data-sinoform-customer-service]')
    expect(script).toHaveAttribute('src', config.sdkUrl)
    script?.dispatchEvent(new Event('load'))
    await Promise.all([first, second])

    expect(document.querySelectorAll('[data-sinoform-customer-service]')).toHaveLength(1)
    expect(initialize).toHaveBeenCalledTimes(1)
    adapter.open()
    adapter.close()
    adapter.identify({ id: 'visitor-1' })
    adapter.setContext({ ...context, pathname: '/quality' })
    adapter.destroy()
    expect(client.open).toHaveBeenCalledOnce()
    expect(client.close).toHaveBeenCalledOnce()
    expect(client.identify).toHaveBeenCalledWith({ id: 'visitor-1' })
    expect(client.setContext).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/quality' }))
    expect(client.destroy).toHaveBeenCalledOnce()
  })

  it('rejects initialization when the script fails', async () => {
    const adapter = createScriptCustomerServiceAdapter(document, window)
    const pending = adapter.init({ ...config, globalName: 'MissingSupport' }, context)
    document.querySelector<HTMLScriptElement>('[data-sinoform-customer-service]')
      ?.dispatchEvent(new Event('error'))
    await expect(pending).rejects.toThrow('Customer service SDK failed to load')
  })
})
