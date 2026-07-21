import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('presents an accessible internal login form', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter><LoginPage /></MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: '登录工作台' })).toBeInTheDocument()
    expect(screen.getByLabelText('邮箱')).toBeRequired()
    expect(screen.getByLabelText('密码')).toBeRequired()
    expect(screen.getByRole('button', { name: '登录' })).toBeEnabled()
  })
})
