import { describe, expect, it } from 'vitest'
import { productSlugs } from './products'
import { productFamilies, productsForFamily } from './productFamilies'

describe('product families', () => {
  it('places every public product in exactly one buyer-facing family', () => {
    const groupedSlugs = productFamilies.flatMap((family) => family.productSlugs)

    expect(groupedSlugs).toHaveLength(productSlugs.length)
    expect(new Set(groupedSlugs).size).toBe(productSlugs.length)
    expect([...groupedSlugs].sort()).toEqual([...productSlugs].sort())
  })

  it('leads with custom gears and resolves its products in the declared order', () => {
    expect(productFamilies[0]?.id).toBe('custom-gears')
    expect(productsForFamily('custom-gears').map((product) => product.slug)).toEqual([
      'spur-gears',
      'helical-gears',
      'bevel-gears',
      'worm-gears',
      'gear-racks',
      'custom-gears',
    ])
  })
})
