# SINOFORM B2B Website Phase One Design

## Objective

Upgrade the existing SINOFORM single-page gear inquiry demo into the first production-ready version of a multi-page B2B export website without replacing its established blue industrial visual style.

The implementation must retain React, TypeScript, Vite, Tailwind CSS, and the existing multilingual architecture.

## Confirmed Business Facts

- Brand: SINOFORM
- Canonical host: `www.sinoforce.net`
- Preferred production protocol: HTTPS
- Business email: not confirmed; hide it
- Phone and WhatsApp: not confirmed; hide them
- Factory or office address: not confirmed; hide it
- Certifications: not confirmed; hide them
- Factory size, employee count, equipment count, customer count, export-country count, annual production, delivery performance, and similar metrics: not confirmed; hide them

No page may reuse the unverified claims currently present in the demo.

## Chosen Approach

Use an incremental, data-driven multi-page refactor.

The existing components, imagery, color palette, spacing system, typography treatment, and industrial design language remain the visual foundation. Routing, page composition, content sources, SEO, product templates, and inquiry behavior are added around that foundation.

The rejected alternatives are:

- A CMS-style content engine, which adds unnecessary abstraction for phase one.
- Thin route wrappers around the existing single-page sections, which would produce weak page-level content and repeated code.

## Route Architecture

The public routes are:

- `/`
- `/products`
- `/products/spur-gears`
- `/products/helical-gears`
- `/products/bevel-gears`
- `/products/timing-pulleys`
- `/products/gear-racks`
- `/products/custom-gears`
- `/capabilities`
- `/quality`
- `/contact`

An additional not-found route provides recovery links and emits `noindex`.

`App` owns providers and routing. `SiteLayout` owns the shared header, footer, floating RFQ action, scroll restoration, and responsive navigation. Each route renders a focused page component.

All six product detail routes use one `ProductDetailPage` component. The route slug selects one product record from the product data module. Product-specific JSX duplication is not allowed.

## Content and Data Boundaries

All core copy and product information live outside page components.

The content layer is split by responsibility:

- Site identity and canonical URL configuration
- Navigation and footer configuration
- Page-level copy and SEO records
- Product records
- Shared FAQ records
- Contact form options and labels

English is the complete phase-one content source. The existing five-language architecture remains available for English, German, Japanese, Spanish, and Chinese. On first visit, language selection follows the browser language. A manually selected language is persisted and always wins on later visits.

Unreviewed translations fall back to English instead of displaying the existing corrupted or inaccurate copy. A deployment-time country-code adapter is reserved for later IP-assisted language selection. Phase one does not call a third-party IP lookup service.

## Product Data Model

Each product record contains:

- Stable slug
- Localized name
- Short value proposition
- Product image
- Main features
- Candidate material categories
- Precision statement
- Customization capabilities
- Application industries
- Quality inspection methods
- Product-specific FAQ
- SEO title and description

Precision capability is presented as “confirmed after drawing review” until verified manufacturing grades are supplied. Material and process statements are written as drawing-review options, not unconditional factory capability claims.

Product records do not contain invented prices, availability, ratings, SKUs, certifications, delivery promises, facility metrics, or customer metrics.

## Page Composition

### Home

The home page preserves the current hero-led layout and reuses the strongest existing visual sections. Unverified badges, statistics, contact promises, and certification labels are removed. Home-page actions navigate to real routes.

### Products

The products index displays all six requested categories. Cards link to their detail routes and provide a direct RFQ action.

### Product Detail

The shared template includes:

- Breadcrumbs
- Product name and value proposition
- Main product image
- RFQ button
- Main features
- Materials
- Precision
- Customization
- Industries
- Quality inspection
- FAQ
- Final RFQ call to action

### Capabilities

This page describes the drawing-review and custom-manufacturing workflow without claiming unverified equipment, tolerances, production capacity, or in-house processes.

### Quality

