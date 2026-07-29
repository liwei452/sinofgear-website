# SINOF Company Profile, Product Expansion, and IP Language Design

## Objective

Extend the existing SINOF B2B website without changing its established visual
style. Add a formal company profile, publish the approved company facts, expand
the product center with SINOF-owned belt and conveyor categories, expose the
company email address, and make first-visit language selection use visitor
country with English as the safe fallback.

## Scope

### New public route

- `/about` — multilingual company profile and approved company facts.

### New product routes

- `/products/rubber-timing-belts`
- `/products/polyurethane-timing-belts`
- `/products/conveyor-belts`
- `/products/flat-belts`
- `/products/round-belts`

The existing gear and timing-pulley routes remain unchanged. New products use
the existing shared product-detail template and data-driven configuration
instead of introducing page-specific component copies.

### Navigation

Add About to desktop navigation, mobile navigation, and the footer. Keep the
existing Products, Capabilities, Quality, and Contact destinations.

## Company Information

The public company profile may state:

- Brand: SINOF.
- Legal company name: Changsha Xingfeng Transmission Machinery Co., Ltd.
  (长沙市星沣传动机械有限公司).
- Founded in 2008.
- Approximately 7,000 square meters of standard production facilities.
- Approximately 4,000 square meters allocated to the gear production workshop.
- Equipment includes high-speed CNC gear hobbing machines, CNC gear shaping
  machines, temperature-controlled gear grinding machines, and CNC machining
  centers.
- A Class 100,000 temperature- and humidity-controlled precision gear
  inspection laboratory.
- Gear accuracy up to GB Grade 5.
- ISO 9001 quality management system certification obtained in 2017.
- High-tech enterprise and technology-based SME recognition obtained in 2020.
- Address: Third Floor, Building 16, Zone B, Huanghua Comprehensive Bonded
  Zone, Changsha Airport Economic and Free Trade Zone, Changsha, Hunan, China.
- Telephone: +86 731 8888 4918 and +86 731 8686 7700.
- Email: info@sinof.net.

The wording must not add employee counts, customer counts, export-country
counts, equipment quantities, certification numbers, or other facts absent
from the user-approved source material.

## Company Profile Page

The About page follows the existing industrial visual language and component
patterns:

1. Hero section with a concise SINOF value proposition.
2. Company overview naming the legal company and core transmission focus.
3. Facility and manufacturing section presenting the approved area and
   equipment statements.
4. Quality and recognition section presenting GB Grade 5, the controlled
   inspection laboratory, ISO 9001 in 2017, and 2020 recognitions.
5. Product-scope section linking to the product center.
6. Contact call-to-action with clickable email and RFQ link.

The page receives independent title, meta description, canonical URL, Open
Graph metadata, Organization structured data, and breadcrumb structured data
through the existing SEO utilities.

## Product Expansion

Publish only SINOF-owned product categories from the supplied package:

- Rubber timing belts
- Polyurethane timing belts
- Conveyor belts
- Flat transmission belts
- Round belts

Do not publish NITTA-branded products, images, the turning-conveyor PDF, or
NITTA specifications in this phase.

Each new product entry supplies the fields required by the shared product
template:

- Product name and short value proposition
- Product image
- Main features
- Materials or construction
- Available profiles or product forms
- Customization capabilities
- Application industries
- Quality and inspection approach
- FAQ
- RFQ destination
- Independent SEO metadata

Copy may use the product families and profile designations supplied in the
company classification document. It must not invent universal tolerances,
working loads, service life, temperature ranges, chemical resistance, minimum
order quantities, or lead times.

Use selected original SINOF images from the supplied package. Create
web-optimized copies in the existing public asset directory while preserving
the source archive and inspection copy.

## Email Display

Display `info@sinof.net` as a clickable `mailto:` link in:

- About page
- Contact page
- Footer

The inquiry form remains on its existing local mock submission adapter. This
scope does not send submissions by email and does not add an email delivery
provider.

## Language Behavior

Supported languages remain English, Simplified Chinese, German, Japanese, and
Spanish.

Language priority:

1. A valid language explicitly selected by the visitor and saved in local
   storage.
2. Country detected from the same-origin Cloudflare trace endpoint
   `/cdn-cgi/trace`.
3. English.

The first page renders in English while asynchronous country detection runs.
When detection returns a mapped country and the visitor has not manually
selected a language, the site changes to the mapped language.

Country mapping:

- Chinese: CN, HK, MO, TW
- German: DE, AT, CH, LI
- Japanese: JP
- Spanish: ES, MX, AR, CL, CO, PE
- All other or unavailable countries: English

Browser language is not used for automatic selection. A delayed IP response
must never overwrite a manual choice. Network errors, malformed trace
responses, timeouts, local development, and non-Cloudflare hosting all fall
back to English without blocking page rendering.

## Data and Component Boundaries

- Company facts and About-page copy live in dedicated data files.
- New product copy and specifications live in product data/configuration files.
- Country detection parsing remains isolated in the geo-language service.
- Routing remains centralized in `App.tsx`.
- Header and footer consume the shared navigation and site configuration.
- No duplicated product-detail page components are introduced.

## Testing

Add tests before production code for:

- Parsing `loc=XX` from Cloudflare trace text.
- Calling `/cdn-cgi/trace` when no injected test country is provided.
- Falling back to English when country detection is unavailable.
- Preserving a saved or newly selected manual language.
- Rendering `/about` with approved company facts, contact information, and SEO.
- Rendering every new product route through the shared template.
- Excluding NITTA from public product data and visible content.
- Displaying `info@sinof.net` on About, Contact, and Footer.

Run the website-scoped Vitest suite, ESLint on `src`, and the production build.
The unrelated incomplete `platform` workspace is outside this feature scope.

## Deployment and Acceptance

Deploy the built `dist` directory to the existing Cloudflare Pages project
`sinoform`.

Acceptance requires:

- `https://sinfogear.com/about` returns the production site.
- Every new product URL loads directly and after client-side navigation.
- The English default is visible when geo detection cannot resolve a mapped
  country.
- Manual language choice persists and wins over later IP detection.
- Both apex and `www` domains serve the same deployment.
- No NITTA-branded content is present in the production asset or page output.
