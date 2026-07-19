export interface PageSeo {
  title: string
  description: string
}

export const pages = {
  home: {
    eyebrow: 'Custom gear sourcing',
    title: 'Custom Gears Built Around Your Drawing',
    subtitle:
      'A clear inquiry path for spur gears, helical gears, bevel gears, timing pulleys, gear racks, and non-standard geared components.',
    seo: {
      title: 'Custom Gears Made to Drawing | SINOFORM',
      description:
        'Discuss custom gears and geared components with SINOFORM through a drawing-led engineering and quotation workflow.',
    },
  },
  products: {
    eyebrow: 'Product range',
    title: 'Explore Custom Gear Categories',
    subtitle: 'Choose a product family to review design inputs, customization options, and inspection planning.',
    seo: {
      title: 'Custom Gear Products | SINOFORM',
      description:
        'Explore custom spur gears, helical gears, bevel gears, timing pulleys, gear racks, and non-standard gears.',
    },
  },
  capabilities: {
    eyebrow: 'Capabilities',
    title: 'A Drawing-Led Manufacturing Review',
    subtitle:
      'Each project is evaluated for geometry, material, process route, inspection, documentation, and order context before quotation.',
    seo: {
      title: 'Custom Gear Manufacturing Capabilities | SINOFORM',
      description:
        'Learn how SINOFORM reviews custom gear drawings, materials, process requirements, documentation, and production readiness.',
    },
  },
  quality: {
    eyebrow: 'Quality planning',
    title: 'Define Acceptance Criteria Before Production',
    subtitle:
      'Quality planning starts with controlled drawings, measurable requirements, agreed reports, and clear change control.',
    seo: {
      title: 'Gear Quality Planning and Inspection | SINOFORM',
      description:
        'Review SINOFORM’s drawing-based approach to gear inspection planning, documentation, traceability, and acceptance criteria.',
    },
  },
  contact: {
    eyebrow: 'Request for quotation',
    title: 'Tell Us About Your Gear Project',
    subtitle:
      'Share the product type, quantity, material preference, drawing context, and application requirements for technical review.',
    seo: {
      title: 'Request a Custom Gear Quote | SINOFORM',
      description:
        'Submit a custom gear inquiry with product, quantity, material, drawing, and application details for review.',
    },
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The requested SINOFORM page could not be found.',
  },
} satisfies Record<string, { title: string; description?: string; eyebrow?: string; subtitle?: string; seo?: PageSeo }>

export const sharedCopy = {
  requestQuote: 'Request a Quote',
  viewProducts: 'View Products',
  learnMore: 'Learn More',
  home: 'Home',
  productRange: 'Products',
  productOverview: 'Product Overview',
  mainFeatures: 'Main Features',
  materials: 'Materials',
  precision: 'Precision',
  customization: 'Customization',
  industries: 'Application Industries',
  inspection: 'Quality Inspection',
  faq: 'Frequently Asked Questions',
}
