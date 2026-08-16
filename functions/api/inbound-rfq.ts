import { forwardToLeadBackend, type LeadBackendEnv } from '../lib/leadProxy'

export async function handleInboundRfqRequest(context: {
  request: Request
  env: LeadBackendEnv
}): Promise<Response> {
  if (context.request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed.' },
      { status: 405, headers: { allow: 'POST' } },
    )
  }
  const body = await context.request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Invalid payload.' }, { status: 400 })
  }
  return forwardToLeadBackend('/api/v1/growth/inbound-rfq', body, context.env)
}

export const onRequest = (context: { request: Request; env: LeadBackendEnv }) =>
  handleInboundRfqRequest(context)
