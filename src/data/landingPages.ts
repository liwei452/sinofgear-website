export const industrySlugs = [
  'mining',
  'cement',
  'packaging',
  'agriculture',
  'automation',
  'material_handling',
  'pumps',
  'industrial_machinery',
  'gearbox_repair',
  'mro',
] as const

export const needSlugs = [
  'custom-gears',
  'replacement-gears',
  'reverse-engineering-gears',
] as const

export type IndustrySlug = (typeof industrySlugs)[number]
export type NeedSlug = (typeof needSlugs)[number]

export const industries: Record<IndustrySlug, { label: string; description: string }> = {
  mining: {
    label: 'Mining',
    description:
      'Gears and drives for crushers, mills, conveyors, and hoists operating in dusty, high-load conditions.',
  },
  cement: {
    label: 'Cement',
    description:
      'Heavy-duty gearing for kilns, mills, and material handling in continuous cement production.',
  },
  packaging: {
    label: 'Packaging Machinery',
    description:
      'Precision gears for filling, sealing, wrapping, and conveying lines that need repeatable motion.',
  },
  agriculture: {
    label: 'Agricultural Machinery',
    description:
      'Robust gears and shafts for harvesters, tractors, and processing equipment in demanding field conditions.',
  },
  automation: {
    label: 'Automation Equipment',
    description:
      'Tight-tolerance gears and actuators for robotics, indexing, and servo-driven automation.',
  },
  material_handling: {
    label: 'Material Handling',
    description:
      'Gears for conveyors, hoists, and logistics equipment that run continuously and must resist wear.',
  },
  pumps: {
    label: 'Pumps & Actuators',
    description:
      'Gearing for pumps, gearboxes, and hydraulic systems requiring reliable torque transfer.',
  },
  industrial_machinery: {
    label: 'Industrial Machinery',
    description:
      'Application-specific gears for general industrial machines built around your drawings and duty cycle.',
  },
  gearbox_repair: {
    label: 'Gearbox Repair',
    description:
      'Replacement and reverse-engineered gears that keep gearboxes and drives back in service quickly.',
  },
  mro: {
    label: 'MRO / Maintenance',
    description:
      'Spare and replacement gears for planned shutdowns, overhauls, and ongoing maintenance.',
  },
}

export const needs: Record<NeedSlug, { label: string; description: string }> = {
  'custom-gears': {
    label: 'Custom Gears',
    description:
      'Gears produced to your drawing, material, accuracy, and heat-treatment requirements.',
  },
  'replacement-gears': {
    label: 'Replacement Gears',
    description:
      'Replace worn or broken gears using a drawing, sample, or the surrounding application.',
  },
  'reverse-engineering-gears': {
    label: 'Reverse Engineering Gears',
    description:
      'Reverse-engineer a damaged gear or shaft when drawings are unavailable.',
  },
}

export const needProducts: Record<NeedSlug, string[]> = {
  'custom-gears': ['spur-gears', 'helical-gears', 'bevel-gears', 'worm-gears', 'gear-racks'],
  'replacement-gears': ['spur-gears', 'helical-gears', 'bevel-gears', 'worm-gears'],
  'reverse-engineering-gears': ['spur-gears', 'helical-gears', 'custom-gears'],
}

export function isIndustrySlug(value: string | undefined): value is IndustrySlug {
  return Boolean(value && (industrySlugs as readonly string[]).includes(value))
}

export function isNeedSlug(value: string | undefined): value is NeedSlug {
  return Boolean(value && (needSlugs as readonly string[]).includes(value))
}

export function landingTitle(industry: IndustrySlug, need: NeedSlug): string {
  return `${needs[need].label} for ${industries[industry].label}`
}
