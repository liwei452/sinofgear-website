import { describe, expect, it } from 'vitest'
import { companyFacts, companyGallery } from './company'

describe('verified company evidence', () => {
  it('publishes the approved facility facts', () => {
    expect(companyFacts).toMatchObject({
      founded: '2008',
      facilityArea: 'Approximately 7,000 square meters',
      gearWorkshopArea: 'Approximately 4,000 square meters',
      beltWorkshopArea: 'Approximately 2,500 square meters',
    })
  })

  it('uses approved local factory evidence', () => {
    expect(companyGallery).toHaveLength(4)
    expect(companyGallery.every(({ src }) => src.startsWith('/assets/factory-'))).toBe(true)
    expect(companyGallery.every(({ alt }) => alt.length > 20)).toBe(true)
  })
})
