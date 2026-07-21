import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router'
import { getProductBySlug, localizeProduct } from '@/data/products'
import { useLang } from '@/i18n/LanguageContext'
import { readCustomerServiceConfig } from './config'
import { buildCustomerServiceContext } from './context'
import { createScriptCustomerServiceAdapter } from './scriptAdapter'
import type {
  CustomerServiceAdapter,
  CustomerServiceConfig,
  CustomerServiceVisitor,
} from './types'

export type CustomerServiceStatus = 'disabled' | 'loading' | 'ready' | 'error'

interface CustomerServiceValue {
  status: CustomerServiceStatus
  open: () => void
  close: () => void
  identify: (visitor: CustomerServiceVisitor) => void
}

const CustomerServiceContext = createContext<CustomerServiceValue>({
  status: 'disabled',
  open: () => {},
  close: () => {},
  identify: () => {},
})

const configuredService = readCustomerServiceConfig(import.meta.env)
const browserAdapter = createScriptCustomerServiceAdapter(document, window)

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
  const location = useLocation()
  const { lang } = useLang()
  const [status, setStatus] = useState<CustomerServiceStatus>(config ? 'loading' : 'disabled')

  const serviceContext = useMemo(() => {
    const slug = location.pathname.startsWith('/products/')
      ? location.pathname.slice('/products/'.length)
      : undefined
    const sourceProduct = getProductBySlug(slug)
    const product = sourceProduct ? localizeProduct(sourceProduct, lang) : undefined

    return buildCustomerServiceContext(
      {
        pathname: location.pathname,
        search: location.search,
        href: new URL(`${location.pathname}${location.search}`, window.location.origin).href,
        referrer: document.referrer,
      },
      lang,
      product ? { slug: product.slug, name: product.name } : undefined,
    )
  }, [lang, location.pathname, location.search])
  const initialContextRef = useRef(serviceContext)

  useEffect(() => {
    if (!config) return

    let active = true
    void adapter.init(config, initialContextRef.current).then(
      () => active && setStatus('ready'),
      () => active && setStatus('error'),
    )

    return () => {
      active = false
      adapter.destroy()
    }
  }, [adapter, config])

  useEffect(() => {
    if (config) adapter.setContext(serviceContext)
  }, [adapter, config, serviceContext])

  const effectiveStatus = config ? status : 'disabled'

  return (
    <CustomerServiceContext.Provider
      value={{
        status: effectiveStatus,
        open: () => effectiveStatus === 'ready' && adapter.open(),
        close: () => effectiveStatus === 'ready' && adapter.close(),
        identify: (visitor) => effectiveStatus === 'ready' && adapter.identify(visitor),
      }}
    >
      {children}
    </CustomerServiceContext.Provider>
  )
}

export const useCustomerService = () => useContext(CustomerServiceContext)
