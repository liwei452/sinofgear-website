# SINOF Website SEO and Trust Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish verified factory evidence, full static SEO for every public route, a Worm Gears product page, correct 404 behavior, consistent contact details, and analytics-ready conversion events without changing the production inquiry email path.

**Architecture:** Typed company, page, product, and contact data remain the single source of truth for both React pages and the build-time static generator. The generator writes one clean-URL HTML file per route plus a branded `404.html`, allowing the Cloudflare SPA catch-all rewrite to be removed. Approved presentation images become compressed local assets, while an isolated analytics module remains a no-op until a measurement ID is configured.

**Tech Stack:** React 19, React Router 7, TypeScript 5.9, Vite 7, Vitest 4, Cloudflare Pages, PowerShell/PowerPoint asset extraction, Resend-backed Pages Function.

## Global Constraints

- Preserve the existing `functions/api/inquiries.ts` email delivery path and all Cloudflare/Resend environment variables.
- Preserve unrelated user deletions under `platform/packages/contracts/**`.
- Keep custom gears and drawing-led RFQs as the primary positioning.
- Show complete conveyor equipment only as a supporting capability; do not add a standalone product route.
- Add Worm Gears as a first-class product route.
- Do not add universal accuracy, lead-time, capacity, certification, or acceptance guarantees.
- Use only the approved presentation images and verified company/contact facts.
- Do not load analytics when both `VITE_GTM_ID` and `VITE_GA_MEASUREMENT_ID` are absent.
- Do not add separate industry landing pages or localized URL structures in this phase.

---

### Task 1: Add Approved Factory Assets and Verified Company Data

**Files:**
- Create: `public/assets/factory-exterior.webp`
- Create: `public/assets/factory-workshop.webp`
- Create: `public/assets/factory-production-floor.webp`
- Create: `public/assets/factory-quality-lab.webp`
- Modify: `src/data/company.ts`
- Modify: `src/data/site.ts`
- Test: `src/data/company.test.ts`
- Test: `src/data/site.test.ts`

**Interfaces:**
- Consumes: approved slide 3 images and slide 10 contact data from `临空供需对接会主题分享-星沣(3).pptx`.
- Produces: `companyFacts`, `companyGallery`, and centralized `siteConfig` contact fields used by React and static rendering.

- [ ] **Step 1: Write failing tests for verified facts and contact fields**

```ts
import { describe, expect, it } from 'vitest'
import { companyFacts, companyGallery } from './company'

describe('verified company evidence', () => {
  it('publishes the approved facility facts', () => {
    expect(companyFacts).toMatchObject({
      founded: '2008',
      facilityArea: 'Approximately 7,000 square meters',
      gearWorkshopArea: 'Approximately 4,000 square meters',
      beltWorkshopArea: 'Approximately 2,500 square meters',
    })
  })

  it('uses approved local factory evidence', () => {
    expect(companyGallery).toHaveLength(4)
    expect(companyGallery.every(({ src }) => src.startsWith('/assets/factory-'))).toBe(true)
  })
})
```

```ts
import { describe, expect, it } from 'vitest'
import { siteConfig } from './site'

it('keeps export contact details in one configuration', () => {
  expect(siteConfig).toMatchObject({
    rfqEmail: 'inquiries@sinfogear.com',
    email: 'info@sinof.net',
    businessContact: 'Chen Shouyu',
    mobile: '+86 159 7312 7000',
  })
})
```

- [ ] **Step 2: Run the tests and confirm the new fields are missing**

Run: `node node_modules/vitest/vitest.mjs run src/data/company.test.ts src/data/site.test.ts`

Expected: FAIL because `companyGallery`, `beltWorkshopArea`, and the new contact fields do not exist.

- [ ] **Step 3: Extract and compress the approved images**

Open the presentation read-only through PowerPoint automation, export the four approved slide 3 picture shapes at their native crop, then convert them to WebP at a maximum long edge of 1,920 pixels and quality 82. Use descriptive filenames listed above. Do not export the event template background or event logos.

