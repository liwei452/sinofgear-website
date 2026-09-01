import { describe, expect, it, vi } from 'vitest'
import { createModuleCustomerServiceAdapter } from './moduleAdapter'
import type { CustomerServiceConfig } from './types'

const config: CustomerServiceConfig = {
  sdkUrl: 'https://static.t.venorzom.com/loader.js',
  siteKey: 'pk_live_1234567890abcdef1234567890abcdef',
  endpoint: 'https://apigw.t.venorzom.com/',
  locale: 'en',
}

describe('module customer-service adapter', () => {
  it('loads and initializes the remote module only once, then reuses the handle', async () => {
    const handle = {
      status: 'ready' as const,
      open: vi.fn(),
      submitContactUs: vi.fn().mockResolvedValue({ accepted: true, created: true }),
      destroy: vi.fn(),
      on: vi.fn(),
    }
    const initialize = vi.fn().mockResolvedValue(handle)
    const loadModule = vi.fn().mockResolvedValue({ init: initialize })
    const adapter = createModuleCustomerServiceAdapter(loadModule)

    await Promise.all([
      adapter.init(config),
      adapter.init(config),
    ])

    expect(loadModule).toHaveBeenCalledTimes(1)
    expect(loadModule).toHaveBeenCalledWith(config.sdkUrl)
    expect(initialize).toHaveBeenCalledTimes(1)
    expect(initialize).toHaveBeenCalledWith({
      siteKey: config.siteKey,
      endpoint: config.endpoint,
      locale: 'en',
      renderedComponents: ['agent_chat'],
    })

    adapter.open()
    await adapter.submitContactUs(
      { business_email: ['buyer@example.com'] },
      { pageURL: 'https://sinofgears.com/contact' },
    )

    expect(handle.open).toHaveBeenCalledWith('agent_chat')
    expect(handle.submitContactUs).toHaveBeenCalledWith(
      { business_email: ['buyer@example.com'] },
      { pageURL: 'https://sinofgears.com/contact' },
    )
  })

  it('rejects degraded initialization without breaking the host page', async () => {
    const adapter = createModuleCustomerServiceAdapter(vi.fn().mockResolvedValue({
      init: vi.fn().mockResolvedValue({
        status: 'degraded',
        open: vi.fn(),
        submitContactUs: vi.fn(),
        destroy: vi.fn(),
        on: vi.fn(),
      }),
    }))

    await expect(adapter.init(config)).rejects.toThrow('Customer service SDK is unavailable')
  })

  it('survives the immediate cleanup and setup cycle used by React StrictMode', async () => {
    let resolveHandle!: (value: {
      status: 'ready'
      open: ReturnType<typeof vi.fn>
      submitContactUs: ReturnType<typeof vi.fn>
      destroy: ReturnType<typeof vi.fn>
      on: ReturnType<typeof vi.fn>
    }) => void
    const pendingHandle = new Promise<Parameters<typeof resolveHandle>[0]>((resolve) => {
      resolveHandle = resolve
    })
    const handle = {
      status: 'ready' as const,
      open: vi.fn(),
      submitContactUs: vi.fn().mockResolvedValue({ accepted: true, created: true }),
      destroy: vi.fn(),
      on: vi.fn(),
    }
    const initialize = vi.fn().mockReturnValue(pendingHandle)
    const loadModule = vi.fn().mockResolvedValue({ init: initialize })
    const adapter = createModuleCustomerServiceAdapter(loadModule)

    const firstSetup = adapter.init(config)
    adapter.destroy()
    const secondSetup = adapter.init(config)
    resolveHandle(handle)
    await Promise.all([firstSetup, secondSetup])

    expect(loadModule).toHaveBeenCalledTimes(1)
    expect(initialize).toHaveBeenCalledTimes(1)
    expect(handle.destroy).not.toHaveBeenCalled()
    adapter.open()
    expect(handle.open).toHaveBeenCalledWith('agent_chat')
  })

  it('reuses a pending initialization after a delayed remount instead of overlapping requests', async () => {
    let resolveHandle!: (value: {
      status: 'ready'
      open: ReturnType<typeof vi.fn>
      submitContactUs: ReturnType<typeof vi.fn>
      destroy: ReturnType<typeof vi.fn>
    }) => void
    const pendingHandle = new Promise<Parameters<typeof resolveHandle>[0]>((resolve) => {
      resolveHandle = resolve
    })
    const handle = {
      status: 'ready' as const,
      open: vi.fn(),
      submitContactUs: vi.fn().mockResolvedValue({ accepted: true, created: true }),
      destroy: vi.fn(),
    }
    const initialize = vi.fn().mockReturnValue(pendingHandle)
    const loadModule = vi.fn().mockResolvedValue({ init: initialize })
    const adapter = createModuleCustomerServiceAdapter(loadModule)

    const firstSetup = adapter.init(config)
    adapter.destroy()
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0))
    const secondSetup = adapter.init(config)

    expect(secondSetup).toBe(firstSetup)
    expect(loadModule).toHaveBeenCalledTimes(1)
    resolveHandle(handle)
    await secondSetup
    adapter.open()
    expect(handle.destroy).not.toHaveBeenCalled()
    expect(handle.open).toHaveBeenCalledWith('agent_chat')
  })

  it('destroys a handle that becomes ready after a genuine unmount', async () => {
    let resolveHandle!: (value: {
      status: 'ready'
      open: ReturnType<typeof vi.fn>
      submitContactUs: ReturnType<typeof vi.fn>
      destroy: ReturnType<typeof vi.fn>
    }) => void
    const pendingHandle = new Promise<Parameters<typeof resolveHandle>[0]>((resolve) => {
      resolveHandle = resolve
    })
    const handle = {
      status: 'ready' as const,
      open: vi.fn(),
      submitContactUs: vi.fn(),
      destroy: vi.fn(),
    }
    const adapter = createModuleCustomerServiceAdapter(vi.fn().mockResolvedValue({
      init: vi.fn().mockReturnValue(pendingHandle),
    }))

    const setup = adapter.init(config)
    adapter.destroy()
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0))
    resolveHandle(handle)
    await setup

    expect(handle.destroy).toHaveBeenCalledTimes(1)
  })
})
