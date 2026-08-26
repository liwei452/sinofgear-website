import { products, type Product, type ProductSlug } from './products'

export type ProductFamilyId = 'custom-gears' | 'timing-drive' | 'industrial-belts'

export interface ProductFamily {
  id: ProductFamilyId
  name: string
  description: string
  image: string
  imageAlt: string
  productSlugs: readonly ProductSlug[]
}

export const productFamilies: readonly ProductFamily[] = [
  {
    id: 'custom-gears',
    name: 'Custom gears',
    description: 'Drawing-led gears and geared components for new designs, replacements, and matched assemblies.',
    image: '/assets/gear-helical.jpg',
    imageAlt: 'Close-up of a precision-machined helical gear',
    productSlugs: [
      'spur-gears',
      'helical-gears',
      'bevel-gears',
      'worm-gears',
      'gear-racks',
      'custom-gears',
    ],
  },
  {
    id: 'timing-drive',
    name: 'Timing-drive components',
    description: 'Pulleys and matched belt options reviewed around profile, load, positioning, and shaft interface.',
    image: '/assets/timing-pulleys.webp',
    imageAlt: 'Machined timing pulleys for synchronous belt drives',
    productSlugs: ['timing-pulleys', 'rubber-timing-belts', 'polyurethane-timing-belts'],
  },
  {
    id: 'industrial-belts',
    name: 'Industrial belts',
    description: 'Conveying and power-transmission belts selected around equipment, environment, and operating duty.',
    image: '/assets/conveyor-belts.webp',
    imageAlt: 'Industrial conveyor belt material and profiles',
    productSlugs: ['conveyor-belts', 'flat-belts', 'round-belts'],
  },
] as const

const productBySlug = new Map<ProductSlug, Product>(products.map((product) => [product.slug, product]))

export function productsForFamily(familyId: ProductFamilyId): Product[] {
  const family = productFamilies.find((candidate) => candidate.id === familyId)
  if (!family) return []

  return family.productSlugs.flatMap((slug) => {
    const product = productBySlug.get(slug)
    return product ? [product] : []
  })
}
