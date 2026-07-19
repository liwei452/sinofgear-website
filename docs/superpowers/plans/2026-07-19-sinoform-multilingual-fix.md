# SINOFORM Multilingual Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all five language choices visibly localize the complete public SINOFORM site and add safe, configurable IP-country language adaptation.

**Architecture:** Keep route slugs and content structure language-neutral, then localize customer-facing values through typed locale dictionaries and a `t()` accessor exposed by the existing language provider. Resolve automatic language asynchronously through a focused geo service while preserving saved and in-session manual choices.

**Tech Stack:** React 19, TypeScript, React Router, Vite, Tailwind CSS, Vitest, Testing Library

## Global Constraints

- Preserve the existing visual design and all existing routes.
- English, Simplified Chinese, German, Japanese, and Spanish must change the visible public content.
- English is required and remains the fallback for a missing translation.
- A saved manual preference always overrides IP and browser detection.
- IP lookup failure must not block rendering or overwrite a manual choice.
- Do not introduce unsupported company facts, certifications, equipment counts, or contact details.
- All customer-facing copy remains in independent data files.

---

### Task 1: Typed translation catalog

**Files:**
- Create: `src/i18n/messages.ts`
- Modify: `src/i18n/language.ts`
- Test: `src/i18n/messages.test.ts`

**Interfaces:**
- Produces: `MessageKey`, `messages`, and `translate(lang: Lang, key: MessageKey): string`
- Consumes: the existing `Lang` union from `src/i18n/language.ts`

- [ ] **Step 1: Write the failing catalog tests**

```ts
expect(translate('zh', 'nav.products')).toBe('产品')
expect(translate('de', 'action.requestQuote')).toBe('Angebot anfragen')
expect(translate('ja', 'form.email')).toBe('メールアドレス')
expect(translate('es', 'section.materials')).toBe('Materiales')
expect(translate('zh', 'test.englishOnly')).toBe('English fallback')
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/i18n/messages.test.ts`

Expected: FAIL because `messages.ts` and `translate` do not exist.

- [ ] **Step 3: Implement the typed catalog**

Define an English source object using dot-delimited keys, define partial dictionaries for the other four locales, and implement:

```ts
export type MessageKey = keyof typeof messages.en

export function translate(lang: Lang, key: MessageKey): string {
  return messages[lang][key] ?? messages.en[key]
}
```

Populate every shared navigation, footer, action, section, form, validation, status, page, SEO, process, and quality message used by the public components.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/i18n/messages.test.ts`

Expected: all catalog tests pass.

- [ ] **Step 5: Commit**

```text
git add src/i18n/messages.ts src/i18n/messages.test.ts src/i18n/language.ts
git commit -m "feat: add typed multilingual message catalog"
```

### Task 2: Geo-country adapter and language priority

**Files:**
- Create: `src/services/geoLanguage.ts`
- Create: `src/services/geoLanguage.test.ts`
- Modify: `src/i18n/LanguageContext.tsx`
- Modify: `src/i18n/language.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `parseCountryCode(value: unknown): string | undefined`
- Produces: `detectVisitorCountry(options?: { injectedCode?: string; endpoint?: string; fetcher?: typeof fetch }): Promise<string | undefined>`
- Extends context with `t(key: MessageKey): string`

- [ ] **Step 1: Write failing priority and geo parsing tests**

```ts
expect(parseCountryCode({ countryCode: 'cn' })).toBe('CN')
expect(parseCountryCode({ country: 'DE' })).toBe('DE')
expect(parseCountryCode({ country_code: 'jp' })).toBe('JP')
expect(resolveInitialLanguage(null, ['en-US'], 'CN')).toBe('zh')
expect(resolveInitialLanguage('es', ['en-US'], 'CN')).toBe('es')
```

Add a provider test proving a delayed geo result does not overwrite a user selection made while the request is pending.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/services/geoLanguage.test.ts src/i18n/language.test.ts src/i18n/LanguageContext.test.tsx`

Expected: FAIL because the geo service, context translator, and IP-first asynchronous behavior are absent.

- [ ] **Step 3: Implement minimal geo detection**

Normalize two-letter country codes. Prefer `VITE_VISITOR_COUNTRY_CODE`; otherwise fetch `VITE_GEO_API_URL` with an abort timeout and accept `countryCode`, `country`, or `country_code`. Return `undefined` for invalid data, HTTP errors, timeout, or network failure.

Initialize the provider from a saved language or browser language. When no saved preference exists, request the country code and update from `languageFromCountryCode` only while a `manualSelectionRef` is false. Add `t` to context using `translate(lang, key)`.

- [ ] **Step 4: Document environment variables**

```dotenv
VITE_VISITOR_COUNTRY_CODE=
VITE_GEO_API_URL=
```

Explain that production hosting may inject a two-letter country code or expose a same-origin JSON endpoint.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- src/services/geoLanguage.test.ts src/i18n/language.test.ts src/i18n/LanguageContext.test.tsx`

Expected: all geo and provider tests pass.

- [ ] **Step 6: Commit**

```text
git add .env.example src/services/geoLanguage.ts src/services/geoLanguage.test.ts src/i18n/LanguageContext.tsx src/i18n/LanguageContext.test.tsx src/i18n/language.test.ts
git commit -m "feat: add safe IP language detection"
```

### Task 3: Localize global UI, pages, forms, and SEO

