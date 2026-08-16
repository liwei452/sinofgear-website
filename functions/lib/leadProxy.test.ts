import { expect, it, vi } from 'vitest'
import { backendConfigured, forwardToLeadBackend } from './leadProxy'

it('reports backend_not_configured when no URL is set', async () => {
  const response = await forwardToLeadBackend(
    '/api/v1/growth/lead-visits',
    { lead_id: 'lead-1' },
    {},
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ accepted: false, reason: 'backend_not_configured' })
})

it('forwards json body and webhook secret to the backend', async () => {
  const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
    return new Response(JSON.stringify({ accepted: true }), { status: 200 })
  })
  const response = await forwardToLeadBackend(
    '/api/v1/growth/lead-visits',
    { lead_id: 'lead-1', path: '/replacement-gears/' },
    { LEAD_BACKEND_URL: 'https://lead.example', LEAD_WEBHOOK_SECRET: 'secret' },
    fetcher,
  )
  expect(response.status).toBe(200)
  const [url, init] = fetcher.mock.calls[0]
  expect(url).toBe('https://lead.example/api/v1/growth/lead-visits')
  expect((init?.headers as Record<string, string>)['X-Lead-Visit-Secret']).toBe('secret')
  expect(init?.body).toBe(JSON.stringify({ lead_id: 'lead-1', path: '/replacement-gears/' }))
})

it('detects configured backend', () => {
  expect(backendConfigured({ LEAD_BACKEND_URL: 'https://lead.example' })).toBe(true)
  expect(backendConfigured({})).toBe(false)
})
