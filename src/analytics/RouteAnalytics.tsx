import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { trackPageView } from './analytics'
import { parseLeadAttribution } from './attribution'

export default function RouteAnalytics() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`)
    const attribution = parseLeadAttribution(location.search)
    if (attribution.leadId && typeof window !== 'undefined') {
      window.dataLayer ??= []
      window.dataLayer.push({
        event: 'lead_visit',
        lead_id: attribution.leadId,
        utm_source: attribution.utmSource,
        utm_medium: attribution.utmMedium,
        utm_campaign: attribution.utmCampaign,
        page_path: location.pathname,
      })
    }
  }, [location.pathname, location.search])

  return null
}
