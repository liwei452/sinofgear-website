import type {
  ContactUsFields,
  ContactUsSubmissionResult,
  ContactUsSubmitOptions,
  CustomerServiceAdapter,
  CustomerServiceComponent,
} from './types'

interface EmbedHandle {
  readonly status: 'ready' | 'degraded'
  open(component: CustomerServiceComponent): void
  submitContactUs(
    fields: ContactUsFields,
    options?: ContactUsSubmitOptions,
  ): Promise<ContactUsSubmissionResult>
  destroy(): void
}

interface EmbedModule {
  init(options: {
    siteKey: string
    endpoint: string
    locale: string
    renderedComponents: readonly CustomerServiceComponent[]
  }): Promise<EmbedHandle>
}

export type CustomerServiceModuleLoader = (url: string) => Promise<EmbedModule>

const loadRemoteModule: CustomerServiceModuleLoader = async (url) => {
  return import(/* @vite-ignore */ url) as Promise<EmbedModule>
}

export function createModuleCustomerServiceAdapter(
  loadModule: CustomerServiceModuleLoader = loadRemoteModule,
): CustomerServiceAdapter {
  let handle: EmbedHandle | null = null
  let initialization: Promise<void> | null = null
  let destroyTimer: number | undefined
  let destroyWhenReady = false

  return {
    init: (config) => {
      if (destroyTimer !== undefined) {
        globalThis.clearTimeout(destroyTimer)
        destroyTimer = undefined
      }
      destroyWhenReady = false
      if (initialization) return initialization

      initialization = (async () => {
        try {
          const sdk = await loadModule(config.sdkUrl)
          const nextHandle = await sdk.init({
            siteKey: config.siteKey,
            endpoint: config.endpoint,
            locale: config.locale,
            renderedComponents: ['agent_chat'],
          })
          if (destroyWhenReady) {
            nextHandle.destroy()
            initialization = null
            return
          }
          if (nextHandle.status !== 'ready') {
            nextHandle.destroy()
            throw new Error('Customer service SDK is unavailable')
          }
          handle = nextHandle
        } catch (error) {
          initialization = null
          throw error
        }
      })()

      return initialization
    },
    open: () => handle?.open('agent_chat'),
    submitContactUs: async (fields, options) => {
      if (!handle && initialization) await initialization
      if (!handle) throw new Error('Customer service SDK is unavailable')
      return handle.submitContactUs(fields, options)
    },
    destroy: () => {
      if (destroyTimer !== undefined) return
      destroyTimer = globalThis.setTimeout(() => {
        destroyTimer = undefined
        if (handle) {
          handle.destroy()
          handle = null
          initialization = null
          return
        }
        if (initialization) {
          destroyWhenReady = true
        }
      }, 0)
    },
  }
}
