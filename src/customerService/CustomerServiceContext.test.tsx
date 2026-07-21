import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { CustomerServiceProvider, useCustomerService } from './CustomerServiceContext'
import type { CustomerServiceAdapter, CustomerServiceConfig } from './types'

const config: CustomerServiceConfig = {
  sdkUrl: 'https://cdn.example.com/sdk.js',
  appId: 'public-app-id',
  globalName: 'SinoformSupport',
}

function Probe() {
  const service = useCustomerService()
  return <output aria-label="customer-service-status">{service.status}</output>
}

function adapter(overrides: Partial<CustomerServiceAdapter> = {}): CustomerServiceAdapter {
  return {
    init: vi.fn().mockResolvedValue(undefined),
    open: vi.fn(), close: vi.fn(), identify: vi.fn(), setContext: vi.fn(), destroy: vi.fn(),
    ...overrides,
  }
}

function renderProvider(serviceAdapter: CustomerServiceAdapter, serviceConfig: CustomerServiceConfig | null) {
  return render(
    <MemoryRouter initialEntries={['/products/spur-gears?utm_source=google']}>
      <LanguageProvider detectCountry={() => Promise.resolve(undefined)}>
        <CustomerServiceProvider adapter={serviceAdapter} config={serviceConfig}>
          <Probe />
        </CustomerServiceProvider>
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('CustomerServiceProvider', () => {
  it('renders children without initializing when disabled', () => {
    const serviceAdapter = adapter()
    renderProvider(serviceAdapter, null)
    expect(screen.getByLabelText('customer-service-status')).toHaveTextContent('disabled')
    expect(serviceAdapter.init).not.toHaveBeenCalled()
  })

  it('becomes ready and supplies localized product context', async () => {
    const serviceAdapter = adapter()
    renderProvider(serviceAdapter, config)
    await waitFor(() => expect(screen.getByLabelText('customer-service-status')).toHaveTextContent('ready'))
    expect(serviceAdapter.init).toHaveBeenCalledWith(config, expect.objectContaining({
      pathname: '/products/spur-gears',
      productSlug: 'spur-gears',
      productName: 'Custom Spur Gears',
      campaign: { source: 'google' },
    }))
  })

  it('contains initialization failures and still renders children', async () => {
    const serviceAdapter = adapter({ init: vi.fn().mockRejectedValue(new Error('offline')) })
    renderProvider(serviceAdapter, config)
    await waitFor(() => expect(screen.getByLabelText('customer-service-status')).toHaveTextContent('error'))
  })
})
