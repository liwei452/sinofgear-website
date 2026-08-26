import { productFamilies, productsForFamily } from './productFamilies'

export interface NavigationLink {
  label: string
  href: string
  description?: string
}

export interface NavigationGroup {
  label: string
  description?: string
  links: readonly NavigationLink[]
}

export const productNavigationGroups: readonly NavigationGroup[] = productFamilies.map((family) => ({
  label: family.name,
  description: family.description,
  links: productsForFamily(family.id).map((product) => ({
    label: product.shortName,
    href: `/products/${product.slug}`,
  })),
}))

export const applicationNavigationGroups: readonly NavigationGroup[] = [
  {
    label: 'Project need',
    links: [
      {
        label: 'New custom gear project',
        href: '/industries/industrial_machinery/custom-gears',
        description: 'Build from a controlled drawing and defined duty.',
      },
      {
        label: 'Replacement gear',
        href: '/industries/gearbox_repair/replacement-gears',
        description: 'Review a worn or damaged component and its assembly context.',
      },
      {
        label: 'Reverse-engineering review',
        href: '/industries/mro/reverse-engineering-gears',
        description: 'Assess a sample and available operating information.',
      },
    ],
  },
  {
    label: 'Operating environment',
    links: [
      { label: 'Industrial machinery', href: '/industries/industrial_machinery/custom-gears' },
      { label: 'Automation equipment', href: '/industries/automation/custom-gears' },
      { label: 'Material handling', href: '/industries/material_handling/custom-gears' },
      { label: 'Mining', href: '/industries/mining/replacement-gears' },
      { label: 'Cement', href: '/industries/cement/replacement-gears' },
      { label: 'MRO and maintenance', href: '/industries/mro/replacement-gears' },
    ],
  },
] as const

export const primaryNavigation = [
  { label: 'Products', href: '/products', menu: 'products' },
  { label: 'Applications', href: '/industries/industrial_machinery/custom-gears', menu: 'applications' },
  { label: 'Manufacturing', href: '/capabilities' },
  { label: 'Quality', href: '/quality' },
  { label: 'Resources', href: '/blog' },
  { label: 'Company', href: '/about' },
] as const
