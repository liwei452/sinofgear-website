# SINOF Procurement-Led Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the SINOF public website around overseas buyer decisions while preserving routes, SEO, inquiry behavior, analytics, and multilingual support.

**Architecture:** Add small data modules for buyer navigation and product families, then use them in a redesigned shared header, homepage, product index, and shared page surfaces. Existing product data, route structure, inquiry services, and backend contracts remain authoritative.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS 3, Radix/shadcn components, Vitest, Testing Library, Vite static pre-rendering.

**Spec:** `docs/superpowers/specs/2026-08-26-procurement-led-site-redesign-design.md`

## Global Constraints

- Preserve every existing public route and product slug.
- Do not change inquiry form field names, field order, API payloads, analytics events, or customer-service integration.
- Preserve the SINOF logo, legal identity, multilingual behavior, and `wei.li@sinofgears.com`.
- Use generated imagery only for non-evidentiary editorial support.
- Use one light theme, one engineering-blue accent, and one restrained radius system.
- Keep motion at 3/10 and honor `prefers-reduced-motion`.
- Do not add new dependencies.

---

### Task 1: Buyer navigation and product-family data

**Files:**
- Create: `src/data/navigation.ts`
- Create: `src/data/productFamilies.ts`
- Create: `src/data/productFamilies.test.ts`
- Modify: `src/data/site.ts`

**Interfaces:**
- Produces: `primaryNavigation`, `productNavigationGroups`, `applicationNavigationGroups`.
- Produces: `productFamilies`, `productsForFamily(familyId)`.
- Consumes: existing product slugs and existing industry/need routes.

- [ ] **Step 1: Write a failing test for product-family coverage**

Assert that every current product slug appears in exactly one family and that `custom-gears` is the first family.

- [ ] **Step 2: Run the test and confirm it fails because the data module does not exist**

Run: `npm test -- src/data/productFamilies.test.ts`

- [ ] **Step 3: Implement the three product families and buyer navigation**

The families are `custom-gears`, `timing-drive`, and `industrial-belts`. Navigation points only to existing routes.

- [ ] **Step 4: Run the targeted test and existing site-data tests**

Run: `npm test -- src/data/productFamilies.test.ts src/data/site.test.ts`

### Task 2: Shared visual tokens and page shell

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.js`
- Modify: `src/components/SiteLayout.tsx`
- Modify: `src/components/PageHero.tsx`
- Modify: `src/sections/FloatingCta.tsx`

**Interfaces:**
- Produces: shared editorial surface classes and bright page header behavior.
- Preserves: layout route outlet, route scroll reset, and contact CTA destination.

- [ ] **Step 1: Add a failing render test for the bright page hero and accessible CTA shell**

Extend `src/test/react-smoke.test.tsx` to assert the page hero renders as a labelled banner without the retired dark steel class.

- [ ] **Step 2: Run the targeted test and confirm the retired implementation fails it**

Run: `npm test -- src/test/react-smoke.test.tsx`

- [ ] **Step 3: Recalibrate color, radius, shadow, focus, and typography tokens**

Keep the existing Tailwind and shadcn token architecture. Remove decorative loop animation and provide reduced-motion-safe transitions.

- [ ] **Step 4: Recompose PageHero and FloatingCta**

Use a light technical surface, left-aligned editorial copy, and a rectangular drawing-review CTA on large screens with an accessible compact mobile treatment.

- [ ] **Step 5: Run the targeted test**

Run: `npm test -- src/test/react-smoke.test.tsx`

### Task 3: Buyer-centered responsive header and footer

**Files:**
- Create: `src/sections/Header.test.tsx`
- Modify: `src/sections/Header.tsx`
- Modify: `src/sections/Footer.tsx`

**Interfaces:**
- Consumes: navigation data from Task 1.
- Preserves: language selection, logo, routes, contact destination, and direct contact details.

- [ ] **Step 1: Write failing tests for desktop buyer navigation and the mobile hierarchy**

Assert that Products, Applications, Manufacturing, Quality, Resources, Company, and Submit Drawing are reachable, and that product/application groups contain valid current links.

- [ ] **Step 2: Run the tests and confirm they fail against the current flat navigation**

Run: `npm test -- src/sections/Header.test.tsx`

- [ ] **Step 3: Implement the desktop mega-menu and mobile accordion sheet**

Use Radix navigation primitives already installed. Do not add horizontal mobile scrolling.

- [ ] **Step 4: Recompose the footer around product families, buyer routes, and verified direct contact**

Do not alter legal or contact values.

- [ ] **Step 5: Run header, footer, and language tests**

Run: `npm test -- src/sections/Header.test.tsx src/sections/Footer.test.tsx src/i18n/LanguageContext.test.tsx`

### Task 4: Homepage decision journey

**Files:**
- Create: `src/pages/HomePage.test.tsx`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/data/pages.ts`

**Interfaces:**
- Consumes: product families, application links, company facts, company gallery, and existing translation fallback.
- Preserves: homepage SEO route, canonical behavior, and contact/product links.

- [ ] **Step 1: Write failing tests for the buyer-selector hero and seven-section journey**

Assert the primary drawing CTA, product and application entry paths, verified fact labels, three product families, manufacturing evidence, quality planning, and review workflow. Assert that twelve equal product cards are not rendered on the homepage.

