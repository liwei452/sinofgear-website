import { describe, expect, it } from 'vitest'
import { localizeProduct, products } from './products'

describe('product configuration', () => {
  it('defines the complete requested product routes', () => {
    expect(products.map((product) => product.slug)).toEqual([
      'spur-gears',
      'helical-gears',
      'bevel-gears',
      'worm-gears',
      'timing-pulleys',
      'gear-racks',
      'custom-gears',
      'rubber-timing-belts',
      'polyurethane-timing-belts',
      'conveyor-belts',
      'flat-belts',
      'round-belts',
    ])
  })

  it('defines the approved worm gear sourcing page', () => {
    const product = products.find(({ slug }) => slug === 'worm-gears')
    expect(product?.seo.title).toContain('Worm Gears')
    expect(product?.seo.description.length).toBeGreaterThanOrEqual(80)
    expect(product?.seo.description.length).toBeLessThanOrEqual(165)
    expect(product?.faq).toHaveLength(2)
  })

  it('provides every field required by the shared detail template', () => {
    for (const product of products) {
      expect(product.name).toBeTruthy()
      expect(product.valueProposition).toBeTruthy()
      expect(product.image).toMatch(/^\/assets\//)
      expect(product.features.length).toBeGreaterThan(0)
      expect(product.materials.length).toBeGreaterThan(0)
      expect(product.precision).toBeTruthy()
      expect(product.customization.length).toBeGreaterThan(0)
      expect(product.industries.length).toBeGreaterThan(0)
      expect(product.inspection.length).toBeGreaterThan(0)
      expect(product.faq.length).toBeGreaterThan(0)
      expect(product.seo.title).toBeTruthy()
      expect(product.seo.description).toBeTruthy()
    }
  })

  it('provides localized names and value propositions for every supported locale', () => {
    for (const product of products) {
      for (const lang of ['de', 'ja', 'es', 'zh'] as const) {
        const localized = localizeProduct(product, lang)
        expect(localized.name).not.toBe(product.name)
        expect(localized.shortName).not.toBe(product.shortName)
        expect(localized.valueProposition).not.toBe(product.valueProposition)
      }
    }
  })
})
