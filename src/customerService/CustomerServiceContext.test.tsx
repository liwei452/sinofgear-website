import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { CustomerServiceProvider, useCustomerService } from './CustomerServiceContext'
import type { CustomerServiceAdapter, CustomerServiceConfig } from './types'

const config: CustomerServiceConfig = {
  sdkUrl: 'https://static.t.venorzom.com/loader.js',
  siteKey: 'pk_live_1234567890abcdef1234567890abcdef',
  endpoint: 'https://apigw.t.venorzom.com/',
  locale: 'en',
}

function Probe() {
  const service = useCustomerService()
  return (
    <>
      <output aria-label="customer-service-status">{service.status}</output>
      <button type="button" onClick={service.open}>Probe open</button>
      <button
        type="button"
        onClick={() => void service.submitContactUs(
          { business_email: ['buyer@example.com'] },
          { pageURL: 'https://sinofgears.com/contact' },
        )}
      >
        Probe submit
      </button>
    </>
  )
}

function adapter(overrides: Partial<CustomerServiceAdapter> = {}): CustomerServiceAdapter {
  return {
    init: vi.fn().mockResolvedValue(undefined),
    open: vi.fn(),
    submitContactUs: vi.fn().mockResolvedValue({ accepted: true, created: true }),
    destroy: vi.fn(),
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

  it('stays idle until the visitor explicitly opens the inquiry assistant', async () => {
    const user = userEvent.setup()
    const serviceAdapter = adapter()
    renderProvider(serviceAdapter, config)

    expect(screen.getByLabelText('customer-service-status')).toHaveTextContent('idle')
    expect(serviceAdapter.init).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Open inquiry assistant' }))
    await waitFor(() => expect(screen.getByLabelText('customer-service-status')).toHaveTextContent('ready'))
    expect(serviceAdapter.init).toHaveBeenCalledWith(config)
    expect(serviceAdapter.open).toHaveBeenCalledTimes(1)
  })

  it('initializes on an explicit form submission before mirroring the contact', async () => {
    const user = userEvent.setup()
    const serviceAdapter = adapter()
    renderProvider(serviceAdapter, config)

    await user.click(screen.getByRole('button', { name: 'Probe submit' }))

    await waitFor(() => expect(serviceAdapter.submitContactUs).toHaveBeenCalledWith(
      { business_email: ['buyer@example.com'] },
      { pageURL: 'https://sinofgears.com/contact' },
    ))
    expect(serviceAdapter.init).toHaveBeenCalledWith(config)
  })

  it('contains initialization failures and keeps a retryable launcher', async () => {
    const user = userEvent.setup()
    const serviceAdapter = adapter({ init: vi.fn().mockRejectedValue(new Error('offline')) })
    renderProvider(serviceAdapter, config)

    await user.click(screen.getByRole('button', { name: 'Open inquiry assistant' }))
    await waitFor(() => expect(screen.getByLabelText('customer-service-status')).toHaveTextContent('error'))
    expect(screen.getByRole('button', { name: 'Open inquiry assistant' })).toBeEnabled()
  })
})
