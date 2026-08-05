export const productSlugs = [
  'spur-gears',
  'helical-gears',
  'bevel-gears',
  'timing-pulleys',
  'gear-racks',
  'custom-gears',
  'rubber-timing-belts',
  'polyurethane-timing-belts',
  'conveyor-belts',
  'flat-belts',
  'round-belts',
] as const

export type ProductSlug = (typeof productSlugs)[number]

export interface ProductFaq {
  question: string
  answer: string
}

export interface ProductSeo {
  title: string
  description: string
}

export interface Product {
  slug: ProductSlug
  name: string
  shortName: string
  valueProposition: string
  description: string
  image: string
  imageAlt: string
  features: string[]
  materials: string[]
  precision: string
  customization: string[]
  industries: string[]
  inspection: string[]
  faq: ProductFaq[]
  seo: ProductSeo
}

export const products: Product[] = [
  {
    slug: 'spur-gears',
    name: 'Custom Spur Gears',
    shortName: 'Spur Gears',
    valueProposition: 'Straight-tooth gears engineered around your drawing, load case, and assembly requirements.',
    description:
      'SINOF reviews tooth geometry, material, heat treatment, bore features, and inspection needs before confirming a manufacturing route.',
    image: '/assets/gear-spur.jpg',
    imageAlt: 'Close-up of precision-machined spur gears',
    features: [
      'External and internal tooth concepts reviewed',
      'Hub, bore, keyway, spline, and set-screw options',
      'Prototype and production requirements evaluated separately',
      'Drawing-based tolerance and documentation review',
    ],
    materials: [
      'Carbon and alloy steels, subject to drawing review',
      'Stainless steel grades, subject to application review',
      'Brass, bronze, and engineering plastics where suitable',
    ],
    precision: 'Accuracy grade and measurable acceptance criteria are confirmed after drawing review.',
    customization: [
      'Module or diametral pitch',
      'Tooth count and pressure angle',
      'Bore, hub, keyway, and spline geometry',
      'Heat treatment and surface-finish requirements',
    ],
    industries: ['Industrial machinery', 'Automation equipment', 'Material handling', 'Pumps and actuators'],
    inspection: [
      'Dimensional verification against the released drawing',
      'Tooth profile, lead, pitch, and runout checks when specified',
      'Material and hardness documentation when agreed in the quotation',
    ],
    faq: [
      {
        question: 'What information is needed to quote a spur gear?',
        answer:
          'A drawing or 3D model is preferred. Please also share quantity, material preference, heat treatment, accuracy requirement, and the gear application.',
      },
      {
        question: 'Can SINOF review an existing gear sample?',
        answer:
          'A sample can support the engineering review, but a controlled drawing and agreed inspection criteria are still recommended before production.',
      },
    ],
    seo: {
      title: 'Custom Spur Gears Made to Drawing | SINOF',
      description:
        'Request custom spur gears engineered to your drawing, material, tooth geometry, inspection, and application requirements.',
    },
  },
  {
    slug: 'helical-gears',
    name: 'Custom Helical Gears',
    shortName: 'Helical Gears',
    valueProposition: 'Helical gear solutions reviewed for smooth meshing, load transfer, noise, and axial-force requirements.',
    description:
      'Each inquiry is evaluated around the mating gear, helix direction, operating conditions, material, finishing, and inspection plan.',
    image: '/assets/gear-helical.jpg',
    imageAlt: 'Machined helical gear teeth in close-up',
    features: [
      'Right-hand and left-hand helix configurations',
      'Matched gear-pair requirements reviewed together',
      'Bore, shaft, hub, and integrated pinion options',
      'Finishing route selected against drawing requirements',
    ],
    materials: [
      'Carbon and alloy steels, subject to drawing review',
      'Stainless steel grades for suitable environments',
      'Non-ferrous materials evaluated for the stated duty',
    ],
    precision: 'Target gear quality and inspection scope are confirmed from the drawing and operating requirements.',
    customization: [
      'Helix angle and hand',
      'Normal module or diametral pitch',
      'Profile modification and backlash targets',
      'Heat treatment, tooth finishing, and surface protection',
    ],
    industries: ['Gearboxes', 'Machine tools', 'Conveying systems', 'Automation and motion systems'],
    inspection: [
      'Drawing-based dimensional inspection',
      'Tooth profile and helix evaluation when specified',
      'Runout, backlash-related features, and hardness checks as agreed',
    ],
    faq: [
      {
        question: 'Should the mating helical gear be included in the inquiry?',
        answer:
          'Yes. Mating gear data helps review center distance, helix hand, backlash, contact behavior, and the inspection approach.',
      },
      {
        question: 'Can profile modifications be reviewed?',
        answer:
          'Profile and lead modifications can be evaluated when they are defined on the drawing or supported by the application requirements.',
      },
    ],
    seo: {
      title: 'Custom Helical Gears to Drawing | SINOF',
      description:
        'Source custom helical gears with drawing-led review of helix, material, finishing, mating conditions, and inspection requirements.',
    },
  },
  {
    slug: 'bevel-gears',
    name: 'Custom Bevel Gears',
    shortName: 'Bevel Gears',
    valueProposition: 'Bevel gear and mating-pair inquiries reviewed around shaft angle, ratio, contact pattern, and duty cycle.',
    description:
      'SINOF evaluates the complete geometry and application context before confirming whether a bevel gear project is suitable.',
    image: '/assets/gear-bevel.jpg',
    imageAlt: 'Metal bevel gear with angled teeth',
    features: [
      'Straight and spiral bevel concepts evaluated',
      'Matched crown-wheel and pinion data reviewed together',
      'Shaft-angle and mounting requirements considered',
      'Contact and acceptance criteria agreed before production',
    ],
    materials: [
      'Alloy and carbon steels selected against duty',
      'Stainless grades evaluated for environmental needs',
      'Alternative materials reviewed case by case',
    ],
    precision: 'Gear quality, contact requirements, and inspection method are confirmed after technical review.',
    customization: [
      'Ratio, shaft angle, and tooth geometry',
      'Bore, spline, hub, and mounting features',
      'Heat treatment and surface finishing',
      'Matched-pair marking and inspection documentation',
    ],
    industries: ['Right-angle drives', 'Industrial transmissions', 'Agricultural machinery', 'Automation equipment'],
    inspection: [
      'Critical dimensions checked against the released drawing',
      'Runout and mounting datum verification',
      'Tooth-contact or gear-geometry inspection when specified',
    ],
    faq: [
      {
        question: 'Do you need both members of a bevel gear pair?',
        answer:
          'Complete data for both mating members is strongly preferred because ratio, mounting distance, backlash, and contact behavior are interdependent.',
      },
      {
        question: 'Can an existing bevel gear be reproduced from a sample?',
        answer:
          'A sample can help a feasibility review, but production should be based on controlled geometry and mutually agreed acceptance criteria.',
      },
    ],
    seo: {
      title: 'Custom Bevel Gear Sets to Drawing | SINOF',
      description:
        'Discuss custom bevel gears and matched gear sets with drawing-led review of ratio, shaft angle, materials, contact, and inspection.',
    },
  },
  {
    slug: 'timing-pulleys',
    name: 'Custom Timing Pulleys',
    shortName: 'Timing Pulleys',
    valueProposition: 'Timing pulleys configured around belt profile, tooth count, shaft interface, load, and positioning needs.',
    description:
      'From a controlled drawing or belt-system specification, SINOF reviews pulley geometry and secondary machining requirements.',
    image: '/assets/timing-pulleys.webp',
    imageAlt: 'Machined metal timing pulleys in multiple sizes',
    features: [
      'Common metric and imperial belt profiles reviewed',
      'Pilot bore, finished bore, keyway, and clamp concepts',
      'Flange and hub configurations',
      'Weight-reduction and balancing requirements evaluated',
    ],
    materials: [
      'Aluminum alloys, subject to strength review',
      'Carbon and stainless steels',
      'Engineering plastics for suitable loads and environments',
    ],
    precision: 'Tooth profile, runout, bore, and concentricity requirements are confirmed from the drawing.',
    customization: [
      'Belt profile, pitch, tooth count, and pulley width',
      'Hub, flange, bore, keyway, and locking features',
      'Surface protection and appearance requirements',
      'Pulley-shaft assembly requirements',
    ],
    industries: ['Packaging equipment', 'Automation', 'Robotics', 'Printing and positioning systems'],
    inspection: [
      'Tooth-form and pitch-related checks as specified',
      'Bore, runout, and concentricity inspection',
      'Surface-finish and coating verification when required',
    ],
    faq: [
      {
        question: 'Which belt information should be provided?',
        answer:
          'Please provide the belt profile, pitch, width, tooth count, and any preferred belt manufacturer reference, together with shaft and load information.',
      },
      {
        question: 'Can custom bores and hubs be included?',
        answer:
          'Yes. Bore, keyway, clamp, hub, and flange details can be evaluated as part of the complete pulley drawing.',
      },
    ],
    seo: {
      title: 'Custom Timing Pulleys to Drawing | SINOF',
      description:
        'Request custom timing pulleys reviewed for belt profile, tooth count, bore, hub, flange, material, runout, and positioning needs.',
    },
  },
  {
    slug: 'gear-racks',
    name: 'Custom Gear Racks',
    shortName: 'Gear Racks',
    valueProposition: 'Gear racks developed for controlled linear motion, mounting, joining, lubrication, and load requirements.',
    description:
      'SINOF reviews rack and pinion data together where possible, including mounting datums, segment joints, and inspection criteria.',
    image: '/assets/gear-rack.jpg',
    imageAlt: 'Precision-machined straight gear rack',
    features: [
      'Straight and helical rack concepts evaluated',
      'Segmented rack and joint alignment requirements',
      'Mounting-hole, datum, and end-machining options',
      'Matched pinion requirements reviewed',
    ],
    materials: [
      'Carbon and alloy steels, subject to wear requirements',
      'Stainless steel for suitable environments',
      'Engineering plastics for suitable duty',
    ],
    precision: 'Pitch, straightness, mounting datum, and tooth-quality requirements are confirmed after drawing review.',
    customization: [
      'Module or diametral pitch and pressure angle',
      'Rack length, section, hole pattern, and joint geometry',
      'Helix angle for helical racks',
      'Heat treatment and surface protection',
    ],
    industries: ['Linear automation', 'Machine tools', 'Lifting systems', 'Material handling'],
    inspection: [
      'Pitch and tooth geometry checks when specified',
      'Straightness, section, and mounting-datum inspection',
      'Joint and matched-pinion criteria as agreed',
    ],
    faq: [
      {
        question: 'Can long travel be built from rack segments?',
        answer:
          'Segmented solutions can be reviewed. Joint pitch, end geometry, mounting datum, and installation alignment must be defined.',
      },
      {
        question: 'Should the pinion drawing be included?',
        answer:
          'Yes. The mating pinion helps confirm tooth system, backlash target, duty, and the most useful inspection criteria.',
      },
    ],
    seo: {
      title: 'Custom Gear Racks and Rack Segments | SINOF',
      description:
        'Source custom straight or helical gear racks reviewed for tooth system, length, joints, mounting, material, and inspection.',
    },
  },
  {
    slug: 'custom-gears',
    name: 'Custom Gears to Drawing',
    shortName: 'Custom Gears',
    valueProposition: 'A drawing-led route for non-standard gears, pinions, geared shafts, and mating transmission components.',
    description:
      'Share the complete technical package so SINOF can review geometry, manufacturability, inspection, documentation, and order context.',
    image: '/assets/gear-worm.jpg',
    imageAlt: 'Assorted machined gear components representing custom gear projects',
    features: [
      'Non-standard tooth and component geometry review',
      'Integrated shafts, hubs, splines, and mounting features',
      'Mating-component and assembly context considered',
      'Inspection and documentation scope agreed before quotation',
    ],
    materials: [
      'Ferrous, non-ferrous, and polymer options reviewed by application',
      'Material substitutions require buyer approval',
      'Heat treatment and coating requirements reviewed with the base material',
    ],
    precision: 'All tolerances and gear accuracy requirements are confirmed against the released drawing and inspection plan.',
    customization: [
      'Gear geometry and profile details',
      'Integrated shaft, spline, bore, hub, and thread features',
      'Material, heat treatment, and coating',
      'Marking, traceability, packaging, and report requirements',
    ],
    industries: ['Industrial OEM equipment', 'Automation', 'Special-purpose machinery', 'Replacement and redesign projects'],
    inspection: [
      'Dimensional report against agreed critical characteristics',
      'Gear-specific checks defined by the drawing',
      'Material, heat-treatment, and traceability documents when contracted',
    ],
    faq: [
      {
        question: 'Which drawing formats can be submitted?',
        answer:
          'A dimensioned PDF plus a STEP model is ideal. Other common 2D and 3D formats can be reviewed during the inquiry.',
      },
      {
        question: 'Can SINOF provide design-for-manufacture feedback?',
        answer:
          'Manufacturability observations can be included during technical review, while final design authority remains with the buyer.',
      },
    ],
    seo: {
      title: 'Custom Gears and Geared Components | SINOF',
      description:
        'Send your custom gear drawing for review of geometry, material, tolerances, inspection, documentation, and order requirements.',
    },
  },
  {
    slug: 'rubber-timing-belts',
    name: 'Rubber Timing Belts',
    shortName: 'Rubber Timing Belts',
    valueProposition:
      'Synchronous rubber belts for compact power transmission, positioning, and matched pulley systems.',
    description:
      'SINOF reviews belt profile, width, effective length, operating environment, load, speed, and pulley data before confirming a belt proposal.',
    image: '/assets/rubber-timing-belts.webp',
    imageAlt: 'SINOF rubber timing belts on a white background',
    features: [
      'MXL, XL, L, H, and XH trapezoidal profiles',
      'HTD 3M, 5M, 8M, 14M, and 20M profiles',
      'S2M, S3M, S5M, S8M, and S14M profiles',
      'T2.5, T5, and T10 profiles, plus double-sided and open-ended forms',
    ],
    materials: [
      'Rubber belt body with tensile-member construction',
      'Tooth-facing fabric and cord options reviewed for the application',
    ],
    precision:
      'Profile, pitch, width, effective length, and matched-pulley requirements are confirmed for each inquiry.',
    customization: [
      'Profile, belt width, and effective length',
      'Endless, double-sided, or open-ended form',
      'Surface and tooth-facing requirements',
      'Matched timing-pulley review',
    ],
    industries: ['Packaging machinery', 'Automation equipment', 'Textile machinery', 'General industrial drives'],
    inspection: [
      'Profile, width, length, and visible-condition checks against the agreed specification',
      'Fit review with supplied or specified pulley data when included in the project',
      'Batch documentation defined during quotation',
    ],
    faq: [
      {
        question: 'Which information is needed for a rubber timing belt inquiry?',
        answer:
          'Please provide the profile, width, effective length or tooth count, quantity, operating conditions, and available pulley data.',
      },
      {
        question: 'Are double-sided and open-ended belts available for review?',
        answer:
          'Yes. Double-sided and open-ended forms can be reviewed against the requested profile, length, and application.',
      },
    ],
    seo: {
      title: 'Rubber Timing Belts for Industrial Drives | SINOF',
      description:
        'Request rubber timing belts in trapezoidal, HTD, S, and T profiles with width, length, construction, and pulley matching reviewed for your application.',
    },
  },
  {
    slug: 'polyurethane-timing-belts',
    name: 'Polyurethane Timing Belts',
    shortName: 'Polyurethane Timing Belts',
    valueProposition:
      'Polyurethane timing belts configured for synchronous conveying, positioning, and industrial drive requirements.',
    description:
      'Profile, tensile member, belt form, surface features, and operating conditions are reviewed together before quotation.',
    image: '/assets/polyurethane-timing-belts.webp',
    imageAlt: 'White polyurethane timing belt with visible tensile cords',
    features: [
      'T2.5, T5, T10, T20 and AT3, AT5, AT10 profiles',
      'MXL, XL, L, H, XH and HTD 3M, 5M, 8M, 14M profiles',
      'S5M, S8M, S14M and TK5, TK10, ATK5, ATK10 profiles',
      'Optional cleats, guides, holes, coatings, and foam subject to application review',
    ],
    materials: [
      'Polyurethane belt body',
      'Steel-cord and alternative tensile-member constructions reviewed by application',
    ],
    precision:
      'Profile, pitch, width, length, tracking features, and application acceptance criteria are agreed before supply.',
    customization: [
      'Endless or open-ended belt form',
      'Cleats, guides, holes, coatings, and foam',
      'Profile, width, length, and tensile-member selection',
      'Matched pulley and conveying-layout review',
    ],
    industries: ['Automation', 'Packaging lines', 'Positioning systems', 'Synchronous conveying'],
    inspection: [
      'Profile, width, length, and visible-condition checks',
      'Cleat, guide, hole, or coating layout checked against the released specification',
      'Project-specific inspection records agreed during quotation',
    ],
    faq: [
      {
        question: 'Can cleats or guides be added to polyurethane timing belts?',
        answer:
          'Cleats, guides, holes, coatings, and foam can be reviewed when their geometry, spacing, orientation, and operating purpose are provided.',
      },
      {
        question: 'Which profile and tensile member should be selected?',
        answer:
          'Selection depends on load, speed, pulley geometry, positioning needs, environment, and belt layout. Please share the complete application data.',
      },
    ],
    seo: {
      title: 'Polyurethane Timing Belts and Custom Features | SINOF',
      description:
        'Source polyurethane timing belts with profile, tensile member, cleats, guides, holes, coatings, foam, and matched pulley requirements reviewed.',
    },
  },
  {
    slug: 'conveyor-belts',
    name: 'Industrial Conveyor Belts',
    shortName: 'Conveyor Belts',
    valueProposition:
      'PU and PVC conveyor-belt configurations reviewed around the conveyed product, layout, tracking, and environment.',
    description:
      'SINOF evaluates belt construction and fabrication details from the conveyor layout, product contact, speed, load, cleaning, and tracking requirements.',
    image: '/assets/conveyor-belts.webp',
    imageAlt: 'Assorted blue, green, white, and dark industrial conveyor belts',
    features: [
      'PU and PVC belt constructions subject to application review',
      'Endless and fabricated belt inquiries',
      'Optional guides, cleats, sidewalls, and perforation',
      'Surface and tracking requirements reviewed with the conveyor layout',
    ],
    materials: [
      'PU conveyor-belt constructions',
      'PVC conveyor-belt constructions',
      'Fabric reinforcement and surface selection reviewed per application',
    ],
    precision:
      'Finished width, length, joint, tracking features, and fabrication layout are confirmed from the released specification.',
    customization: [
      'Belt width, endless length, joint, and edge treatment',
      'Guides, cleats, sidewalls, and perforation',
      'Surface texture and color subject to available construction',
      'Application-specific fabrication drawing',
    ],
    industries: ['Packaging', 'Material handling', 'Light manufacturing', 'Process conveying'],
    inspection: [
      'Width, length, joint, and visible-condition checks',
      'Fabricated features checked against the released layout',
      'Application-specific acceptance requirements agreed before production',
    ],
    faq: [
      {
        question: 'What information is needed to quote a conveyor belt?',
        answer:
          'Please provide belt width and length, conveyed product, load, speed, pulley diameters, tracking method, environment, and any cleat or guide drawing.',
      },
      {
        question: 'Can guides, cleats, sidewalls, or holes be included?',
        answer:
          'Yes. These features are reviewed against a dimensioned layout and the operating purpose of the conveyor.',
      },
    ],
    seo: {
      title: 'PU and PVC Industrial Conveyor Belts | SINOF',
      description:
        'Request PU or PVC conveyor belts with guides, cleats, sidewalls, perforation, joints, dimensions, and application requirements reviewed.',
    },
  },
  {
    slug: 'flat-belts',
    name: 'Flat Transmission Belts',
    shortName: 'Flat Belts',
    valueProposition:
      'Flat-belt solutions reviewed for power transmission, speed, pulley layout, tension, and operating environment.',
    description:
      'Belt construction, dimensions, joint or endless form, surface, and pulley conditions are confirmed for the stated drive.',
    image: '/assets/flat-belts.webp',
    imageAlt: 'Black and white flat transmission belts arranged in loops',
    features: [
      'Nylon-core flat transmission belt inquiries',
      'Seamless endless belt forms subject to application review',
      'Surface and friction requirements evaluated with pulley conditions',
      'Width, length, thickness, and joint requirements confirmed per project',
    ],
    materials: [
      'Nylon-core belt constructions',
      'Elastomer and fabric surface layers reviewed by application',
      'Seamless endless constructions where suitable',
    ],
    precision:
      'Width, endless length, thickness, running surface, and joint or seamless construction are confirmed from project data.',
    customization: [
      'Width, endless length, and thickness',
      'Jointed or seamless endless form',
      'Running and pulley-side surfaces',
      'Pulley layout and tensioning review',
    ],
    industries: ['Textile machinery', 'Printing equipment', 'Machine tools', 'Industrial power transmission'],
    inspection: [
      'Width, length, thickness, and visible-condition checks',
      'Joint or endless construction verified against the agreed specification',
      'Project-specific running requirements documented before production',
    ],
    faq: [
      {
        question: 'Which drive information is needed for a flat-belt inquiry?',
        answer:
          'Please share pulley diameters and widths, center distance, speed, power or load, tensioning method, environment, and existing belt dimensions.',
      },
      {
        question: 'Can seamless endless flat belts be reviewed?',
        answer:
          'Yes. Seamless endless forms can be evaluated when the required dimensions, pulley layout, load, speed, and surface needs are provided.',
      },
    ],
    seo: {
      title: 'Flat Transmission Belts for Industrial Drives | SINOF',
      description:
        'Discuss nylon-core and seamless endless flat belts with dimensions, surfaces, pulley layout, load, speed, and tensioning requirements reviewed.',
    },
  },
  {
    slug: 'round-belts',
    name: 'Round Belts',
    shortName: 'Round Belts',
    valueProposition:
      'Round-section belts reviewed for light transmission, conveying, routing, joint, and environmental requirements.',
    description:
      'Diameter, length, belt compound, joint form, surface, pulley layout, and application conditions are confirmed per project.',
    image: '/assets/round-belts.webp',
    imageAlt: 'Orange round belt supplied on a neutral cardboard reel',
    features: [
      'Round-section transmission and conveying belt inquiries',
      'Diameter and endless-length requirements reviewed',
      'Open length and joined-loop applications evaluated',
      'Surface, routing, and pulley requirements confirmed per project',
    ],
    materials: [
      'Polyurethane and other round-belt compounds subject to application review',
      'Material selection based on load, environment, and contact requirements',
    ],
    precision:
      'Diameter, finished length, joint geometry, and measurable acceptance criteria are confirmed for the application.',
    customization: [
      'Belt diameter and length',
      'Open or endless joined form',
      'Surface and color subject to available material',
      'Joint and routing requirements',
    ],
    industries: ['Light conveying', 'Packaging equipment', 'Sorting systems', 'General industrial drives'],
    inspection: [
      'Diameter, length, joint, and visible-condition checks',
      'Material and surface checked against the agreed project specification',
      'Fit or routing requirements reviewed from supplied layout data',
    ],
    faq: [
      {
        question: 'What measurements are needed for a round-belt inquiry?',
        answer:
          'Please provide belt diameter, open or endless length, quantity, pulley layout, load, speed, environment, and preferred joint form.',
      },
      {
        question: 'Can round belts be supplied as joined loops?',
        answer:
          'Joined-loop requirements can be reviewed against diameter, finished length, routing, load, and application conditions.',
      },
    ],
    seo: {
      title: 'Round Belts for Transmission and Conveying | SINOF',
      description:
        'Request round belts with diameter, length, material, surface, joint, pulley layout, and application requirements reviewed for your project.',
    },
  },
]

export function getProductBySlug(slug: string | undefined): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function isProductSlug(value: string): value is ProductSlug {
  return productSlugs.includes(value as ProductSlug)
}

export function localizeProduct(product: Product, lang: Lang): Product {
  if (lang === 'en') return product
  return {
    slug: product.slug,
    image: product.image,
    ...productTranslations[lang][product.slug],
  }
}
import type { Lang } from '@/i18n/language'
import { productTranslations } from './productTranslations'