- [ ] **Step 4: Add the typed facts and gallery data**

Add:

```ts
export const companyGallery = [
  { src: '/assets/factory-exterior.webp', alt: 'SINOF factory exterior in Changsha' },
  { src: '/assets/factory-workshop.webp', alt: 'SINOF transmission manufacturing workshop' },
  { src: '/assets/factory-production-floor.webp', alt: 'SINOF gear production floor and CNC equipment' },
  { src: '/assets/factory-quality-lab.webp', alt: 'SINOF temperature-controlled gear inspection laboratory' },
] as const
```

Add `beltWorkshopArea`, `rfqEmail`, `businessContact`, and `mobile` to their existing typed configuration objects. Preserve the existing office phones and address.

- [ ] **Step 5: Run the focused tests**

Run: `node node_modules/vitest/vitest.mjs run src/data/company.test.ts src/data/site.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the evidence data and assets**

```bash
git add public/assets/factory-*.webp src/data/company.ts src/data/company.test.ts src/data/site.ts src/data/site.test.ts
git commit -m "feat: add verified factory evidence"
```

---

### Task 2: Add the Worm Gears Product Across Data, Localization, and RFQ

**Files:**
- Create: `public/assets/worm-gears.webp`
- Modify: `src/data/products.ts`
- Modify: `src/data/productTranslations.ts`
- Modify: `src/data/site.ts`
- Modify: `src/data/products.test.ts`
- Modify: `src/lib/inquiry.test.ts`
- Modify: `src/pages/ProductDetailPage.test.tsx`
- Modify: `src/pages/contentSafety.test.tsx`

**Interfaces:**
- Consumes: the existing `Product`, `ProductSlug`, localized product, shared product-page, and RFQ-prefill contracts.
- Produces: slug `worm-gears`, a full English product record, four complete translations, a public route, and a valid RFQ option.

- [ ] **Step 1: Write failing route and data tests**

Add assertions that:

```ts
expect(productSlugs).toContain('worm-gears')
expect(getProductBySlug('worm-gears')?.seo.title).toContain('Worm Gears')
expect(publicRoutes).toContain('/products/worm-gears')
expect(parseProductPrefill('?product=worm-gears')).toBe('worm-gears')
```

Extend the localized-product matrix so every supported non-English language must provide all `Product` display fields for `worm-gears`. Extend the product-detail route matrix to render `/products/worm-gears` with its H1 and RFQ link.

- [ ] **Step 2: Run the focused tests and confirm the slug is rejected**

Run: `node node_modules/vitest/vitest.mjs run src/data/products.test.ts src/lib/inquiry.test.ts src/pages/ProductDetailPage.test.tsx src/pages/contentSafety.test.tsx`

Expected: FAIL because `worm-gears` is absent.

- [ ] **Step 3: Export and compress the approved worm-gear image**

Export the worm wheel and worm image from slide 5, crop out all event-template graphics and labels, and save it as `public/assets/worm-gears.webp` at no more than 1,600 pixels wide and quality 82.

- [ ] **Step 4: Add the complete product record**

The English record must cover:

- paired worm and worm-wheel geometry;
- ratio, center distance, shaft arrangement, hand, and backlash inputs;
- steel worm and bronze/approved wheel-material review;
- heat treatment and surface finish subject to drawing review;
- bore, hub, keyway, shaft, and mounting features;
- profile, lead, pitch, runout, contact-pattern, material, and hardness inspection when specified;
- industrial machinery, positioning, lifting, actuation, and speed-reduction applications;
- two RFQ-focused FAQs;
- title `Custom Worm Gears and Worm Wheel Sets | SINOF`;
- a description between 80 and 165 characters.

- [ ] **Step 5: Add complete Chinese, German, Japanese, and Spanish translations**

Use the same cautious capability language as the English record. Do not leave English fallback values in translated customer-facing fields.

- [ ] **Step 6: Add the route and rerun tests**

Run: `node node_modules/vitest/vitest.mjs run src/data/products.test.ts src/lib/inquiry.test.ts src/pages/ProductDetailPage.test.tsx src/pages/contentSafety.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit the product increment**

