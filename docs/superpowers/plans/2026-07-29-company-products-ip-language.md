# Company Profile, Product Expansion, and IP Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a multilingual SINOF company profile, five additional belt and conveyor product pages, visible company contact details, and Cloudflare country-based language selection with English fallback.

**Architecture:** Keep the existing React Router layout and shared product-detail template. Store company and product content in data modules, keep country parsing in the geo-language service, and let `LanguageProvider` enforce manual choice > IP country > English. Web-optimized assets are generated from the user-supplied source package without changing the archive.

**Tech Stack:** React 19, TypeScript, React Router, Vite, Tailwind CSS, Vitest, Testing Library, Cloudflare Pages, Pillow for deterministic image optimization.

## Global Constraints

- Preserve the existing SINOF visual system and responsive layout.
- Publish the user-approved company facts exactly as scoped in the design.
- Do not invent employee, customer, export-country, equipment-count, certification-number, tolerance, lead-time, or MOQ claims.
- Do not publish the NITTA name, logo, product specifications, PDF, or branded images.
- Keep inquiry submission on the local mock adapter; email is display-only.
- Supported languages remain `en`, `zh`, `de`, `ja`, and `es`.
- Language priority is manual saved choice, then `/cdn-cgi/trace`, then English.
- Only stage and commit files belonging to the current task; preserve the pre-existing dirty worktree.

---

### Task 1: Cloudflare country detection and English fallback

**Files:**
- Modify: `src/services/geoLanguage.test.ts`
- Modify: `src/services/geoLanguage.ts`
- Modify: `src/i18n/language.test.ts`
- Modify: `src/i18n/language.ts`
- Modify: `src/i18n/LanguageContext.test.tsx`
- Modify: `src/i18n/LanguageContext.tsx`

**Interfaces:**
- Produces: `parseCloudflareTrace(value: string): string | undefined`
- Produces: `detectVisitorCountry(options?): Promise<string | undefined>`
- Produces: `resolveInitialLanguage(saved: string | null, countryCode?: string | null): Lang`
- Consumes: same-origin Cloudflare endpoint `/cdn-cgi/trace`

- [ ] **Step 1: Add failing trace parsing and endpoint tests**

Add these behaviors to `src/services/geoLanguage.test.ts`:

```ts
import {
  detectVisitorCountry,
  parseCloudflareTrace,
  parseCountryCode,
} from './geoLanguage'

it('parses the Cloudflare trace country line', () => {
  expect(parseCloudflareTrace('ip=203.0.113.8\nloc=CN\ntls=TLSv1.3\n')).toBe('CN')
  expect(parseCloudflareTrace('ip=203.0.113.8\nloc=XX\n')).toBeUndefined()
  expect(parseCloudflareTrace('ip=203.0.113.8\n')).toBeUndefined()
})

it('uses the same-origin Cloudflare trace endpoint by default', async () => {
  const fetcher = vi.fn().mockResolvedValue({
    ok: true,
    text: async () => 'ip=203.0.113.8\nloc=DE\n',
  })

  await expect(detectVisitorCountry({ fetcher: fetcher as typeof fetch }))
    .resolves.toBe('DE')
  expect(fetcher).toHaveBeenCalledWith(
    '/cdn-cgi/trace',
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  )
})
```

- [ ] **Step 2: Add failing language-priority tests**

Replace browser-locale expectations in `src/i18n/language.test.ts` with:

```ts
it('defaults to English without a saved choice or mapped country', () => {
  expect(resolveInitialLanguage(null)).toBe('en')
  expect(resolveInitialLanguage(null, 'FR')).toBe('en')
})

it('uses a mapped IP country when there is no saved choice', () => {
  expect(resolveInitialLanguage(null, 'CN')).toBe('zh')
  expect(resolveInitialLanguage(null, 'DE')).toBe('de')
})

it('keeps a saved choice ahead of IP country', () => {
  expect(resolveInitialLanguage('es', 'CN')).toBe('es')
})
```

Add a provider test proving the initial render is English and an unmapped
country remains English:

```tsx
it('starts and remains in English when IP country is unmapped', async () => {
  render(
    <LanguageProvider detectCountry={async () => 'FR'}>
      <Probe />
    </LanguageProvider>,
  )

  expect(screen.getByLabelText('language')).toHaveTextContent('en')
  await act(async () => undefined)
  expect(screen.getByLabelText('language')).toHaveTextContent('en')
})
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```powershell
pnpm exec vitest run src/services/geoLanguage.test.ts src/i18n/language.test.ts src/i18n/LanguageContext.test.tsx
```

Expected: failures for missing `parseCloudflareTrace`, the missing default
endpoint behavior, and the old browser-language fallback.

- [ ] **Step 4: Implement minimal geo parsing and default endpoint**

Implement in `src/services/geoLanguage.ts`:

```ts
const CLOUDFLARE_TRACE_ENDPOINT = '/cdn-cgi/trace'

