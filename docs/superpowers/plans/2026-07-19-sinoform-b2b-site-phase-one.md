# SINOFORM B2B Website Phase One Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing SINOFORM single-page demo into a data-driven, responsive, SEO-ready multi-page B2B website with a validated mock RFQ workflow.

**Architecture:** React Router maps the eleven required URLs into a shared site layout and focused page components. Products, page copy, SEO, contact options, and structured data are driven by typed modules; one product detail template renders every product route. Pure functions own language selection, metadata generation, form validation, and mock submission so behavior can be tested independently.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 3, React Router 7, Vitest, Testing Library, jsdom, ESLint.

## Global Constraints

- Preserve the existing blue industrial visual style and reuse existing components and imagery where suitable.
- Retain React, TypeScript, Vite, Tailwind CSS, and the English/German/Japanese/Spanish/Chinese language structure.
- Complete English content is authoritative; unreviewed translations fall back to English.
- Do not publish unverified certifications, contact details, addresses, factory metrics, customer metrics, export metrics, capacity figures, delivery promises, or equipment counts.
- Canonical URLs default to `https://www.sinoforce.net` and allow `VITE_SITE_URL` override.
- Product detail routes must share one template and read from independent configuration.
- Phase-one drawing selection is a local placeholder; file bytes are not uploaded.
- The production inquiry API integration boundary must be isolated and documented.

---

## File Structure

- `src/data/site.ts`: confirmed site identity, routes, locale list, canonical configuration.
- `src/data/products.ts`: typed records for all six product categories.
- `src/data/pages.ts`: English page copy, navigation, shared labels, and page SEO.
- `src/i18n/language.ts`: pure locale detection, persistence, and fallback helpers.
- `src/i18n/LanguageContext.tsx`: React language state built on the pure helpers.
- `src/lib/seo.ts`: metadata and JSON-LD builders.
- `src/lib/inquiry.ts`: RFQ types, validation, product query parsing.
- `src/services/inquiryApi.ts`: local mock submission and future API replacement boundary.
- `src/components/Seo.tsx`: document metadata and JSON-LD lifecycle.
- `src/components/SiteLayout.tsx`: common page chrome and scroll restoration.
- `src/components/ProductCard.tsx`: reusable product-index card.
- `src/components/PageHero.tsx`: shared internal-page hero.
- `src/components/InquiryForm.tsx`: validated RFQ form and status UI.
- `src/pages/HomePage.tsx`: retained home visual sections with verified copy.
- `src/pages/ProductsPage.tsx`: six-product index.
- `src/pages/ProductDetailPage.tsx`: one template for every product slug.
- `src/pages/CapabilitiesPage.tsx`: drawing-led manufacturing capability page.
- `src/pages/QualityPage.tsx`: verification and documentation page.
- `src/pages/ContactPage.tsx`: RFQ page and query-string prefill.
- `src/pages/NotFoundPage.tsx`: recoverable noindex page.
- `src/test/setup.ts`: browser test setup.
- `src/**/*.test.ts(x)`: focused behavior tests.
- `PROJECT_STRUCTURE.md`: architecture, API handoff, and business-data checklist.

---

### Task 1: Establish Test Infrastructure and Baseline

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`

**Interfaces:**
- Consumes: existing Vite configuration and npm lockfile.
- Produces: `npm test`, jsdom environment, and Testing Library matchers for later tasks.

- [ ] **Step 1: Install existing dependencies**

Run: `npm install`

Expected: dependency installation exits with code 0 and preserves the existing lockfile format.

- [ ] **Step 2: Add test dependencies**

Run: `npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`

Expected: `package.json` and `package-lock.json` contain the test packages.

- [ ] **Step 3: Write the failing smoke test**

```ts
import { describe, expect, it } from 'vitest'