```bash
git add public/assets/worm-gears.webp src/data/products.ts src/data/productTranslations.ts src/data/site.ts src/data/products.test.ts src/lib/inquiry.test.ts src/pages/ProductDetailPage.test.tsx src/pages/contentSafety.test.tsx
git commit -m "feat: add worm gear product page"
```

---

### Task 3: Generate Static HTML for Every Core Route and a Real 404

**Files:**
- Modify: `scripts/static-site.ts`
- Modify: `scripts/static-site.test.ts`
- Modify: `src/data/pages.ts`
- Modify: `src/lib/seo.ts`
- Modify: `public/_redirects`

**Interfaces:**
- Consumes: `pages`, `products`, `publicRoutes`, `companyFacts`, `siteConfig`, and existing schema builders.
- Produces: route-specific static HTML files, `404.html`, sitemap, robots, and explicit redirects without the SPA 200 catch-all.

- [ ] **Step 1: Write failing static-generation tests**

For `/`, `/about`, `/products`, every product route, `/capabilities`, `/quality`, and `/contact`, assert the generated flat file:

```ts
expect(html).toContain(`<link rel="canonical" href="https://sinfogear.com${pathname}">`)
expect(html).toMatch(/<title>[^<]+<\/title>/)
expect(html).toMatch(/<meta name="description" content="[^"]+">/)
expect(html).toMatch(/<h1[^>]*>[^<]+<\/h1>/)
expect(html).toContain('data-prerendered')
```

Also assert:

- core-route titles are unique;
- every product static page includes its product name and Product, BreadcrumbList, and FAQPage JSON-LD;
- `404.html` contains `Page Not Found`, `noindex, nofollow`, and a link home;
- `_redirects` no longer contains `/* /index.html 200`;
- legacy `/custom-gears.html` redirects to `/products/custom-gears`;
- trailing-slash redirects cover every canonical core route.

- [ ] **Step 2: Run static tests and confirm core route files are absent**

Run: `node node_modules/vitest/vitest.mjs run scripts/static-site.test.ts`

Expected: FAIL because only blog routes are generated.

- [ ] **Step 3: Introduce typed static page descriptors and renderers**

Add small focused renderers for:

- homepage proof and product links;
- About company evidence;
- Products index;
- Product detail content and FAQs;
- Capabilities;
- Quality;
- Contact details and RFQ link;
- branded 404.

Reuse `injectStaticPage`, `writeRoute`, and the existing schema builders. Add a `robots` value to `StaticPageMeta` so 404 output can explicitly use `noindex, nofollow`.

- [ ] **Step 4: Generate every route from the typed public route inventory**

Create descriptors for fixed pages and derive product descriptors from `products`. Keep blog rendering unchanged. Throw a build-time error if a public route has no generator rather than silently omitting it.

- [ ] **Step 5: Replace the catch-all redirect**

Keep explicit 301 legacy and trailing-slash rules. Remove `/* /index.html 200`. Rely on generated flat route files and `404.html` for direct requests.

- [ ] **Step 6: Run static tests**

Run: `node node_modules/vitest/vitest.mjs run scripts/static-site.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit static SEO and 404 behavior**

```bash
git add scripts/static-site.ts scripts/static-site.test.ts src/data/pages.ts src/lib/seo.ts public/_redirects
git commit -m "feat: prerender all public routes"
```

---

### Task 4: Replace Generic Trust Content Across Core Pages

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/AboutPage.tsx`
- Modify: `src/pages/CapabilitiesPage.tsx`
- Modify: `src/pages/QualityPage.tsx`
- Modify: `src/pages/ContactPage.tsx`
- Modify: `src/i18n/siteTranslations.ts`
- Modify: `src/pages/AboutPage.test.tsx`
- Create: `src/pages/TrustContent.test.tsx`
- Modify: `src/pages/ContactPage.test.tsx`

