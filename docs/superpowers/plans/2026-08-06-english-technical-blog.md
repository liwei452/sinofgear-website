# SINOF English Technical Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an English-first, statically discoverable technical blog with six sourcing articles, article SEO, a valid XML sitemap, and a robots file to the existing SINOF React/Vite site.

**Architecture:** Keep the existing React application and route structure, with typed article data as the single content source. Add React blog pages for visitors and a deterministic Node post-build generator that converts the same article data into route-specific crawlable HTML plus `sitemap.xml` and `robots.txt` in `dist`.

**Tech Stack:** React 19, React Router 7, TypeScript 5.9, Vite 7, Vitest, Testing Library, Node.js post-build scripts, Cloudflare Pages.

## Global Constraints

- Blog content is English-only in the first release; non-English modes show `Technical articles are currently available in English.`
- Use `/blog` and the six exact slugs defined in the design specification.
- Author name is exactly `SINOF Engineering Team`.
- Canonical origin is exactly `https://sinfogear.com` unless `VITE_SITE_URL` overrides it at build time.
- Do not add a CMS, login, comments, search, RSS, newsletter, or CRM changes.
- Do not publish unverified AS9100, Nadcap, IATF 16949, medical/aerospace approval, universal tolerance, price-saving, or lead-time claims.
- Buyer-specific manufacturing results must be qualified as subject to drawing and engineering review.
- Preserve all unrelated working-tree changes under `platform/packages/contracts/**`.

---

## File Structure

- `src/data/articles.ts`: article types, six article records, lookup helpers, and blog routes.
- `src/data/articles.test.ts`: uniqueness, completeness, claims, links, and lookup tests.
- `src/pages/BlogIndexPage.tsx`: blog landing page.
- `src/pages/BlogArticlePage.tsx`: article renderer and unknown-slug handling.
- `src/pages/blog.css`: editorial layout, table overflow, and print-safe article styling.
- `src/pages/BlogPages.test.tsx`: route, content, language notice, and CTA tests.
- `src/lib/seo.ts`: article and blog breadcrumb schema builders.
- `src/lib/seo.test.ts`: exact schema tests.
- `src/components/Seo.tsx`: support `article` Open Graph type and article date metadata.
- `src/App.tsx`: `/blog` and `/blog/:slug` routes.
- `src/data/site.ts`: `Insights` navigation item and public blog route aggregation.
- `src/sections/Header.tsx`, `src/sections/Footer.tsx`, `src/sections/Footer.test.tsx`: expose and verify the navigation entry.
- `scripts/static-site.ts`: post-build HTML, sitemap, and robots generator; imports the typed article source directly.
- `scripts/static-site.test.ts`: black-box generator acceptance checks.
- `package.json`: post-build and static-output test scripts.
- `public/assets/blog/`: selected existing/local image copies only when needed by an article.

---

### Task 1: Typed Article Source of Truth

**Files:**
- Create: `src/data/articles.ts`
- Create: `src/data/articles.test.ts`

**Interfaces:**
- Produces: `Article`, `ArticleBlock`, `articles`, `articleRoutes`, `getArticleBySlug(slug: string): Article | undefined`, and `getRelatedArticles(article: Article, limit?: number): Article[]`.
- Consumes: known product slugs from `src/data/products.ts` for validation only.

- [ ] **Step 1: Write failing data-contract tests**

Add tests that assert there are exactly six unique slugs, all dates are ISO `YYYY-MM-DD`, all heading IDs are unique within an article, every FAQ has a non-empty question and answer, every related product slug exists, and every article includes at least one final drawing-review CTA.