- [ ] **Step 2: Run the test and confirm the current catalog-wall homepage fails it**

Run: `npm test -- src/pages/HomePage.test.tsx`

- [ ] **Step 3: Implement the asymmetric hero and two buyer entry paths**

Use the real current hero image initially. Keep hero copy within the viewport and route both entry paths to current destinations.

- [ ] **Step 4: Implement verified facts, product families, applications, manufacturing evidence, quality planning, and drawing review**

Use only values from `companyFacts`, `companyGallery`, and current page data.

- [ ] **Step 5: Run the homepage and SEO tests**

Run: `npm test -- src/pages/HomePage.test.tsx src/components/Seo.test.tsx src/lib/seo.test.ts`

### Task 5: Product index and reusable product cards

**Files:**
- Create: `src/pages/ProductsPage.test.tsx`
- Modify: `src/pages/ProductsPage.tsx`
- Modify: `src/components/ProductCard.tsx`

**Interfaces:**
- Consumes: `productFamilies` and `productsForFamily`.
- Preserves: every product URL, product image, localized content, and per-product inquiry link.

- [ ] **Step 1: Write a failing test for grouped product-family rendering**

Assert that all twelve products appear once under the correct three family headings and that custom gears appear first.

- [ ] **Step 2: Run the test and confirm the flat grid fails it**

Run: `npm test -- src/pages/ProductsPage.test.tsx`

- [ ] **Step 3: Implement grouped editorial product sections and simplified product cards**

Use image, product name, one-line fit statement, details link, and drawing-review link. Remove decorative badges.

- [ ] **Step 4: Run product-index and existing product-detail tests**

Run: `npm test -- src/pages/ProductsPage.test.tsx src/pages/ProductDetailPage.test.tsx src/data/products.test.ts`

### Task 6: Inner page visual convergence

**Files:**
- Modify: `src/pages/CapabilitiesPage.tsx`
- Modify: `src/pages/QualityPage.tsx`
- Modify: `src/pages/AboutPage.tsx`
- Modify: `src/pages/ContactPage.tsx`
- Modify: `src/pages/ProductDetailPage.tsx`
- Modify: `src/pages/IndustryLandingPage.tsx`
- Modify: `src/pages/blog.css`

**Interfaces:**
- Consumes: shared visual tokens and PageHero.
- Preserves: content, schemas, route behavior, inquiry form, and localization.

- [ ] **Step 1: Add failing assertions to existing page tests for preserved content inside the new shared surfaces**

Focus on accessible headings, contact form presence, direct contact email, product schema, and CTA destinations rather than CSS implementation details.

- [ ] **Step 2: Run the affected tests and confirm the missing composition behavior fails**

Run: `npm test -- src/pages/AboutPage.test.tsx src/pages/ContactPage.test.tsx src/pages/ProductDetailPage.test.tsx src/pages/BlogPages.test.tsx`

- [ ] **Step 3: Recompose the six page families using open editorial layouts**

Remove full-width dark gradient panels and repeated equal cards. Retain all technical and SEO content.

- [ ] **Step 4: Run the affected tests**

Run: `npm test -- src/pages/AboutPage.test.tsx src/pages/ContactPage.test.tsx src/pages/ProductDetailPage.test.tsx src/pages/BlogPages.test.tsx`

### Task 7: Optional generated hero editorial asset

**Files:**
- Create: `public/assets/sinof-precision-gear-hero-v2.webp`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Produces: non-evidentiary homepage hero media only.
- Preserves: all real evidence sections and their current images.

- [ ] **Step 1: Generate one text-free precision gear macro image**

Use the built-in image generation tool. Specify a bright neutral studio field, blue-gray engineering palette, precise machined steel, right-weighted composition, negative space for copy, no factory context, no logos, no measurement readout, no watermark, and no text.

- [ ] **Step 2: Inspect the result and reject any image that implies a specific SINOF machine, facility, report, or certification**

- [ ] **Step 3: Save the selected asset in the project and update only the homepage hero reference**

- [ ] **Step 4: Verify intrinsic dimensions and optimized output size**

Keep the final web asset below 500 KB when practical and reserve its aspect ratio to prevent layout shift.

### Task 8: Full verification and browser closure

**Files:**
- Modify only when a failing verification exposes a tested defect.

**Interfaces:**
- Validates: full public site, static generation, desktop layout, mobile layout, and critical conversion path.

- [ ] **Step 1: Run the full automated suite**

Run: `npm test`

- [ ] **Step 2: Run lint**

Run: `npm run lint`

- [ ] **Step 3: Run the production and static pre-render build**

Run: `npm run build`

- [ ] **Step 4: Start the local site and verify desktop at 1440x900**

Review home, products, one product detail, manufacturing, quality, company, contact, blog, and one industry page. Verify header, language control, links, form visibility, and no horizontal overflow.

- [ ] **Step 5: Verify mobile at 390x844**

Review the same critical pages. Confirm the mobile menu exposes every navigation group without hidden horizontal scrolling and the drawing CTA remains reachable.

- [ ] **Step 6: Capture final homepage, product index, manufacturing, and contact screenshots at both fixed sizes**

- [ ] **Step 7: Review git diff and protect unrelated user work**

Confirm `.impeccable/` remains untouched and uncommitted unless the user explicitly asks to include it.
