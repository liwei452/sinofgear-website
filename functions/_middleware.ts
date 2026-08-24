const CANONICAL_ORIGIN = 'https://sinofgears.com'
const REDIRECT_HOSTS = new Set([
  'sinfogear.com',
  'www.sinfogear.com',
  'www.sinofgears.com',
])

export interface DomainRedirectContext {
  request: Request
  next: () => Promise<Response>
}

export async function handleDomainRedirect(context: DomainRedirectContext) {
  const requestUrl = new URL(context.request.url)

  if (!REDIRECT_HOSTS.has(requestUrl.hostname.toLowerCase())) {
    return context.next()
  }

  const canonicalUrl = new URL(requestUrl.pathname + requestUrl.search, CANONICAL_ORIGIN)
  const status = context.request.method === 'GET' || context.request.method === 'HEAD' ? 301 : 308
  return Response.redirect(canonicalUrl, status)
}

export const onRequest = (context: DomainRedirectContext) => handleDomainRedirect(context)