**Interfaces:**
- Consumes: `companyFacts`, `companyGallery`, `companyProfile`, and `siteConfig`.
- Produces: visible verified proof, real images, confirmed industries, supporting conveyor-system language, and consistent direct contact details.

- [ ] **Step 1: Write failing page-content tests**

Assert that the English pages render:

- homepage: `Founded in 2008`, `Approximately 7,000 square meters`, and the real exterior image;
- About: all four gallery images, gear and belt workshop areas, equipment, lab, ISO 9001, and enterprise recognition;
- Capabilities: real production-floor image plus hobbing, shaping, grinding, CNC machining, and supporting conveyor-system experience;
- Quality: real laboratory image plus ISO 9001 and controlled-laboratory text;
- Contact: both email roles, Chen Shouyu, mobile, office phone, and address.

Also assert every below-fold gallery image has `loading="lazy"` and meaningful alt text.

- [ ] **Step 2: Run the page tests and confirm the new proof is missing**

Run: `node node_modules/vitest/vitest.mjs run src/pages/AboutPage.test.tsx src/pages/TrustContent.test.tsx src/pages/ContactPage.test.tsx`

Expected: FAIL on the new proof and image assertions.

- [ ] **Step 3: Update the homepage and About page**

Keep existing CTAs and product hierarchy. Replace generic factory imagery, add the compact proof strip, add the eight confirmed industries, and render the four-image company gallery. Use `companyFacts` rather than duplicating numeric strings in JSX.

- [ ] **Step 4: Update Capabilities and Quality**

Show real approved images and verified equipment/laboratory evidence. Keep project-specific precision and document scope conditional on drawing and quotation review. Add one short supporting statement that belt conveyor equipment experience can inform integrated transmission and conveying discussions, without adding a route or primary CTA.

- [ ] **Step 5: Update Contact and remove obsolete copy**

Replace `Production API pending` with customer-facing secure inquiry guidance. Show RFQ email, general email, business contact, mobile/WeChat, office phones, and address. Preserve form behavior and prefill.

- [ ] **Step 6: Add complete translations for new shared phrases**

Provide Chinese, German, Japanese, and Spanish values for every new string passed through `text()` or `t()`. Extend the existing message-completeness test if necessary.

- [ ] **Step 7: Run page and translation tests**

Run: `node node_modules/vitest/vitest.mjs run src/pages/AboutPage.test.tsx src/pages/TrustContent.test.tsx src/pages/ContactPage.test.tsx src/i18n/messages.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit the trust-content update**

```bash
git add src/pages/HomePage.tsx src/pages/AboutPage.tsx src/pages/CapabilitiesPage.tsx src/pages/QualityPage.tsx src/pages/ContactPage.tsx src/i18n/siteTranslations.ts src/pages/AboutPage.test.tsx src/pages/TrustContent.test.tsx src/pages/ContactPage.test.tsx
git commit -m "feat: publish verified factory trust content"
```

---

### Task 5: Add Analytics-Ready Page and Inquiry Events

**Files:**
- Create: `src/analytics/tracking.ts`
- Create: `src/analytics/tracking.test.ts`
- Create: `src/analytics/RouteTracker.tsx`
- Create: `src/analytics/RouteTracker.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/InquiryForm.tsx`
- Modify: `src/pages/ContactPage.test.tsx`
- Create: `src/vite-env.d.ts`

**Interfaces:**
- Produces: `initializeTracking()`, `trackPageView(pathname: string)`, and `trackInquirySubmitted(reference: string, product: string)`.
- Consumes: optional `VITE_GTM_ID` and `VITE_GA_MEASUREMENT_ID` build-time variables.

- [ ] **Step 1: Write failing no-op and event tests**

Cover these behaviors with real DOM assertions:

```ts
expect(initializeTracking({})).toBe(false)
expect(document.querySelector('script[data-sinof-analytics]')).toBeNull()
```

When a GTM ID exists, assert one script is inserted and a page-view object is pushed to `window.dataLayer`. When only a GA measurement ID exists, assert the gtag loader and configuration are created once. Assert inquiry conversion is not emitted after a rejected submitter and is emitted once after a successful submitter response.

- [ ] **Step 2: Run focused tests and confirm the module is absent**

Run: `node node_modules/vitest/vitest.mjs run src/analytics/tracking.test.ts src/analytics/RouteTracker.test.tsx src/pages/ContactPage.test.tsx`

Expected: FAIL because the analytics module and event calls do not exist.

- [ ] **Step 3: Implement isolated no-op tracking**

Define a typed configuration reader. Guard all DOM and `window` access. Mark injected scripts with `data-sinof-analytics`. Prefer GTM when both IDs exist, and do not insert duplicate scripts on remount.

- [ ] **Step 4: Track React route changes**

Render `RouteTracker` inside the router and emit pathname plus search string after navigation. Do not include form values or personal information.

- [ ] **Step 5: Emit conversion only after server success**

Call `trackInquirySubmitted(response.reference, values.product)` only after `submitter(values)` resolves. Do not send name, email, company, message, country, phone, or drawing filename.

- [ ] **Step 6: Run analytics and contact tests**

Run: `node node_modules/vitest/vitest.mjs run src/analytics/tracking.test.ts src/analytics/RouteTracker.test.tsx src/pages/ContactPage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit analytics readiness**

