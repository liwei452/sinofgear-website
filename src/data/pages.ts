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
      title: 'Custom Gears Made to Drawing | SINOF',
      description:
        'Discuss custom gears and geared components with SINOF through a drawing-led engineering and quotation workflow.',
    },
  },
  about: {
    eyebrow: 'About SINOF',
    title: 'Transmission Manufacturing for Global Industry',
    subtitle:
      'Learn about SINOF’s production facilities, gear manufacturing equipment, quality laboratory, product range, and company development.',
    seo: {
      title: 'About SINOF | Transmission Manufacturing Company',
      description:
        'Learn about SINOF, Changsha Xingfeng Transmission Machinery Co., Ltd., its gear workshop, transmission products, quality laboratory, and manufacturing background.',
    },
  },
  products: {
    eyebrow: 'Product range',
    title: 'Explore Custom Gear Categories',
    subtitle: 'Choose a product family to review design inputs, customization options, and inspection planning.',
    seo: {
      title: 'Custom Gear Products | SINOF',
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
      title: 'Custom Gear Manufacturing Capabilities | SINOF',
      description:
        'Learn how SINOF reviews custom gear drawings, materials, process requirements, documentation, and production readiness.',
    },
  },
  quality: {
    eyebrow: 'Quality planning',
    title: 'Define Acceptance Criteria Before Production',
    subtitle:
      'Quality planning starts with controlled drawings, measurable requirements, agreed reports, and clear change control.',
    seo: {
      title: 'Gear Quality Planning and Inspection | SINOF',
      description:
        'Review SINOF’s drawing-based approach to gear inspection planning, documentation, traceability, and acceptance criteria.',
    },
  },
  contact: {
    eyebrow: 'Request for quotation',
    title: 'Request a Technical Review and Quote',
    subtitle:
      'Share the component, quantity, material, application, and inspection requirements. Upload a drawing when available, and our engineering team will review the details before quotation.',
    seo: {
      title: 'Request a Custom Gear Quote | SINOF',
      description:
        'Submit a custom gear inquiry with product, quantity, material, drawing, and application details for review.',
    },
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The requested SINOF page could not be found.',
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

export const inquiryCopy = {
  fields: {
    name: 'Name',
    company: 'Company',
    email: 'Email',
    whatsapp: 'WhatsApp (optional)',
    country: 'Country',
    product: 'Product',
    quantity: 'Quantity',
    material: 'Material',
    drawing: 'Drawing (optional)',
    message: 'Message',
  },
  placeholders: {
    name: 'Your full name',
    company: 'Company name',
    email: 'you@company.com',
    whatsapp: 'Example: +49 123 456789',
    country: 'Country or region',
    product: 'Product type or part description',
    quantity: 'Example: 500 pcs per batch',
    material: 'Grade, standard, or material preference',
    message: 'Describe the application, tooth data, tolerances, heat treatment, inspection, and any open questions.',
  },
  drawingNote:
    'Optional drawing: PDF, STEP/STP, IGES/IGS, DXF, or DWG; maximum 15 MB. Your inquiry and uploaded files are delivered to our business inbox and CRM for technical review and follow-up. Records are retained only as needed for quotation, follow-up, or legal recordkeeping. Contact admin@sinofgears.onmicrosoft.com to request deletion. Please ask us to arrange an NDA before sending confidential drawings.',
  submit: 'Submit Inquiry',
  submitting: 'Submitting…',
  successTitle: 'Inquiry received',
  successMessage:
    'Thank you. Your inquiry has been sent to our engineering team. Please keep the reference below for follow-up.',
  retry: 'Retry submission',
  reset: 'Start another inquiry',
}

export const inquiryOptions = {
  countries: [
    'United States',
    'Germany',
    'Japan',
    'United Kingdom',
    'France',
    'Italy',
    'Spain',
    'Netherlands',
    'Switzerland',
    'Austria',
    'Sweden',
    'Poland',
    'Czech Republic',
    'Canada',
    'Mexico',
    'Brazil',
    'Australia',
    'South Korea',
    'Singapore',
    'India',
    'Turkey',
    'United Arab Emirates',
    'South Africa',
    'China',
    'Other',
  ],
  materials: [
    'Buyer-specified material',
    'Carbon steel',
    'Alloy steel',
    'Stainless steel',
    'Aluminum alloy',
    'Brass or bronze',
    'Engineering plastic',
    'Material review requested',
  ],
}