```ts
import { describe, expect, it } from 'vitest'
import { articles, getArticleBySlug } from './articles'
import { products } from './products'

describe('articles', () => {
  it('publishes the six approved unique routes', () => {
    expect(articles.map(({ slug }) => slug)).toEqual([
      'what-information-is-needed-for-custom-gear-rfq',
      'spur-gear-vs-helical-gear',
      'iso-1328-gbt-10095-gear-accuracy-grades',
      'custom-gear-materials-heat-treatment',
      'prepare-gear-drawing-for-manufacturing',
      'custom-gear-prototype-to-production',
    ])
    expect(new Set(articles.map(({ slug }) => slug)).size).toBe(6)
  })

  it('only links to known products', () => {
    const known = new Set(products.map(({ slug }) => slug))
    for (const article of articles) {
      expect(article.relatedProductSlugs.every((slug) => known.has(slug))).toBe(true)
    }
  })

  it('looks up a known slug without inventing unknown articles', () => {
    expect(getArticleBySlug(articles[0].slug)).toBe(articles[0])
    expect(getArticleBySlug('missing')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/data/articles.test.ts`

Expected: FAIL because `src/data/articles.ts` does not exist.

- [ ] **Step 3: Implement the content model and lookup helpers**

Use discriminated blocks so both React and the static generator can render the same safe structures.

```ts
export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; style: 'bullet' | 'number'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'note'; title: string; text: string }
  | { type: 'subheading'; id: string; title: string }

export interface ArticleSection {
  id: string
  title: string
  blocks: ArticleBlock[]
}

export interface Article {
  slug: string
  title: string
  description: string
  excerpt: string
  topic: string
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  author: 'SINOF Engineering Team'
  heroImage: string
  sections: ArticleSection[]
  faq: Array<{ question: string; answer: string }>
  relatedProductSlugs: string[]
}

export const articleRoutes = articles.map(({ slug }) => `/blog/${slug}`)
export const getArticleBySlug = (slug: string) => articles.find((article) => article.slug === slug)
```

Populate all six articles with complete English copy following these exact purposes:

1. RFQ checklist: application, gear geometry, material, heat treatment, accuracy, quantity, inspection, drawing formats, and missing-data review.
2. Spur versus helical: load/noise/efficiency/axial-force comparison table and selection questions.
3. ISO 1328 and GB/T 10095: what a grade controls, why lower numbers mean tighter control, inspection agreement, and the explicit caveat that a requested grade is reviewed per drawing.
4. Materials and heat treatment: carbon/alloy/stainless/engineering-plastic comparison, through hardening, carburizing, nitriding, induction hardening, distortion, and inspection planning.
5. Drawing preparation: geometry, datum, tolerances, surface finish, material, heat treatment, deburring, inspection, quantity, and revision control.
6. Prototype to production: drawing review, DFM, process planning, prototype/first article, validation, change control, batch production, inspection, packaging, and repeat orders.

Every article must contain a practical table, at least three FAQs, product links, and language that makes final capability subject to engineering review.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- src/data/articles.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the article data**

```bash
git add src/data/articles.ts src/data/articles.test.ts
git commit -m "feat: add technical article content model"
```

---

### Task 2: Article SEO Builders

**Files:**
- Modify: `src/lib/seo.ts`
- Modify: `src/lib/seo.test.ts`
- Modify: `src/components/Seo.tsx`

**Interfaces:**
- Consumes: `Article` from `src/data/articles.ts`.
- Produces: `buildArticleSchema(article: Article, baseUrl: string): JsonLdRecord` and `buildBlogBreadcrumbSchema(article: Article | undefined, baseUrl: string): JsonLdRecord`.
- Extends `Seo` with `type?: 'website' | 'product' | 'article'`, `publishedAt?: string`, and `updatedAt?: string`.

- [ ] **Step 1: Add failing schema tests**

```ts
it('builds BlogPosting data with canonical URLs', () => {
  const schema = buildArticleSchema(articles[0], 'https://sinfogear.com')
  expect(schema).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: articles[0].title,
    datePublished: articles[0].publishedAt,
    dateModified: articles[0].updatedAt,
    author: { '@type': 'Organization', name: 'SINOF Engineering Team' },
    mainEntityOfPage: `https://sinfogear.com/blog/${articles[0].slug}`,
  })
})