This page describes inspection planning, drawing-based acceptance criteria, documentation options, and traceability expectations without claiming certifications or specific measuring equipment.

### Contact

This page hosts the complete RFQ form. Unconfirmed direct contact details are omitted.

## Navigation

Desktop and mobile header navigation link to real pages rather than scrolling to home-page anchors. Products expose the six product routes. The footer provides the same real route structure.

The mobile menu must be keyboard accessible, close after navigation, and preserve the existing visual style.

## Inquiry Flow

Product RFQ actions navigate to:

`/contact?product=<product-slug>`

The contact page validates the slug and preselects the matching product. Because the selection is stored in the URL, refresh and copied links preserve it.

The form contains:

- Name
- Company
- Email
- Country
- Product
- Quantity
- Material
- Drawing file placeholder
- Message

Name, company, email, country, product, and message are required. Email format is validated. Quantity remains free text so buyers can enter units, batch size, or forecast context.

The drawing control accepts a local selection and displays the file name, but the mock service does not upload file bytes. The interface clearly states that drawing transfer becomes active when the production API is connected.

The submission lifecycle supports idle, validating, submitting, success, and failure states. Failure provides an actionable retry path. Success displays a locally generated inquiry reference.

The mock API is isolated in a service module behind a typed submission function. The module documents the exact replacement point for a future HTTP or CRM integration. Page components do not write directly to local storage or contain simulated network timing logic.

## SEO

Every public route has an independent:

- `<title>`
- Meta description
- Canonical link
- Open Graph title
- Open Graph description
- Open Graph URL
- Open Graph type

The canonical base defaults to `https://www.sinoforce.net` and can be overridden by `VITE_SITE_URL`.

The SEO component updates document metadata during client-side navigation and removes route-specific JSON-LD when routes change.

Structured data includes:

- `Organization` on public pages, limited to confirmed brand name and URL
- `Product` on product detail pages, without offers, reviews, ratings, prices, availability, SKU, or certification claims
- `BreadcrumbList` on product detail pages
- `FAQPage` where visible FAQ content is present

The not-found route uses `noindex, nofollow`.

## Responsive and Accessibility Requirements

- Maintain functional layouts from 320 px mobile width through desktop.
- Product grids collapse to one column on narrow screens.
- Product detail two-column regions collapse to one column.
- Form controls remain full-width and touch friendly on mobile.
- Navigation, dialogs, accordions, and form controls are keyboard accessible.
- Images have meaningful alt text.
- Form validation is associated with the relevant fields and success or failure status is announced.
- Focus styling remains visible.

## Testing and Verification

Automated tests cover:

- Product slugs and required product fields
- Route-to-product resolution
- Language detection, persistence, and English fallback
- SEO metadata and canonical generation
- JSON-LD generation without unconfirmed fields
- Inquiry validation
- Product query-string prefill
- Mock API success and failure results

Final verification includes:

- Automated test suite
- ESLint
- TypeScript production build
- Vite production build
- Manual route checklist for all eleven requested routes
- Mobile layout review at representative narrow and wide sizes
- Confirmation that no unverified business claims remain in rendered core copy or metadata

## Deliverables

- Updated source project
- Successful `npm run build`
- Project structure explanation
- Production API replacement note
- List of business information still required before launch

## Information Required Before Final Production Launch

- Confirmed sales email
- Confirmed phone or WhatsApp, if it should be displayed
- Confirmed legal company name
- Confirmed address, if it should be displayed
- Confirmed certifications and certificate details, if any
- Verified manufacturing processes and whether they are in-house or outsourced
- Verified supported materials and heat-treatment options
- Verified dimensional ranges and precision grades by product
- Verified inspection equipment and report types
- Confirmed quotation and lead-time promises
- Privacy policy and data-processing wording
- Real inquiry API or CRM destination
- Drawing upload storage and retention policy
- Reviewed translations for German, Japanese, Spanish, and Chinese