describe('test environment', () => {
  it('provides a browser document', () => {
    expect(document.documentElement).toBeInstanceOf(HTMLElement)
  })
})
```

- [ ] **Step 4: Run the smoke test before configuring jsdom**

Run: `npx vitest run src/test/smoke.test.ts`

Expected: FAIL because `document` is unavailable.

- [ ] **Step 5: Configure the test environment**

Add `test: "vitest run"` and `test:watch: "vitest"` scripts. Configure Vite with `test.environment = "jsdom"` and `setupFiles = "./src/test/setup.ts"`. Import `@testing-library/jest-dom/vitest` from the setup file.

- [ ] **Step 6: Verify the smoke test**

Run: `npm test -- src/test/smoke.test.ts`

Expected: 1 test passes.

- [ ] **Step 7: Record the baseline**

Commit: `test: add browser test infrastructure`

---

### Task 2: Build the Typed Content and Language Foundation

**Files:**
- Create: `src/data/site.ts`
- Create: `src/data/products.ts`
- Create: `src/data/pages.ts`
- Create: `src/i18n/language.ts`
- Modify: `src/i18n/LanguageContext.tsx`
- Test: `src/data/products.test.ts`
- Test: `src/i18n/language.test.ts`

**Interfaces:**
- Produces: `Product`, `ProductSlug`, `products`, `getProductBySlug`, `supportedLanguages`, `resolveInitialLanguage`, `getLocalizedValue`.
- Consumes: browser language and local storage only through injected values in pure helpers.

- [ ] **Step 1: Write failing product-data tests**

Assert that the slugs exactly equal:

```ts
[
  'spur-gears',
  'helical-gears',
  'bevel-gears',
  'timing-pulleys',
  'gear-racks',
  'custom-gears',
]
```

For every product, assert non-empty name, value proposition, image, features, materials, precision, customization, industries, inspection, FAQ, and SEO fields.

- [ ] **Step 2: Verify product tests fail**

Run: `npm test -- src/data/products.test.ts`

Expected: FAIL because `src/data/products.ts` does not exist.

- [ ] **Step 3: Implement typed product data**

Create a `Product` interface and six English records. Use drawing-review language for precision, materials, and manufacturing scope. Reuse the closest existing local asset while adding two clearly named local product images only if suitable source assets are available.

- [ ] **Step 4: Verify product tests pass**

Run: `npm test -- src/data/products.test.ts`

Expected: all product-data tests pass.

- [ ] **Step 5: Write failing language tests**

Test browser mappings for `en-US`, `de-DE`, `ja-JP`, `es-MX`, and `zh-CN`; unsupported locales return English; a saved supported choice overrides browser language; missing translated values return English.

- [ ] **Step 6: Verify language tests fail**

Run: `npm test -- src/i18n/language.test.ts`

Expected: FAIL because the pure language helpers do not exist.

- [ ] **Step 7: Implement language helpers and provider**

Implement:

```ts
resolveInitialLanguage(saved: string | null, browserLanguages: readonly string[]): Lang
getLocalizedValue<T>(values: Partial<Record<Lang, T>>, lang: Lang): T
```

Persist manual selections under `sinoform-language`. Expose a country-code adapter function without making network calls.

- [ ] **Step 8: Verify language tests pass**

Run: `npm test -- src/i18n/language.test.ts`

Expected: all language tests pass.

- [ ] **Step 9: Commit the content foundation**

Commit: `feat: add verified product content and language fallback`

---

### Task 3: Add SEO and Structured-Data Builders

**Files:**
- Create: `src/lib/seo.ts`
- Create: `src/components/Seo.tsx`
- Test: `src/lib/seo.test.ts`

**Interfaces:**
- Consumes: `PageSeo`, `Product`, route pathname, and canonical base URL.
- Produces: `buildCanonicalUrl`, `buildOrganizationSchema`, `buildProductSchema`, `buildBreadcrumbSchema`, `buildFaqSchema`, and `<Seo />`.

- [ ] **Step 1: Write failing SEO tests**

Test canonical normalization, Organization limited to name and URL, Product without offers or ratings, visible FAQ mapping, and ordered product breadcrumbs.

- [ ] **Step 2: Verify SEO tests fail**

Run: `npm test -- src/lib/seo.test.ts`

Expected: FAIL because SEO builders do not exist.

- [ ] **Step 3: Implement SEO builders**

Build JSON-serializable schema objects with only confirmed data. Strip trailing slashes from the base URL and ensure the home canonical retains one root slash.

- [ ] **Step 4: Verify SEO tests pass**

Run: `npm test -- src/lib/seo.test.ts`

Expected: all SEO-builder tests pass.

- [ ] **Step 5: Implement the metadata lifecycle component**

`Seo` updates title, description, canonical, Open Graph fields, robots, and a single route-specific JSON-LD script. Cleanup removes the JSON-LD script when the route changes.

- [ ] **Step 6: Commit SEO support**

Commit: `feat: add route metadata and structured data`

---

### Task 4: Introduce Routing, Shared Layout, and Real Navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Create: `src/components/SiteLayout.tsx`
- Create: `src/components/PageHero.tsx`
- Modify: `src/sections/Header.tsx`
- Modify: `src/sections/Footer.tsx`
- Modify: `src/sections/FloatingCta.tsx`
- Create: `src/pages/NotFoundPage.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: route and navigation configuration from `src/data/site.ts` and `src/data/pages.ts`.
- Produces: all requested route matches, real `<Link>` navigation, mobile menu behavior, and noindex fallback.

