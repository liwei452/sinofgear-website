export const productSlugs = [
  'spur-gears',
  'helical-gears',
  'bevel-gears',
  'timing-pulleys',
  'gear-racks',
  'custom-gears',
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
      'SINOFORM reviews tooth geometry, material, heat treatment, bore features, and inspection needs before confirming a manufacturing route.',
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
        question: 'Can SINOFORM review an existing gear sample?',
        answer:
          'A sample can support the engineering review, but a controlled drawing and agreed inspection criteria are still recommended before production.',
      },
    ],
    seo: {
      title: 'Custom Spur Gears Made to Drawing | SINOFORM',
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
      title: 'Custom Helical Gears to Drawing | SINOFORM',
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
      'SINOFORM evaluates the complete geometry and application context before confirming whether a bevel gear project is suitable.',
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
      title: 'Custom Bevel Gear Sets to Drawing | SINOFORM',
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
      'From a controlled drawing or belt-system specification, SINOFORM reviews pulley geometry and secondary machining requirements.',
    image: '/assets/gear-shaft.jpg',
    imageAlt: 'Machined toothed components representative of custom timing pulleys',
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
      title: 'Custom Timing Pulleys to Drawing | SINOFORM',
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
      'SINOFORM reviews rack and pinion data together where possible, including mounting datums, segment joints, and inspection criteria.',
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
      title: 'Custom Gear Racks and Rack Segments | SINOFORM',
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
      'Share the complete technical package so SINOFORM can review geometry, manufacturability, inspection, documentation, and order context.',
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
        question: 'Can SINOFORM provide design-for-manufacture feedback?',
        answer:
          'Manufacturability observations can be included during technical review, while final design authority remains with the buyer.',
      },
    ],
    seo: {
      title: 'Custom Gears and Geared Components | SINOFORM',
      description:
        'Send your custom gear drawing for review of geometry, material, tolerances, inspection, documentation, and order requirements.',
    },
  },
]

export function getProductBySlug(slug: string | undefined): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function isProductSlug(value: string): value is ProductSlug {
  return productSlugs.includes(value as ProductSlug)
}