export function parseCloudflareTrace(value: string): string | undefined {
  const countryLine = value
    .split(/\r?\n/)
    .find((line) => line.startsWith('loc='))
  const code = countryLine?.slice(4)
  return code === 'XX' ? undefined : normalizeCountryCode(code)
}
```

Make `detectVisitorCountry` default to `CLOUDFLARE_TRACE_ENDPOINT`. Preserve
the injected country shortcut. Parse JSON only for an explicitly configured
JSON endpoint; parse trace text for the default endpoint:

```ts
const target = endpoint?.trim() || CLOUDFLARE_TRACE_ENDPOINT
const response = await fetcher(target, { signal: controller.signal })
if (!response.ok) return undefined
return target === CLOUDFLARE_TRACE_ENDPOINT
  ? parseCloudflareTrace(await response.text())
  : parseCountryCode(await response.json())
```

- [ ] **Step 5: Implement English-first language resolution**

Change `resolveInitialLanguage` in `src/i18n/language.ts`:

```ts
export function resolveInitialLanguage(
  saved: string | null,
  countryCode?: string | null,
): Lang {
  if (isSupportedLanguage(saved)) return saved
  return languageFromCountryCode(countryCode) ?? 'en'
}
```

Initialize `LanguageProvider` with `resolveInitialLanguage(savedLanguage)` and
remove browser-language input. Keep the existing manual-selection guard so a
delayed country response cannot overwrite a visitor choice.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run the same focused test command. Expected: all selected test files pass with
zero failures.

- [ ] **Step 7: Commit only Task 1 files**

```powershell
git add src/services/geoLanguage.ts src/services/geoLanguage.test.ts src/i18n/language.ts src/i18n/language.test.ts src/i18n/LanguageContext.tsx src/i18n/LanguageContext.test.tsx
git commit -m "feat: detect site language from Cloudflare country"
```

---

### Task 2: Company data, About route, navigation, and SEO

**Files:**
- Create: `src/data/company.ts`
- Create: `src/pages/AboutPage.tsx`
- Create: `src/pages/AboutPage.test.tsx`
- Modify: `src/data/site.ts`
- Modify: `src/data/pages.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/sections/Header.tsx`
- Modify: `src/sections/Footer.tsx`
- Modify: `src/lib/seo.ts`
- Modify: `src/lib/seo.test.ts`
- Modify: `src/pages/contentSafety.test.tsx`
- Modify: `src/i18n/messages.ts`
- Modify: `src/i18n/siteTranslations.ts`

**Interfaces:**
- Produces: `companyProfile` with localized `en`, `zh`, `de`, `ja`, and `es`
- Produces: public route `/about`
- Produces: `buildPageBreadcrumbSchema(name, pathname, baseUrl)`
- Consumes: `siteConfig` contact and legal-company values

- [ ] **Step 1: Write failing About page and organization-schema tests**

Create `src/pages/AboutPage.test.tsx` with assertions on real output:

```tsx
it('renders approved company facts and direct contact details', () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <App />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', {
    level: 1,
    name: 'Transmission Manufacturing for Global Industry',
  })).toBeInTheDocument()
  expect(screen.getByText('Changsha Xingfeng Transmission Machinery Co., Ltd.'))
    .toBeInTheDocument()
  expect(screen.getByText(/7,000 square meters/i)).toBeInTheDocument()
  expect(screen.getByText(/GB Grade 5/i)).toBeInTheDocument()
  expect(screen.getByText(/ISO 9001/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'info@sinof.net' }))
    .toHaveAttribute('href', 'mailto:info@sinof.net')
  expect(document.title).toBe('About SINOF | Transmission Manufacturing Company')
  expect(document.querySelector('link[rel="canonical"]'))
    .toHaveAttribute('href', 'https://sinfogear.com/about')
})
```

Extend `src/lib/seo.test.ts`:

```ts
it('includes approved legal contact facts in Organization data', () => {
  expect(buildOrganizationSchema('https://sinfogear.com')).toMatchObject({
    '@type': 'Organization',
    name: 'SINOF',
    legalName: 'Changsha Xingfeng Transmission Machinery Co., Ltd.',
    foundingDate: '2008',
    email: 'info@sinof.net',
    telephone: '+86 731 8888 4918',
  })
})
```

- Update `src/pages/contentSafety.test.tsx` so the newly approved ISO 9001,
  GB Grade 5, facility, equipment, and laboratory statements are no longer
  treated as fabricated claims. Keep the test prohibiting unsupported customer
  counts, export-country counts, employee counts, and other unapproved
  assertions.

- [ ] **Step 2: Extend the route test and verify RED**

Add `['/about', 'Transmission Manufacturing for Global Industry']` to the
route matrix in `src/App.test.tsx`.

Run:

```powershell
pnpm exec vitest run src/pages/AboutPage.test.tsx src/App.test.tsx src/lib/seo.test.ts
```

Expected: `/about` renders Not Found and the Organization schema lacks the
approved fields.

- [ ] **Step 3: Add company data and site configuration**

Create `src/data/company.ts` with a `CompanyProfile` interface and complete
localized content. The English facts must use:

```ts
export const companyFacts = {
  founded: '2008',
  facilityArea: 'Approximately 7,000 square meters',
  gearWorkshopArea: 'Approximately 4,000 square meters',
  equipment: [
    'High-speed CNC gear hobbing machines',
    'CNC gear shaping machines',
    'Temperature-controlled gear grinding machines',
    'CNC machining centers',
  ],
  laboratory:
    'Class 100,000 temperature- and humidity-controlled precision gear inspection laboratory',
  gearAccuracy: 'Gear accuracy up to GB Grade 5',
  certification: 'ISO 9001 quality management system certification obtained in 2017',
  recognition:
    'High-tech enterprise and technology-based SME recognition obtained in 2020',
} as const
```

Add complete About-page translations for Chinese, German, Japanese, and
Spanish in the same module so all approved facts remain consistent by locale.

Update `siteConfig`:

```ts
legalName: 'Changsha Xingfeng Transmission Machinery Co., Ltd.',
legalNameZh: '长沙市星沣传动机械有限公司',
founded: '2008',
email: 'info@sinof.net',
phones: ['+86 731 8888 4918', '+86 731 8686 7700'],
address:
  'Third Floor, Building 16, Zone B, Huanghua Comprehensive Bonded Zone, Changsha Airport Economic and Free Trade Zone, Changsha, Hunan, China',
