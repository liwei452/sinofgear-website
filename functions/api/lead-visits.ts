import { forwardToLeadBackend, type LeadBackendEnv } from '../lib/leadProxy'

export async function handleLeadVisitRequest(context: {
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
  return forwardToLeadBackend('/api/v1/growth/lead-visits', body, context.env)
}

export const onRequest = (context: { request: Request; env: LeadBackendEnv }) =>
  handleLeadVisitRequest(context)