```bash
git add src/analytics src/App.tsx src/components/InquiryForm.tsx src/pages/ContactPage.test.tsx src/vite-env.d.ts
git commit -m "feat: add analytics-ready conversion events"
```

---

### Task 6: Full Verification, Visual QA, and Production Deployment

**Files:**
- Modify only if verification reveals an in-scope defect.

**Interfaces:**
- Consumes: the completed application and Cloudflare Pages project `sinoform`.
- Produces: a verified production deployment without changing secrets.

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
node node_modules/vitest/vitest.mjs run
node node_modules/eslint/bin/eslint.js src functions scripts
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
node node_modules/vite/bin/vite.js build --ssr scripts/static-site-cli.ts --outDir dist-ssr --emptyOutDir
node dist-ssr/static-site-cli.js
```

Expected: all tests pass, lint exits 0, TypeScript exits 0, and both builds complete.

- [ ] **Step 2: Inspect generated crawler output**

Verify every sitemap URL maps to a generated HTML file with unique title, description, canonical, H1, and expected JSON-LD. Verify `dist/404.html`, `dist/sitemap.xml`, `dist/robots.txt`, and copied redirect rules.

- [ ] **Step 3: Perform visual QA**

Review desktop and mobile at minimum for `/`, `/about`, `/products/worm-gears`, `/capabilities`, `/quality`, and `/contact`. Check image crops, alt text, wrapping, responsive grids, navigation, form prefill, and absence of duplicate static content after React mounts.

- [ ] **Step 4: Deploy a Cloudflare preview**

Run: `wrangler pages deploy dist --project-name sinoform --branch site-seo-trust-upgrade`

Verify the preview before production. Do not alter Pages environment variables.

- [ ] **Step 5: Deploy production**

Run: `wrangler pages deploy dist --project-name sinoform --branch main`

- [ ] **Step 6: Run live acceptance checks**

Confirm:

- `/`, `/about`, `/products/worm-gears`, `/capabilities`, `/quality`, and `/contact` return 200 with route-specific source title, description, canonical, and H1;
- a nonexistent URL returns 404 with the branded page;
- `/sitemap.xml` is XML and contains all public routes once;
- `/robots.txt` names the canonical sitemap;
- `/blog/` and legacy `.html` routes return the expected 301;
- GET `/api/inquiries` returns 405, proving Pages Functions remain active;
- a test inquiry is not submitted unless explicitly authorized, because it sends a real external email.

- [ ] **Step 7: Commit any verification-only fixes and record the deployed commit**

If no fixes are needed, do not create an empty commit. Report the exact commit hash and Cloudflare production deployment URL.