it('builds three-level article breadcrumbs', () => {
  const schema = buildBlogBreadcrumbSchema(articles[0], 'https://sinfogear.com')
  expect(schema.itemListElement).toHaveLength(3)
  expect(schema.itemListElement[1]).toMatchObject({ name: 'Insights' })
})
```

- [ ] **Step 2: Run the SEO tests and verify they fail**

Run: `npm test -- src/lib/seo.test.ts`

Expected: FAIL because the article helpers are not exported.

- [ ] **Step 3: Implement schema and article meta support**

`buildArticleSchema` must produce `BlogPosting` with canonical image and article URLs, Organization author/publisher, dates, description, and headline. `buildBlogBreadcrumbSchema(undefined, baseUrl)` produces Home → Insights; an article adds the third item.

In `Seo`, set or remove the following tags deterministically:

```ts
setMeta('meta[property="article:published_time"]', {
  property: 'article:published_time',
  content: publishedAt,
})
setMeta('meta[property="article:modified_time"]', {
  property: 'article:modified_time',
  content: updatedAt,
})
```

Only retain these tags when values are supplied, and include the new props in the effect dependency list.

- [ ] **Step 4: Run SEO and full tests**

Run: `npm test -- src/lib/seo.test.ts`

Expected: PASS.

Run: `npm test`

Expected: all existing tests plus the article-data and SEO tests pass.

- [ ] **Step 5: Commit SEO support**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts src/components/Seo.tsx
git commit -m "feat: add article structured data"
```

---

### Task 3: Blog Routes and Editorial UI

**Files:**
- Create: `src/pages/BlogIndexPage.tsx`
- Create: `src/pages/BlogArticlePage.tsx`
- Create: `src/pages/blog.css`
- Create: `src/pages/BlogPages.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/data/site.ts`
- Modify: `src/sections/Footer.test.tsx`

**Interfaces:**
- Consumes: `articles`, `getArticleBySlug`, `getRelatedArticles`, schema helpers, `products`, `Seo`, and `useLang`.
- Produces: visitor-facing `/blog` and `/blog/:slug` pages plus navigation links.

- [ ] **Step 1: Write failing page and route tests**

Render routes with `MemoryRouter` and assert:

```ts
it('renders the insights index and all six article cards', () => {
  renderAt('/blog')
  expect(screen.getByRole('heading', { level: 1, name: /gear sourcing insights/i })).toBeVisible()
  expect(screen.getAllByRole('article')).toHaveLength(6)
})

it('renders an article with its contents, FAQ, product links, and RFQ CTA', () => {
  renderAt('/blog/what-information-is-needed-for-custom-gear-rfq')
  expect(screen.getByRole('heading', { level: 1, name: articles[0].title })).toBeVisible()
  expect(screen.getByRole('navigation', { name: /table of contents/i })).toBeVisible()
  expect(screen.getByRole('link', { name: /request drawing review/i })).toHaveAttribute('href', '/contact')
})

it('shows the English notice in a non-English site mode', async () => {
  localStorage.setItem('sinoform-language', 'de')
  renderAt('/blog')
  expect(await screen.findByText('Technical articles are currently available in English.')).toBeVisible()
})

it('uses the not-found experience for an unknown slug', () => {
  renderAt('/blog/not-a-real-article')
  expect(screen.getByRole('heading', { level: 1, name: /not found/i })).toBeVisible()
})
```

- [ ] **Step 2: Run the page test and verify it fails**

Run: `npm test -- src/pages/BlogPages.test.tsx`

Expected: FAIL because the pages and routes do not exist.

- [ ] **Step 3: Implement the blog index**

Use the current header/footer layout. Render a featured first article, six semantic `<article>` cards, dates via `<time dateTime>`, and a `/contact` CTA. Provide website SEO and Home → Insights breadcrumb JSON-LD.

- [ ] **Step 4: Implement the article renderer**

Render every `ArticleBlock` through an exhaustive switch. Tables must be wrapped in a horizontally scrollable container. FAQ content uses the existing accordion component. Related products resolve from `products`, and related articles use `getRelatedArticles(article, 3)`.