```

- [ ] **Step 4: Build the About page with existing visual components**

Create `AboutPage.tsx` using `Seo`, `PageHero`, existing buttons, Lucide icons,
and the approved data. Use responsive grid sections for:

- Company overview
- Facilities and equipment
- Quality and recognition
- Product scope
- Email and RFQ call-to-action

Do not create new design tokens or replace the current header/footer visual
language.

Add the route to `App.tsx`:

```tsx
<Route path="about" element={<AboutPage />} />
```

Add `{ label: 'About', href: '/about' }` to `navItems` and `/about` to
`publicRoutes`. Add `pages.about` with independent SEO in `src/data/pages.ts`.

- [ ] **Step 5: Expand Organization and breadcrumb structured data**

Update `buildOrganizationSchema` with `legalName`, `foundingDate`, `email`,
primary telephone, and a `PostalAddress`. Add:

```ts
export function buildPageBreadcrumbSchema(
  name: string,
  pathname: string,
  baseUrl: string,
): JsonLdRecord
```

Return Home and current-page list items. Pass the About breadcrumb schema to
`Seo`.

- [ ] **Step 6: Add translations and verify GREEN**

Add `About` navigation plus About-page labels to `messages.ts` and
`siteTranslations.ts`. Run:

```powershell
pnpm exec vitest run src/pages/AboutPage.test.tsx src/App.test.tsx src/lib/seo.test.ts
```

Expected: selected tests pass.

- [ ] **Step 7: Commit Task 2 files**

Stage only the files listed in Task 2 and commit:

```powershell
git commit -m "feat: add multilingual company profile"
```

---

### Task 3: Display company email on Contact and Footer

**Files:**
- Modify: `src/pages/ContactPage.test.tsx`
- Modify: `src/pages/ContactPage.tsx`
- Modify: `src/sections/Footer.tsx`
- Create: `src/sections/Footer.test.tsx`

**Interfaces:**
- Consumes: `siteConfig.email`, `siteConfig.phones`, and `siteConfig.address`
- Produces: display-only `mailto:info@sinof.net` links

- [ ] **Step 1: Write failing contact and footer tests**

Add:

```tsx
expect(screen.getByRole('link', { name: 'info@sinof.net' }))
  .toHaveAttribute('href', 'mailto:info@sinof.net')
