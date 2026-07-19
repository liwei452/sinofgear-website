import { describe, expect, it } from 'vitest'
import { products } from './products'

describe('product configuration', () => {
  it('defines the six requested product routes', () => {
    expect(products.map((product) => product.slug)).toEqual([
      'spur-gears',
      'helical-gears',
      'bevel-gears',
      'timing-pulleys',
      'gear-racks',
      'custom-gears',
    ])
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
})