Pass the following to `Seo`:

```tsx
<Seo
  seo={{ title: `${article.title} | SINOF`, description: article.description }}
  pathname={`/blog/${article.slug}`}
  type="article"
  image={article.heroImage}
  publishedAt={article.publishedAt}
  updatedAt={article.updatedAt}
  structuredData={[
    buildArticleSchema(article, getSiteUrl()),
    buildBlogBreadcrumbSchema(article, getSiteUrl()),
    buildFaqSchema(article.faq),
  ]}
/>
```

- [ ] **Step 5: Wire routes and navigation**

Add before the catch-all route:

```tsx
<Route path="blog" element={<BlogIndexPage />} />
<Route path="blog/:slug" element={<BlogArticlePage />} />
```

Add `{ label: 'Insights', href: '/blog' }` between Quality and Contact in `navItems`. Add `/blog` and `...articleRoutes` to exported public routes without duplicating strings.

- [ ] **Step 6: Add responsive editorial styling**

Keep article text at a readable maximum width, allow tables to scroll below desktop width, keep anchor targets below the sticky header with `scroll-margin-top`, and ensure cards collapse to one column on small screens. Use the existing Tailwind design tokens plus only narrowly scoped rules in `blog.css`.

- [ ] **Step 7: Run focused and full UI tests**

Run: `npm test -- src/pages/BlogPages.test.tsx src/sections/Footer.test.tsx src/App.test.tsx`

Expected: PASS.

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 8: Commit the blog UI**

```bash
git add src/App.tsx src/data/site.ts src/pages/BlogIndexPage.tsx src/pages/BlogArticlePage.tsx src/pages/BlogPages.test.tsx src/pages/blog.css src/sections/Footer.test.tsx
git commit -m "feat: add English technical blog pages"
```

---

### Task 4: Crawlable Post-Build HTML

