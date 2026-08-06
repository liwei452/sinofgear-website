import { expect, it } from 'vitest'
import { siteConfig } from './site'

it('keeps export contact details in one configuration', () => {
  expect(siteConfig).toMatchObject({
    rfqEmail: 'inquiries@sinfogear.com',
    email: 'info@sinof.net',
    businessContact: 'Chen Shouyu',
    mobile: '+86 159 7312 7000',
  })
  expect(siteConfig.phones).toContain('+86 731 8888 4918')
  expect(siteConfig.address).toContain('Huanghua Comprehensive Bonded Zone')
})
