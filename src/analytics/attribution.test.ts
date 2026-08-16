import { expect, it } from 'vitest'
import { parseLeadAttribution } from './attribution'

it('parses utm parameters and lead id from a tracked link', () => {
  const attribution = parseLeadAttribution(
    '?utm_source=google_maps&utm_medium=email&utm_campaign=south_africa_mining&lead_id=lead-123',
  )
  expect(attribution).toEqual({
    utmSource: 'google_maps',
    utmMedium: 'email',
    utmCampaign: 'south_africa_mining',
    leadId: 'lead-123',
  })
})

it('returns null lead id when not present', () => {
  expect(parseLeadAttribution('').leadId).toBeNull()
})