**Files:**
- Create: `scripts/static-site.ts`
- Create: `scripts/static-site.test.ts`
- Modify: `src/main.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: built `dist/index.html` plus direct TypeScript imports of `articles`, `articleRoutes`, and `publicRoutes` through the `tsx` runner.
- Produces: `dist/blog/index.html` and `dist/blog/<slug>/index.html` containing route-specific head tags and semantic body content.

- [ ] **Step 1: Add a failing black-box generator test**

The test runs a temporary build fixture and verifies each output file contains unique crawlable content without executing JavaScript:

```js
assert.match(html, new RegExp(`<title>${escapeRegExp(article.title)} \\| SINOF</title>`))
assert.match(html, new RegExp(`<h1[^>]*>${escapeRegExp(article.title)}</h1>`))
assert.match(html, /<link rel="canonical" href="https:\/\/sinfogear\.com\/blog\//)
assert.match(html, /"@type":"BlogPosting"/)
assert.match(html, /Request drawing review/)
```

- [ ] **Step 2: Run the generator test and verify it fails**

Run: `npm test -- scripts/static-site.test.ts`

Expected: FAIL because `scripts/static-site.ts` does not exist.

- [ ] **Step 3: Load the single typed article source in the build script**

Add `tsx` as a development dependency. In `scripts/static-site.ts`, import `articles` from `../src/data/articles` and `publicRoutes` from `../src/data/site`; do not parse TypeScript with regular expressions and do not maintain a second handwritten article list. Gate the command entry point with an `import.meta.url` comparison so Vitest can import renderer functions without writing to the real `dist` directory.

- [ ] **Step 4: Implement deterministic HTML escaping and rendering**

Implement and export `escapeHtml`, `renderBlock`, `renderArticle`, `injectHead`, and `generateStaticSite`. Escape `&`, `<`, `>`, `"`, and `'` in all text and attribute values. The generated `<main data-static-blog>` must contain breadcrumbs, article header, table of contents, every content block, FAQs, relevant links, and CTA.

For `/blog`, render the index heading and six semantic article cards. For article routes, inject canonical metadata and serialized JSON-LD with `<` escaped as `\u003c`.

- [ ] **Step 5: Make client startup replace the static shell cleanly**

Before `createRoot`, remove only the generator marker while leaving normal local development unchanged:

```ts
const rootElement = document.getElementById('root')!
if (rootElement.hasAttribute('data-prerendered')) {
  rootElement.replaceChildren()
  rootElement.removeAttribute('data-prerendered')
}
createRoot(rootElement).render(/* existing tree */)
```

- [ ] **Step 6: Wire the production build**

Add scripts so `npm run build` is exactly `tsc -b && vite build && tsx scripts/static-site.ts`. Add `test:static` as `vitest run scripts/static-site.test.ts`.

- [ ] **Step 7: Run generator tests and inspect built files**

Run: `npm run build`

Expected: `dist/blog/index.html` and six `dist/blog/<slug>/index.html` files exist.

Run: `npm run test:static`

Expected: PASS for all seven routes, unique titles, canonical URLs, H1/body content, and JSON-LD.

- [ ] **Step 8: Commit static rendering**

```bash
git add scripts/static-site.ts scripts/static-site.test.ts src/main.tsx package.json package-lock.json vite.config.ts
git commit -m "feat: prerender blog routes for crawlers"
```

---

### Task 5: XML Sitemap and Robots

**Files:**
- Modify: `scripts/static-site.ts`
- Modify: `scripts/static-site.test.ts`
- Remove if present: `public/sitemap.xml`
- Modify or replace: `public/robots.txt`

**Interfaces:**
- Consumes: `publicRoutes`, `articleRoutes`, canonical origin, and article update dates.
- Produces: `dist/sitemap.xml` and `dist/robots.txt`.

- [ ] **Step 1: Add failing sitemap and robots assertions**

```js
assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/)
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)
assert.equal(count(sitemap, '<loc>https://sinfogear.com/blog</loc>'), 1)
for (const article of articles) {
  assert.equal(count(sitemap, `<loc>https://sinfogear.com/blog/${article.slug}</loc>`), 1)
  assert.match(sitemap, new RegExp(`<lastmod>${article.updatedAt}</lastmod>`))
}
assert.equal(robots, 'User-agent: *\nAllow: /\n\nSitemap: https://sinfogear.com/sitemap.xml\n')
```

- [ ] **Step 2: Run static tests and verify the new assertions fail**

Run: `npm run test:static`

Expected: FAIL because generated sitemap/robots output is absent or incorrect.

- [ ] **Step 3: Generate XML and robots from route data**

Escape XML values, use only absolute canonical URLs, emit every route once, and attach `<lastmod>` only where a reliable date exists. Write UTF-8 files without a byte-order mark.

- [ ] **Step 4: Prevent public assets from overwriting generated files**

Remove a stale `public/sitemap.xml` if present. Keep `public/robots.txt` consistent or generate robots only after Vite copies public assets so the final `dist/robots.txt` is authoritative.

- [ ] **Step 5: Run static tests and validate the production build**

Run: `npm run build && npm run test:static`

Expected: PASS; `dist/sitemap.xml` starts with XML, not HTML, and `dist/robots.txt` contains the canonical sitemap line.

- [ ] **Step 6: Commit technical discovery files**

```bash
git add scripts/static-site.ts scripts/static-site.test.ts public/robots.txt public/sitemap.xml
git commit -m "fix: generate sitemap and robots metadata"
```

---

### Task 6: Content Safety and Regression Verification

**Files:**
- Modify: `src/pages/contentSafety.test.tsx`
- Modify: `src/data/articles.test.ts`

**Interfaces:**
- Consumes: all six published article records and rendered blog pages.
- Produces: regression gates that prevent unverified claims and broken internal links.

- [ ] **Step 1: Add prohibited-claim and qualification tests**

Flatten article text and reject unsafe claims case-insensitively:

```ts
const prohibited = [
  /AS9100/i,
  /Nadcap/i,
  /IATF\s*16949/i,
  /medical[- ]grade/i,
  /guaranteed lead time/i,
  /guaranteed savings/i,
]

