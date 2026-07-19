import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { submitInquiry } from '@/services/inquiryApi'
import ContactPage from './ContactPage'

async function completeRequiredFields() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/name/i), 'Alex Morgan')
  await user.type(screen.getByLabelText(/company/i), 'Northstar Motion')
  await user.type(screen.getByLabelText(/email/i), 'alex@example.com')
  await user.selectOptions(screen.getByLabelText(/country/i), 'Germany')
  await user.type(screen.getByLabelText(/message/i), 'Please review this gear for our packaging line.')
  return user
}

describe('contact page inquiry flow', () => {
  it('prefills a product from the URL and shows success after valid submission', async () => {
    render(
      <MemoryRouter initialEntries={['/contact?product=helical-gears']}>
        <ContactPage submitter={(values) => submitInquiry(values, { delayMs: 0 })} />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/product/i)).toHaveValue('helical-gears')
    const user = await completeRequiredFields()
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(await screen.findByRole('heading', { name: 'Inquiry received' })).toBeInTheDocument()
    expect(screen.getByText(/SF-/)).toBeInTheDocument()
  })

  it('shows a retry action when the mock service fails', async () => {
    render(
      <MemoryRouter initialEntries={['/contact?product=spur-gears']}>
        <ContactPage
          submitter={(values) => submitInquiry(values, { delayMs: 0, forceFailure: true })}
        />
      </MemoryRouter>,
    )

    const user = await completeRequiredFields()
    await user.click(screen.getByRole('button', { name: /submit inquiry/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not submit your inquiry. Please try again.',
    )
    expect(screen.getByRole('button', { name: /retry submission/i })).toBeInTheDocument()
  })
})
