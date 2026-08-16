export interface LeadAttribution {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  leadId: string | null
}

export function parseLeadAttribution(search: string): LeadAttribution {
  const params = new URLSearchParams(search)
  return {
    utmSource: params.get('utm_source') ?? '',
    utmMedium: params.get('utm_medium') ?? '',
    utmCampaign: params.get('utm_campaign') ?? '',
    leadId: params.get('lead_id'),
  }
}