for (const article of articles) {
  const text = JSON.stringify(article)
  for (const pattern of prohibited) expect(text).not.toMatch(pattern)
  expect(text).toMatch(/drawing review|engineering review/i)
}
```

Also verify all `/products/...`, `/blog/...`, and `/contact` links present in article data belong to the known public route set.

- [ ] **Step 2: Run the safety tests**

Run: `npm test -- src/data/articles.test.ts src/pages/contentSafety.test.tsx`

Expected: PASS. If content fails, revise the claim rather than weakening the assertion.

- [ ] **Step 3: Run complete automated verification**

Run: `npm run lint`

Expected: PASS with no lint errors.

Run: `npm test`

Expected: all test files and tests pass.

Run: `npm run build`

Expected: PASS and seven crawlable blog HTML files are generated.

Run: `npm run test:static`

Expected: PASS.

- [ ] **Step 4: Commit final regression coverage**

```bash
git add src/data/articles.test.ts src/pages/contentSafety.test.tsx
git commit -m "test: protect technical blog claims and links"
```

---

### Task 7: Cloudflare Preview and Production Acceptance

**Files:**
- No source files unless acceptance reveals a defect.

**Interfaces:**
- Consumes: verified `dist` output and the existing Cloudflare Pages project `sinoform`.
- Produces: a preview deployment, recorded acceptance results, and—after preview approval—the production deployment.

- [ ] **Step 1: Confirm the deploy scope is clean**

Run: `git status --short`

Expected: only the known unrelated deletions under `platform/packages/contracts/**` remain; no uncommitted blog files exist.

- [ ] **Step 2: Create a Cloudflare Pages preview from `dist`**

Deploy the verified build to the existing `sinoform` project as a preview, keeping production unchanged until the preview checks pass.

- [ ] **Step 3: Perform preview acceptance**

Check on desktop and a narrow mobile viewport:

- `/blog` and all six article URLs load directly.
- Header and footer `Insights` links work.
- Tables scroll horizontally without causing page-level overflow.
- Table-of-contents anchors stop below the sticky header.
- Non-English language selection displays the English notice while keeping the article in English.
- Product links and the `Request drawing review` CTA reach the intended pages.
- Unknown article slug shows the not-found page.
- Page source contains the article title, H1/body copy, canonical link, and `BlogPosting` JSON-LD.
- `/sitemap.xml` has `application/xml` or `text/xml` content and valid XML.
- `/robots.txt` references `https://sinfogear.com/sitemap.xml`.

- [ ] **Step 4: Publish the accepted build to production**

Deploy the identical `dist` artifact to the production branch only after every preview check passes.

- [ ] **Step 5: Verify the live canonical domain**

Retrieve `https://sinfogear.com/blog`, one article route, `https://sinfogear.com/sitemap.xml`, and `https://sinfogear.com/robots.txt`. Confirm HTTP success, expected content types, canonical `sinfogear.com` URLs, and the absence of mock inquiry copy.

- [ ] **Step 6: Report deployment and rollback information**

Record the Cloudflare deployment URL, production verification results, and the prior production deployment identifier so the release can be rolled back if a live-only issue appears.

---

## Self-Review Results

- Spec coverage: routes, English-only behavior, navigation, six articles, typed content, SEO, static HTML, sitemap, robots, safety constraints, responsive UI, testing, and deployment acceptance each map to a task.
- Placeholder scan: every implementation step names its concrete output, command, and acceptance condition.
- Type consistency: `Article`, `ArticleBlock`, `articleRoutes`, `getArticleBySlug`, `getRelatedArticles`, `buildArticleSchema`, and `buildBlogBreadcrumbSchema` keep the same names and responsibilities across tasks.
- Scope control: CMS/CRM/search/comments/translations remain explicitly outside this release.