```

Test Footer in a `MemoryRouter` and assert the same link plus the legal company
name. Do not assert that inquiry submission sends email.

- [ ] **Step 2: Run tests and verify RED**

```powershell
pnpm exec vitest run src/pages/ContactPage.test.tsx src/sections/Footer.test.tsx
```

Expected: email links are absent.

- [ ] **Step 3: Add display-only contact blocks**

Add an email contact item to the Contact page sidebar. Add legal name, email,
primary telephone, and compact address to Footer. Use `mailto:` and `tel:`
links and keep the mobile layout readable.

- [ ] **Step 4: Run tests and verify GREEN**

Run the focused tests. Expected: both files pass.

- [ ] **Step 5: Commit Task 3 files**

```powershell
git commit -m "feat: publish company contact details"
```

---

### Task 4: Optimize approved product images

**Files:**
- Create: `public/assets/rubber-timing-belts.webp`
- Create: `public/assets/polyurethane-timing-belts.webp`
- Create: `public/assets/conveyor-belts.webp`
- Create: `public/assets/flat-belts.webp`
- Create: `public/assets/round-belts.webp`
- Create: `public/assets/timing-pulleys.webp`

**Interfaces:**
- Produces: six web assets at a maximum of 1,600 × 1,200 pixels
- Consumes: original images under `C:\Users\Administrator\Documents\网站\资料包检查`

- [ ] **Step 1: Generate web-optimized copies with Pillow**

Use these sources:

- Rubber timing belts: `1橡胶同步带\橡胶同步带5M白底图1.jpg`
- Polyurethane timing belts: `2聚氨酯同步带\PU白色钢丝带.JPG`
- Conveyor belts: `3输送带\普通输送带\输送带.png`
- Flat belts: `4平面传动带\_MG_0429.JPG`
- Round belts: `5圆带\橙色圆带.jpg`
- Timing pulleys: `7同步带轮\_48A2468.jpeg`

Resize with high-quality Lanczos resampling and save WebP at quality 84. For
the round-belt source, crop the original 8,860 × 8,860 image to pixel bounds
`(1200, 4000, 7660, 8845)` before resizing. This lower product region removes
all NITTA packaging, labels, and logos. The published image must contain only
the orange round belt and neutral packaging area.

- [ ] **Step 2: Verify image dimensions, size, and prohibited branding**

Run a Pillow audit that opens every output, confirms no file exceeds
1,600 × 1,200, and confirms all files decode successfully. Visually inspect
all six outputs. Reject and regenerate any output containing `NITTA`, a third-
party logo, handwritten notes, or clipped product edges.

- [ ] **Step 3: Commit the six approved assets**

```powershell
git add public/assets/rubber-timing-belts.webp public/assets/polyurethane-timing-belts.webp public/assets/conveyor-belts.webp public/assets/flat-belts.webp public/assets/round-belts.webp public/assets/timing-pulleys.webp
git commit -m "assets: add transmission product photography"
```

---

### Task 5: Add five multilingual product configurations

**Files:**
- Modify: `src/data/products.test.ts`
- Modify: `src/data/products.ts`
- Modify: `src/data/productTranslations.ts`
- Modify: `src/pages/ProductDetailPage.test.tsx`
- Modify: `src/pages/contentSafety.test.tsx`
- Modify: `src/lib/inquiry.test.ts`
- Modify: `src/i18n/messages.ts`

**Interfaces:**
- Extends: `ProductSlug`
- Produces: five new data-driven routes through `ProductDetailPage`
- Consumes: optimized assets from Task 4

- [ ] **Step 1: Write failing product catalog tests**

Update the exact expected slug array:

```ts
expect(products.map((product) => product.slug)).toEqual([
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
])
```

Add a route matrix to `ProductDetailPage.test.tsx`:

```ts
it.each([
  ['rubber-timing-belts', 'Rubber Timing Belts'],
  ['polyurethane-timing-belts', 'Polyurethane Timing Belts'],
  ['conveyor-belts', 'Industrial Conveyor Belts'],
  ['flat-belts', 'Flat Transmission Belts'],
  ['round-belts', 'Round Belts'],
])('renders the %s configuration through the shared template', (slug, name) => {
  render(
    <MemoryRouter initialEntries={[`/products/${slug}`]}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument()
})
```

Add safety assertions:

```ts
expect(products.some((product) =>
  JSON.stringify(product).toLowerCase().includes('nitta'),
)).toBe(false)
```

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
pnpm exec vitest run src/data/products.test.ts src/pages/ProductDetailPage.test.tsx src/pages/contentSafety.test.tsx src/lib/inquiry.test.ts
```

Expected: slug list and new routes fail.

- [ ] **Step 3: Add English product entries**

Append the five slugs to `productSlugs` and add complete `Product` objects.
Use only supplied profile families:

- Rubber timing belts: MXL, XL, L, H, XH; HTD 3M/5M/8M/14M/20M;
  S2M/S3M/S5M/S8M/S14M; T2.5/T5/T10; double-sided and open-ended forms.
- Polyurethane timing belts: T2.5/T5/T10/T20; AT3/AT5/AT10;
  MXL/XL/L/H/XH; HTD 3M/5M/8M/14M; S5M/S8M/S14M;
  TK5/TK10/ATK5/ATK10; optional cleats, guides, holes, coatings, and foam.
- Conveyor belts: PU/PVC constructions and optional guides, cleats,
  sidewalls, and perforation, subject to application review.
- Flat belts: nylon-core and seamless endless forms, subject to project review.
- Round belts: round-section transmission and conveying belt inquiries,
  with diameter, length, joint, surface, and application confirmed per project.

For every entry, provide non-invented materials/construction, customization,
applications, inspection wording, two FAQs, and SEO. Replace the existing
timing-pulley image with `/assets/timing-pulleys.webp`.

- [ ] **Step 4: Add complete localized product entries**

Add Chinese, German, Japanese, and Spanish entries for all five slugs in
`productTranslations.ts`. Every localized entry must include every
`ProductTranslation` field and must not contain English fallback titles or
the NITTA name.

- [ ] **Step 5: Update inquiry prefill and localized labels**

Ensure `parseProductPrefill` accepts all new slugs through `isProductSlug`.
Add any product-related localizable section text to `messages.ts`.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run the focused command from Step 2. Expected: all selected tests pass.

- [ ] **Step 7: Commit Task 5 files**

```powershell
git commit -m "feat: expand belt and conveyor product catalog"
```

---

### Task 6: Documentation, full verification, production build, and deployment

**Files:**
- Modify: `README.md`
- Modify: `PROJECT_STRUCTURE.md`
- Verify: `dist/**`

**Interfaces:**
- Consumes: all Tasks 1-5
- Produces: Cloudflare Pages production deployment

- [ ] **Step 1: Update maintenance documentation**

Document:

- `/about` and five new product routes
- `src/data/company.ts` as the company-content source
- `info@sinof.net` as display-only
- `/cdn-cgi/trace` language priority and English fallback
- NITTA exclusion
- Source images retained outside `public/assets`

- [ ] **Step 2: Run website-scoped tests**

Use an explicit list of tests under `src` so the unrelated incomplete
`platform` workspace is not collected:

```powershell
$tests = Get-ChildItem src -Recurse -File |
  Where-Object { $_.Name -match '\.test\.(ts|tsx)$' } |
  ForEach-Object { $_.FullName }
pnpm exec vitest run @tests
```

Expected: all website tests pass with zero failures.

- [ ] **Step 3: Run source lint**

```powershell
pnpm exec eslint src
```

Expected: exit code 0 and no errors.

- [ ] **Step 4: Run production build**

```powershell
pnpm build
```

Expected: exit code 0 and a fresh `dist` directory.

- [ ] **Step 5: Audit production output**

Search `dist` for prohibited and stale content:

```powershell
rg -n "NITTA|sinoforce|SINOFORM" dist
```

Expected: no public NITTA, old domain, or old visible brand strings.

Confirm the new bundle contains `info@sinof.net`, About metadata, every new
slug, and the approved company facts.

- [ ] **Step 6: Deploy to Cloudflare Pages**

Deploy `dist` to project `sinoform`, branch `main`, using the existing
authorized Cloudflare account. Record the returned production deployment URL.

- [ ] **Step 7: Verify production URLs and country endpoint**

Request and confirm HTTP 200 for:

- `https://sinfogear.com/about`
- `https://sinfogear.com/products/rubber-timing-belts`
- `https://sinfogear.com/products/polyurethane-timing-belts`
- `https://sinfogear.com/products/conveyor-belts`
- `https://sinfogear.com/products/flat-belts`
- `https://sinfogear.com/products/round-belts`
- `https://sinfogear.com/contact`
- matching `www.sinfogear.com` routes
- `https://sinfogear.com/cdn-cgi/trace`

Confirm the deployed HTML references the new asset bundle and that the bundle
contains the new route data but no `NITTA` string.

- [ ] **Step 8: Commit documentation only**

Stage only `README.md` and `PROJECT_STRUCTURE.md`:

```powershell
git commit -m "docs: document company and product expansion"
```

Do not commit `dist` unless it is already a tracked deployment artifact.
