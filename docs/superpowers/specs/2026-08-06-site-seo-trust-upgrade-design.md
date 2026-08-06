# SINOF Website SEO and Trust Upgrade Design

## Objective

Upgrade `sinfogear.com` from a functional inquiry website into a more credible and indexable export-manufacturing site. This phase combines technical SEO fixes with verified company evidence from the August 2026 airport supply-and-demand presentation.

The site remains positioned around custom gears and drawing-led transmission component inquiries. Complete belt conveyor equipment is presented only as a supporting integration capability, not as a standalone export product or primary navigation category.

## Confirmed Source Material

The following facts are approved for public use:

- Changsha Xingfeng Transmission Machinery Co., Ltd. was founded in 2008.
- Production facilities cover approximately 7,000 square meters.
- Gear production covers approximately 4,000 square meters.
- Transmission-belt production covers approximately 2,500 square meters.
- Equipment includes high-speed CNC gear hobbing machines, CNC gear shaping machines, temperature-controlled gear grinding machines, and CNC machining centers.
- The company operates a Class 100,000 temperature- and humidity-controlled precision gear inspection laboratory.
- ISO 9001 certification and high-tech enterprise / technology-based SME recognition are valid public claims.
- The presentation's factory, workshop, product, and application images are approved for website use.
- Chen Shouyu is an approved business contact at `+86 159 7312 7000`.
- Existing office phone numbers and `info@sinof.net` remain valid.
- `inquiries@sinfogear.com` is the customer-facing RFQ sender address.

## Scope

### 1. Static SEO for Core Routes

Extend the existing static-site generator beyond the blog so every public core route has useful HTML before JavaScript runs:

- `/`
- `/about`
- `/products`
- every supported product route
- `/capabilities`
- `/quality`
- `/contact`
- `/blog` and article routes

Each generated document must include a route-specific title, description, canonical URL, H1, meaningful body copy, Open Graph fields, and the structured data already appropriate to the route. Static content must be removed before React mounts so users never see duplicate content.

The sitemap remains generated from the typed public route list and contains every canonical public route once.

### 2. Correct Not-Found Behavior

Known legacy URLs receive explicit 301 redirects where a direct replacement exists. Every valid public application route receives its own generated HTML file, so the catch-all `/* /index.html 200` rewrite can be removed. A generated branded `404.html` handles direct unknown requests with HTTP 404, while client-side navigation continues to render the React Not Found page.

The acceptance check includes a known nonexistent URL returning HTTP 404 rather than 200.

### 3. Verified Trust Content

Replace generic factory and inspection visuals with extracted, approved presentation images where suitable. The About page becomes the main company-evidence page and includes:

- legal company identity;
- founding year;
- production and workshop areas;
- real factory exterior and workshop gallery;
- named equipment groups;
- inspection-laboratory description;
- certification and enterprise-recognition statements;
- clear links to capabilities, quality planning, products, and RFQ.

The homepage receives a concise proof strip and selected real facility imagery. The Capabilities page uses real production evidence and describes the drawing-review workflow. The Quality page uses real inspection evidence and carefully separates verified facility facts from project-specific accuracy and document commitments.

Public copy must avoid universal capability guarantees. Gear accuracy, inspection scope, lead time, and production acceptance remain subject to drawing and order review.

### 4. Product and Application Coverage

Add `worm-gears` as a typed product record and public product route. It follows the existing shared product template and contains product-specific RFQ inputs, materials, customization, inspection guidance, FAQs, SEO metadata, and related application language.

The homepage and relevant product/capability pages may show the confirmed application sectors:

- industrial machine tools;
- robotics and industrial automation;
- automotive manufacturing equipment;
- food and pharmaceutical machinery;
- logistics and conveying;
- photovoltaic and renewable-energy equipment;
- semiconductor equipment;
- wind-energy equipment.

This phase does not create separate industry landing pages. Those pages require dedicated, non-duplicative technical copy and supporting evidence and are deferred to phase two.

Timing pulleys, timing belts, conveyor belts, flat belts, and round belts remain existing product families. Complete conveyor systems appear only as a supporting application/integration capability and do not receive a standalone route.

