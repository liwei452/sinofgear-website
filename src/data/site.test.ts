import { expect, it } from 'vitest'
import { siteConfig } from './site'

it('keeps email contact details in one configuration without public phone numbers', () => {
  expect(siteConfig).toMatchObject({
    email: 'wei.li@sinofgears.com',
    businessContact: 'Chen Shouyu',
  })
  expect(siteConfig).not.toHaveProperty('rfqEmail')
  expect(siteConfig).not.toHaveProperty('phone')
  expect(siteConfig).not.toHaveProperty('phones')
  expect(siteConfig).not.toHaveProperty('mobile')
  expect(siteConfig.address).toContain('Huanghua Comprehensive Bonded Zone')
})