- [ ] **Step 1: Write failing route tests**

Use `MemoryRouter` to assert the products, capabilities, quality, contact, one valid product route, and an unknown route render distinct page headings.

- [ ] **Step 2: Verify route tests fail**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because the app still renders a single page.

- [ ] **Step 3: Implement the router and shared layout**

Declare all eleven requested routes plus `*`. Keep the language provider outside the route tree. Add scroll restoration on pathname changes.

- [ ] **Step 4: Convert navigation to links**

Replace section-scroll controls with route links. Add an accessible mobile drawer whose open state closes on route navigation.

- [ ] **Step 5: Verify route tests pass**

Run: `npm test -- src/App.test.tsx`

Expected: route tests pass.

- [ ] **Step 6: Commit routing**

Commit: `feat: add multi-page routing and navigation`

---

### Task 5: Implement the Products Index and Shared Product Template

**Files:**
- Create: `src/components/ProductCard.tsx`
- Create: `src/pages/ProductsPage.tsx`
- Create: `src/pages/ProductDetailPage.tsx`
- Test: `src/pages/ProductDetailPage.test.tsx`

**Interfaces:**
- Consumes: `products`, `getProductBySlug`, `<Seo />`, and route parameters.
- Produces: six product cards and one complete template for every product route.

- [ ] **Step 1: Write the failing product-template test**

Render the spur-gear route and assert the page displays the product name, value proposition, image, features, materials, precision, customization, industries, inspection, FAQ, breadcrumbs, and RFQ link containing `product=spur-gears`.

- [ ] **Step 2: Verify the template test fails**

Run: `npm test -- src/pages/ProductDetailPage.test.tsx`

Expected: FAIL because the shared product template does not exist.

- [ ] **Step 3: Implement products index and detail template**

Build cards from `products.map`. Resolve the detail record from the route slug and redirect invalid product slugs to the not-found presentation. Use existing industrial card, badge, accordion, and button styles.

- [ ] **Step 4: Verify the product-template test passes**

Run: `npm test -- src/pages/ProductDetailPage.test.tsx`

Expected: all product template assertions pass.

- [ ] **Step 5: Commit product pages**

Commit: `feat: add data-driven product pages`

---

### Task 6: Build Capabilities, Quality, and Refined Home Pages

**Files:**
- Create: `src/pages/HomePage.tsx`
- Create: `src/pages/CapabilitiesPage.tsx`
- Create: `src/pages/QualityPage.tsx`
- Modify: `src/sections/Hero.tsx`
- Modify: `src/sections/Products.tsx`
- Modify: `src/sections/Capabilities.tsx`
- Modify: `src/sections/Quality.tsx`
- Modify: `src/sections/Industries.tsx`
- Modify: `src/sections/Process.tsx`
- Modify: `src/sections/Faq.tsx`
- Test: `src/pages/contentSafety.test.tsx`

**Interfaces:**
- Consumes: verified page content, product records, and shared layout components.
- Produces: three finished pages and a home page free of unverified business claims.

- [ ] **Step 1: Write the failing content-safety test**

Render the main public pages and assert they do not contain the removed certification names, fabricated address, phone, export-country count, equipment count, annual-parts count, or delivery-rate claim from the demo.

- [ ] **Step 2: Verify the content-safety test fails**

Run: `npm test -- src/pages/contentSafety.test.tsx`

Expected: FAIL because the existing home sections still display unverified claims.

- [ ] **Step 3: Implement verified pages and revise reused sections**

Keep the current industrial composition while replacing claims with drawing-led, non-quantified buyer guidance. Home actions navigate to products, capabilities, and contact.

- [ ] **Step 4: Verify the content-safety test passes**

Run: `npm test -- src/pages/contentSafety.test.tsx`

Expected: all prohibited-claim assertions pass.

- [ ] **Step 5: Commit company pages**

Commit: `feat: add verified capability and quality pages`

---

### Task 7: Implement Inquiry Validation, Prefill, and Mock Submission