### 5. Contact and Conversion Readiness

Display contact information consistently:

- RFQ email: `inquiries@sinfogear.com`;
- general company email: `info@sinof.net`;
- existing office phone numbers;
- business contact: Chen Shouyu;
- mobile / WeChat: `+86 159 7312 7000`;
- confirmed company address.

The production inquiry email path and its existing environment variables remain unchanged.

Add a small analytics abstraction that can emit page-view and successful-inquiry events when a future `VITE_GTM_ID` or `VITE_GA_MEASUREMENT_ID` is configured. No tracking script loads when those variables are absent. CRM integration remains a future server-side webhook or API adapter and is not implemented in this phase.

### 6. Performance and Safety

Use responsive, compressed WebP or JPEG assets derived from the approved presentation images. Images below the first viewport use lazy loading and explicit dimensions where practical.

Avoid new runtime dependencies unless required. Preserve the existing inquiry limits and file validation. This phase does not alter email credentials, Cloudflare secrets, Resend domain settings, or the user's unrelated `platform/packages/contracts` working-tree changes.

## Page-Level Content Plan

### Homepage

- Keep the drawing-led custom gear value proposition.
- Add verified proof points: founded 2008, approximately 7,000 square meters, approximately 4,000-square-meter gear workshop, and ISO 9001 certification.
- Use real factory imagery.
- Add a compact confirmed-industry section.
- Keep the main CTA focused on submitting drawings and RFQ requirements.

### About

- Expand the verified company profile.
- Add factory exterior and workshop gallery.
- Present equipment, facility areas, quality laboratory, and recognition.
- Avoid unsupported customer counts, export-country counts, or sales claims.

### Products

- Add Worm Gears to the existing product grid.
- Preserve clear separation between gears, synchronous-drive products, and industrial belts.

### Capabilities

- Replace generic production imagery with real workshop evidence.
- Explain hobbing, shaping, grinding, CNC secondary machining, and drawing review without publishing universal dimensional limits.
- Mention conveyor equipment only as supporting system/application experience.

### Quality

- Replace generic inspection imagery with approved laboratory evidence.
- Add ISO 9001 and controlled laboratory facts.
- Keep gear grade and inspection output subject to drawing review and agreed order scope.

### Contact

- Show consistent company, business-contact, phone, email, address, and RFQ details.
- Preserve drawing upload and production email delivery.
- Emit an analytics conversion event only after the server confirms successful inquiry delivery.

## Data and Component Boundaries

- Verified company facts remain in a typed company-data module.
- Contact facts remain in the central site configuration.
- Product content remains in the typed product-data model and localized translation structure.
- Static metadata and crawler content are generated from the same typed page and product records used by React.
- Presentation-derived asset filenames describe their real content and source category rather than slide numbers.
- Analytics setup and event emission live in one isolated module with no-op behavior when unconfigured.

## Testing and Acceptance

Automated tests must cover:

- every public route appears once in the sitemap;
- every core route receives a unique static title, description, canonical URL, and H1;
- static product pages contain product-specific content and Product/Breadcrumb/FAQ structured data;
- the Worm Gears route is valid, localized, linkable, and accepted by RFQ prefilling;
- approved trust facts appear on the intended pages;
- unsupported guarantees remain prohibited;
- analytics is inactive without IDs and emits the expected event when configured;
- successful inquiry conversion is emitted only after server success;
- legacy redirect rules and the unknown-page 404 behavior are correct.

Production acceptance includes:

- desktop and mobile visual review of changed routes;
- live HTTP checks for core metadata and H1 content;
- live sitemap and robots checks;
- live 404 response check;
- live inquiry API method check to confirm Pages Functions remain deployed;
- no changes to existing Cloudflare secrets or Resend configuration.

## Deferred Phase Two

- dedicated application-industry landing pages;
- independent `/de/`, `/ja/`, `/es/`, and `/zh/` URL structures with hreflang;
- case studies and customer-approved performance evidence;
- downloadable technical datasheets and RFQ templates;
- CRM persistence and automated sales workflows;
- full GA4/GTM/Google Ads activation after measurement IDs are supplied;
- additional security controls such as Turnstile and persistent rate limiting.
