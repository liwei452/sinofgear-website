import type {
  CustomerServiceAdapter,
  CustomerServiceConfig,
  CustomerServiceContext,
  CustomerServiceVisitor,
} from './types'

interface InternalSdkClient {
  open?: () => void
  close?: () => void
  identify?: (visitor: CustomerServiceVisitor) => void
  setContext?: (context: CustomerServiceContext) => void
  destroy?: () => void
}

interface InternalSdkGlobal {
  init: (options: { appId: string; context: CustomerServiceContext }) =>
    InternalSdkClient | Promise<InternalSdkClient>
}

const SCRIPT_SELECTOR = 'script[data-sinoform-customer-service]'

export function createScriptCustomerServiceAdapter(
  targetDocument: Document,
  targetWindow: Window,
): CustomerServiceAdapter {
  let client: InternalSdkClient | null = null
  let initialization: Promise<void> | null = null

  const init = (config: CustomerServiceConfig, context: CustomerServiceContext) => {
    if (initialization) return initialization

    initialization = new Promise<void>((resolve, reject) => {
      const existing = targetDocument.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR)
      const script = existing ?? targetDocument.createElement('script')

      const initializeClient = async () => {
        try {
          const sdk = (targetWindow as unknown as Record<string, unknown>)[config.globalName]
          if (!sdk || typeof (sdk as InternalSdkGlobal).init !== 'function') {
            throw new Error('Customer service SDK global is unavailable')
          }
          client = await (sdk as InternalSdkGlobal).init({ appId: config.appId, context })
          resolve()
        } catch (error) {
          initialization = null
          reject(error)
        }
      }

      const handleError = () => {
        initialization = null
        reject(new Error('Customer service SDK failed to load'))
      }

      script.addEventListener('load', initializeClient, { once: true })
      script.addEventListener('error', handleError, { once: true })

      if (!existing) {
        script.src = config.sdkUrl
        script.async = true
        script.dataset.sinoformCustomerService = 'true'
        targetDocument.head.appendChild(script)
      }
    })

    return initialization
  }

  return {
    init,
    open: () => client?.open?.(),
    close: () => client?.close?.(),
    identify: (visitor) => client?.identify?.(visitor),
    setContext: (context) => client?.setContext?.(context),
    destroy: () => {
      client?.destroy?.()
      client = null
      initialization = null
      targetDocument.querySelector(SCRIPT_SELECTOR)?.remove()
    },
  }
}
