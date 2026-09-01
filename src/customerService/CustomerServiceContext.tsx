import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Loader2, MessageCircle } from 'lucide-react'
import { useLang } from '@/i18n/LanguageContext'
import { readCustomerServiceConfig } from './config'
import { createModuleCustomerServiceAdapter } from './moduleAdapter'
import type {
  ContactUsSubmitter,
  CustomerServiceAdapter,
  CustomerServiceConfig,
} from './types'

export type CustomerServiceStatus = 'disabled' | 'idle' | 'loading' | 'ready' | 'error'

interface CustomerServiceValue {
  status: CustomerServiceStatus
  open: () => void
  submitContactUs: ContactUsSubmitter
}

const CustomerServiceContext = createContext<CustomerServiceValue>({
  status: 'disabled',
  open: () => {},
  submitContactUs: async () => null,
})

const configuredService = readCustomerServiceConfig(import.meta.env)
const browserAdapter = createModuleCustomerServiceAdapter()

interface CustomerServiceProviderProps {
  children: ReactNode
  config?: CustomerServiceConfig | null
  adapter?: CustomerServiceAdapter
}

export function CustomerServiceProvider({
  children,
  config = configuredService,
  adapter = browserAdapter,
}: CustomerServiceProviderProps) {
  const { text } = useLang()
  const [status, setStatus] = useState<CustomerServiceStatus>(config ? 'idle' : 'disabled')
  const mountedRef = useRef(true)
  const startedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (startedRef.current) adapter.destroy()
    }
  }, [adapter])

  const ensureInitialized = useCallback(async () => {
    if (!config) throw new Error('Customer service is disabled')

    startedRef.current = true
    if (mountedRef.current) {
      setStatus((current) => current === 'ready' ? current : 'loading')
    }
    try {
      await adapter.init(config)
      if (mountedRef.current) setStatus('ready')
    } catch (error) {
      if (mountedRef.current) setStatus('error')
      throw error
    }
  }, [adapter, config])

  const effectiveStatus = config ? status : 'disabled'
  const open = useCallback(() => {
    void ensureInitialized().then(() => adapter.open()).catch(() => {})
  }, [adapter, ensureInitialized])
  const submitContactUs: ContactUsSubmitter = useCallback(async (fields, options) => {
    if (!config) return null
    await ensureInitialized()
    return adapter.submitContactUs(fields, options)
  }, [adapter, config, ensureInitialized])

  return (
    <CustomerServiceContext.Provider
      value={{
        status: effectiveStatus,
        open,
        submitContactUs,
      }}
    >
      {children}
      {config && effectiveStatus !== 'ready' && (
        <button
          id="open-inquiry-assistant"
          type="button"
          aria-label={text('Open inquiry assistant')}
          disabled={effectiveStatus === 'loading'}
          onClick={open}
          className="fixed bottom-20 right-4 z-40 flex min-h-12 max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-primary bg-primary px-4 py-3 font-semibold text-white shadow-[0_16px_38px_-16px_hsl(var(--primary)/.85)] transition duration-200 hover:-translate-y-0.5 hover:bg-[hsl(209_100%_31%)] disabled:cursor-wait disabled:opacity-70 sm:bottom-24 sm:right-6"
        >
          {effectiveStatus === 'loading'
            ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            : <MessageCircle className="h-5 w-5" aria-hidden="true" />}
          <span className="text-sm">
            {text(effectiveStatus === 'loading' ? 'Opening inquiry assistant...' : 'Inquiry assistant')}
          </span>
        </button>
      )}
    </CustomerServiceContext.Provider>
  )
}

export const useCustomerService = () => useContext(CustomerServiceContext)