**Files:**
- Create: `src/lib/inquiry.ts`
- Create: `src/services/inquiryApi.ts`
- Create: `src/components/InquiryForm.tsx`
- Create: `src/pages/ContactPage.tsx`
- Test: `src/lib/inquiry.test.ts`
- Test: `src/services/inquiryApi.test.ts`
- Test: `src/pages/ContactPage.test.tsx`

**Interfaces:**
- Produces: `InquiryValues`, `InquiryErrors`, `validateInquiry`, `parseProductPrefill`, `submitInquiry`.
- Consumes: product slugs and a mock failure switch injected into `submitInquiry`.

- [ ] **Step 1: Write failing validation and prefill tests**

Test required name, company, email, country, product, and message; invalid email; valid submission; valid product slug prefill; and invalid slug rejection.

- [ ] **Step 2: Verify inquiry helper tests fail**

Run: `npm test -- src/lib/inquiry.test.ts`

Expected: FAIL because inquiry helpers do not exist.

- [ ] **Step 3: Implement inquiry helpers**

Return field-level error keys from a pure validator. Resolve product prefill only when it matches a configured slug.

- [ ] **Step 4: Verify inquiry helper tests pass**

Run: `npm test -- src/lib/inquiry.test.ts`

Expected: all helper tests pass.

- [ ] **Step 5: Write failing mock API tests**

Test success returns an `SF-` reference and forced failure rejects with a user-safe error.

- [ ] **Step 6: Verify mock API tests fail**

Run: `npm test -- src/services/inquiryApi.test.ts`

Expected: FAIL because the service does not exist.

- [ ] **Step 7: Implement the mock service**

Export an async function that accepts typed values and an optional `{ forceFailure?: boolean }` testing option. Add a module comment naming the future `fetch("/api/inquiries")` replacement boundary. Do not persist personal data in local storage.

- [ ] **Step 8: Verify mock API tests pass**

Run: `npm test -- src/services/inquiryApi.test.ts`

Expected: all service tests pass.

- [ ] **Step 9: Write the failing contact-page interaction test**

Render `/contact?product=helical-gears`, assert preselection, fill required fields, submit, and assert success. Force a service failure in a separate test and assert retry UI.

- [ ] **Step 10: Verify contact-page tests fail**

Run: `npm test -- src/pages/ContactPage.test.tsx`

Expected: FAIL because the contact page and form do not exist.

- [ ] **Step 11: Implement the contact page and form**

Include all requested controls, drawing-file name display, accessible errors, submitting state, success state, failure state, and retry.

- [ ] **Step 12: Verify contact-page tests pass**

Run: `npm test -- src/pages/ContactPage.test.tsx`

Expected: all form interaction tests pass.

- [ ] **Step 13: Commit the RFQ workflow**

Commit: `feat: add validated mock inquiry workflow`

---

### Task 8: Finish Metadata, Documentation, Responsive Review, and Production Verification

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`
- Create: `.env.example`
- Create: `PROJECT_STRUCTURE.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: complete route and content implementation.
- Produces: clean entry metadata, configuration example, handoff documentation, and verified production build.

- [ ] **Step 1: Remove unsafe static metadata**

Keep only charset, viewport, favicon, and neutral initial SINOFORM metadata in `index.html`; route metadata is owned by `<Seo />`.

- [ ] **Step 2: Add configuration and handoff documentation**

Document:

```env
VITE_SITE_URL=https://www.sinoforce.net
VITE_INQUIRY_API_URL=
```

Explain the route tree, data modules, language fallback, mock service replacement, drawing upload limitation, and all business information required before launch.

- [ ] **Step 3: Run the full automated suite**

Run: `npm test`

Expected: every test passes with zero failures.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Expected: exits with code 0 and no ESLint errors.

- [ ] **Step 5: Run the production build**

Run: `npm run build`

Expected: TypeScript and Vite both exit with code 0 and create `dist/`.

- [ ] **Step 6: Audit routes and prohibited claims**

Run:

```powershell
rg -n "ISO 9001|IATF|45\\+|120\\+|8M\\+|98\\.6%|No\\. 88|8888 6666|sales@sinoform" src index.html
```

Expected: no rendered core-copy or metadata matches.

- [ ] **Step 7: Review responsive composition**

Verify header, products grid, one product detail page, and contact form at 320 px, 768 px, and 1440 px layout widths. Correct overflow, clipping, and touch-target issues without changing the design language.

- [ ] **Step 8: Commit final handoff**

Commit: `docs: add SINOFORM launch handoff`
