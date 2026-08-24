import { describe, expect, it, vi } from 'vitest'
import { handleDomainRedirect } from './_middleware'

function context(url: string, method = 'GET') {
  const next = vi.fn(async () => new Response('next', { status: 200 }))
  return {
    context: { request: new Request(url, { method }), next },
    next,
  }
}

describe('canonical domain middleware', () => {
  it.each(['sinfogear.com', 'www.sinfogear.com', 'www.sinofgears.com'])(
    'redirects %s to the canonical apex while preserving path and query',
    async (host) => {
      const testContext = context(`https://${host}/products/spur-gears?utm_source=legacy`)

      const response = await handleDomainRedirect(testContext.context)

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe(
        'https://sinofgears.com/products/spur-gears?utm_source=legacy',
      )
      expect(testContext.next).not.toHaveBeenCalled()
    },
  )

  it('uses a method-preserving redirect for non-GET requests', async () => {
    const testContext = context('https://sinfogear.com/api/inquiries', 'POST')

    const response = await handleDomainRedirect(testContext.context)

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://sinofgears.com/api/inquiries')
  })

  it.each(['sinofgears.com', 'sinoform.pages.dev'])(
    'continues normally on %s',
    async (host) => {
      const testContext = context(`https://${host}/contact`)

      const response = await handleDomainRedirect(testContext.context)

      expect(response.status).toBe(200)
      expect(await response.text()).toBe('next')
      expect(testContext.next).toHaveBeenCalledOnce()
    },
  )
})
