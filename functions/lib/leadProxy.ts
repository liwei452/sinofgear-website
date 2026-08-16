export interface LeadBackendEnv {
  LEAD_BACKEND_URL?: string
  LEAD_WEBHOOK_SECRET?: string
}

export function backendConfigured(env: LeadBackendEnv): boolean {
  return Boolean(env.LEAD_BACKEND_URL?.trim())
}

export async function forwardToLeadBackend(
  path: string,
  body: unknown,
  env: LeadBackendEnv,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const base = env.LEAD_BACKEND_URL?.trim().replace(/\/+$/, '')
  if (!base) {
    return Response.json(
      { accepted: false, reason: 'backend_not_configured' },
      { status: 200 },
    )
  }
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  }
  const secret = env.LEAD_WEBHOOK_SECRET?.trim()
  if (secret) headers['X-Lead-Visit-Secret'] = secret
  try {
    return await fetcher(`${base}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  } catch {
    return Response.json(
      { accepted: false, reason: 'backend_unreachable' },
      { status: 502 },
    )
  }
}