**Files:**
- Modify: `src/data/site.ts`
- Modify: `src/data/pages.ts`
- Modify: `src/sections/Header.tsx`
- Modify: `src/sections/Footer.tsx`
- Modify: `src/sections/FloatingCta.tsx`
- Modify: `src/components/PageHero.tsx`
- Modify: `src/components/InquiryForm.tsx`
- Modify: `src/components/Seo.tsx`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/ProductsPage.tsx`
- Modify: `src/pages/CapabilitiesPage.tsx`
- Modify: `src/pages/QualityPage.tsx`
- Modify: `src/pages/ContactPage.tsx`
- Modify: `src/pages/NotFoundPage.tsx`
- Test: `src/App.test.tsx`
- Test: `src/pages/ContactPage.test.tsx`
- Test: `src/lib/seo.test.ts`

**Interfaces:**
- Consumes: `useLang(): { lang; setLang; t }`
- Consumes: localized page data selected by `getLocalizedValue`
- Produces: fully localized global chrome, general pages, form states, and metadata

- [ ] **Step 1: Add failing visible-language tests**

Render the app in Chinese, German, Japanese, and Spanish and assert representative navigation, home heading, contact labels, validation text, and not-found copy. Switch language inside the rendered app and assert `document.title`, meta description, `og:locale`, and visible page content all change without navigation.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/App.test.tsx src/pages/ContactPage.test.tsx src/lib/seo.test.ts`

Expected: FAIL because current components render English constants.

- [ ] **Step 3: Replace component literals with translation keys**

Use `t()` for shared UI and form strings. Store locale-specific page hero, body, process, capabilities, quality, and SEO content in `src/data/pages.ts`, selected with `getLocalizedValue`.

Set `og:locale` from the active language using:

```ts
const openGraphLocales = {
  en: 'en_US',
  de: 'de_DE',
  ja: 'ja_JP',
  es: 'es_ES',
  zh: 'zh_CN',
} satisfies Record<Lang, string>
```

Keep canonical paths unchanged and ensure schema descriptions use the same localized values as the page.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- src/App.test.tsx src/pages/ContactPage.test.tsx src/lib/seo.test.ts`

Expected: all global UI, page, form, and SEO localization tests pass.

- [ ] **Step 5: Commit**

```text
git add src/data/site.ts src/data/pages.ts src/sections src/components src/pages src/App.test.tsx src/lib/seo.test.ts
git commit -m "feat: localize site pages and inquiry UI"
```

### Task 4: Localize product catalog and structured data

**Files:**
- Modify: `src/data/products.ts`
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/pages/ProductDetailPage.tsx`
- Modify: `src/pages/ProductDetailPage.test.tsx`
- Modify: `src/data/products.test.ts`

**Interfaces:**
- Produces: localized product fields selected by `localizeProduct(product, lang)`
- Keeps: stable `slug`, `image`, and inquiry-product values

- [ ] **Step 1: Write failing product localization tests**

Assert every product has non-empty localized names and value propositions for all five languages. Render a Chinese product detail page and assert its title, features, materials, precision, customization, industries, inspection, FAQ, breadcrumb schema, product schema, and RFQ label are Chinese.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/data/products.test.ts src/pages/ProductDetailPage.test.tsx`

Expected: FAIL because product data and sections are English-only.

- [ ] **Step 3: Add localized product data and selector**

Keep one record per product. Convert customer-facing scalar and array fields to English-required localized values. Add:

```ts
export function localizeProduct(product: Product, lang: Lang): LocalizedProduct
```

Translate all six product records for all five languages without adding numeric capability claims. Update product cards, detail sections, FAQs, breadcrumbs, Product schema, FAQ schema, and RFQ display text to consume the localized record.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/data/products.test.ts src/pages/ProductDetailPage.test.tsx`

Expected: all product localization tests pass.

- [ ] **Step 5: Commit**

```text
git add src/data/products.ts src/data/products.test.ts src/components/ProductCard.tsx src/pages/ProductDetailPage.tsx src/pages/ProductDetailPage.test.tsx
git commit -m "feat: localize product catalog and schemas"
```

### Task 5: Documentation and full verification

**Files:**
- Modify: `PROJECT_STRUCTURE.md`
- Modify: `README.md`
- Modify: plan checkboxes in `docs/superpowers/plans/2026-07-19-sinoform-multilingual-fix.md`

**Interfaces:**
- Documents: language priority, geo endpoint contract, hosting integration, fallback behavior, and translation maintenance

- [ ] **Step 1: Update handoff documentation**

Document the five complete locales, the translation source files, the saved-preference priority, accepted geo JSON shapes, environment variables, and the hosting requirement for a country-code endpoint or injected value.

- [ ] **Step 2: Run content-safety audit**

Run:

```powershell
rg -n -i "employees|square meters|countries exported|certified|ISO 9001|machines" src --glob "!*.test.*"
```

Expected: no newly introduced unsupported claim.

- [ ] **Step 3: Run full verification**

Run:

```text
npm test
npm run lint
npm run build
```

Expected: every test passes, lint exits zero, TypeScript and Vite production build exit zero.

- [ ] **Step 4: Verify repository state**

Run:

```text
git diff --check
git status --short
```

Expected: no whitespace errors; only the intended documentation and implementation changes are present before the final commit.

- [ ] **Step 5: Commit**

```text
git add PROJECT_STRUCTURE.md README.md docs/superpowers/plans/2026-07-19-sinoform-multilingual-fix.md
git commit -m "docs: document multilingual deployment"
```
