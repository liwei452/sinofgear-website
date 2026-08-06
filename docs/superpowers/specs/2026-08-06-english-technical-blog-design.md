# SINOF English Technical Blog Design

## Objective

Add an English-first technical blog to `sinfogear.com` that attracts qualified custom-gear buyers, gives Google indexable engineering content, and leads readers into the existing RFQ flow. The first release contains six articles and fixes the sitemap/robots foundation required for reliable discovery.

## Audience and Conversion Goal

The primary reader is an overseas purchasing manager, mechanical engineer, equipment builder, or sourcing specialist evaluating a custom gear supplier. Every article must help the reader make a real sourcing decision and end with a relevant path to a product page or the RFQ form.

The conversion goal is a drawing-based inquiry, not generic page traffic. Calls to action therefore ask the buyer to submit a drawing, target accuracy, material, heat-treatment, quantity, and application requirements for engineering review.

## Scope

### Included

- An `Insights` item in the main navigation and footer.
- A blog index at `/blog`.
- Six English article routes under `/blog/:slug`.
- English-only article content in the first release.
- A short English-availability notice when the site language is not English.
- Static HTML generation for the blog index and six article routes.
- Per-article metadata, canonical URL, Open Graph metadata, breadcrumbs, and `BlogPosting` JSON-LD.
- A real XML sitemap at `/sitemap.xml` containing canonical public and blog URLs.
- A root `/robots.txt` that references the sitemap.
- Responsive layouts and automated tests.

### Excluded from the first release

- CMS, author login, comments, onsite search, RSS, newsletter signup, and translated articles.
- Unverified certification, industry, tolerance, price, or lead-time claims.
- Changes to the inquiry API, CRM integration, or domain redirect policy.

## Routes and Initial Content

The initial route set is:

1. `/blog/what-information-is-needed-for-custom-gear-rfq`
2. `/blog/spur-gear-vs-helical-gear`
3. `/blog/iso-1328-gbt-10095-gear-accuracy-grades`
4. `/blog/custom-gear-materials-heat-treatment`
5. `/blog/prepare-gear-drawing-for-manufacturing`
6. `/blog/custom-gear-prototype-to-production`

Each article is written as practical sourcing guidance rather than a promotional essay. Content should use tables, checklists, FAQ sections, internal links, and clear engineering-review caveats where appropriate.

## Information Architecture

The blog index contains:

- A compact introduction explaining the purpose of SINOF Insights.
- One featured article.
- Article cards showing title, excerpt, topic, publication date, and estimated reading time.
- A drawing-review CTA connected to the existing contact/RFQ journey.

An article page contains:

- Breadcrumbs.
- Title, summary, publication/update date, author, reading time, and topic.
- A table of contents generated from the article sections.
- Structured headings, paragraphs, lists, tables, callouts, and FAQs.
- Relevant product links.
- Related articles.
- A final RFQ CTA.

Unknown article slugs render the existing not-found experience and use `noindex` metadata in the client application.

## Content Model

Article content is stored in typed TypeScript data modules so the React pages, SEO metadata, static renderer, sitemap generator, and tests all consume one source of truth.

Each article includes:

- `slug`
- `title`
- `description`
- `excerpt`
- `topic`
- `publishedAt`
- `updatedAt`
- `readingMinutes`
- `author` (`SINOF Engineering Team`)
- `heroImage`
- `sections` with stable heading IDs and typed content blocks
- `faq`
- `relatedProductSlugs`

Supported content blocks are paragraphs, bullet or numbered lists, specification tables, notes, and subheadings. The model deliberately avoids arbitrary raw HTML.

## Language Behavior

Navigation labels and surrounding UI continue to follow the selected site language. Article titles and bodies remain English in all language modes for the first release. When the active language is not English, the blog index and article page show:

`Technical articles are currently available in English.`

Canonical blog URLs do not add language query parameters because there is only one article-language version.

## SEO and Static Rendering

The existing React/Vite application remains the runtime application. A deterministic post-build script renders the blog index and article routes into route-specific `index.html` files inside `dist`. The generated HTML must include the real title, description, canonical URL, H1, article body, internal links, and structured data before client-side JavaScript runs.

The browser application hydrates or mounts on top of the route using the existing visual components. Static output and client output must originate from the same article data to prevent content drift.

Each article emits:

- A unique `<title>` and meta description.
- A canonical URL on `https://sinfogear.com`.
- `og:type=article`, title, description, URL, locale, and image.
- `BlogPosting` JSON-LD with headline, description, dates, author, publisher, image, and main entity URL.
- `BreadcrumbList` JSON-LD.

The blog index emits website metadata and breadcrumb structured data.

The build also generates a valid UTF-8 XML sitemap with absolute canonical URLs for the existing public routes, `/blog`, and all six articles. It uses article update dates for blog `<lastmod>` values. `robots.txt` allows normal crawling and points to `https://sinfogear.com/sitemap.xml`.

## Visual Direction

The new pages reuse the current SINOF typography, colors, spacing, buttons, cards, header, and footer. The visual tone is industrial and editorial: readable line lengths, strong hierarchy, restrained accent color, clear tables, and comfortable mobile spacing.

The first release reuses relevant existing factory and product imagery. It does not depend on unverified stock photos or generated images. Every meaningful image has descriptive alt text; decorative images use empty alt text.

## Claims and Editorial Safety

Published claims must stay within confirmed company evidence. Currently acceptable company facts include the 2008 founding year, 7,000 m² facility, 4,000 m² gear workshop, GB Grade 5 capability, and ISO 9001 certification obtained in 2017, provided the exact wording matches verified site data.

Precision standards, materials, heat treatment, inspection, and manufacturability are described educationally. Any buyer-specific result is qualified as a target or as subject to drawing, material, process, quantity, and inspection review.

The content must not claim AS9100, Nadcap, IATF 16949, medical/aerospace approval, universal tolerance capability, guaranteed price savings, or guaranteed lead times without supporting records.

## Testing and Acceptance

Automated coverage includes:

- All seven blog routes render, and an unknown slug shows not found.
- Non-English language mode displays the English-availability notice.
- Article metadata, canonical URL, `BlogPosting`, and breadcrumb schema are correct.
- Internal article and product links resolve to known routes.
- The post-build output for every blog route contains its unique title, H1, body text, canonical URL, and JSON-LD without executing JavaScript.
- `sitemap.xml` parses as XML and contains every public canonical route exactly once.
- `robots.txt` references the canonical sitemap.
- Existing inquiry, product, navigation, and language tests continue to pass.
- Type checking, linting, tests, and production build pass.

Manual acceptance covers desktop and mobile rendering, navigation, table overflow, CTA behavior, direct deep-link loading on Cloudflare Pages, and live retrieval of `/sitemap.xml` and `/robots.txt` after deployment.

## Future Extension

The typed article source can later be replaced by the team's own agent platform or a CMS adapter without changing routes or page components. A future content service should output the same validated article shape. CRM integration remains downstream of the existing inquiry API and is independent from this blog release.
