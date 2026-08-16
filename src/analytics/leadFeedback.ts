export function sendLeadVisit(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  fetch('/api/lead-visits', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined)
}

export function sendInboundRfq(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  fetch('/api/inbound-rfq', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => undefined)
}
