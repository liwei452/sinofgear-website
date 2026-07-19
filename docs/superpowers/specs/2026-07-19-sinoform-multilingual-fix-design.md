# SINOFORM Multilingual Completion Design

Date: 2026-07-19
Status: Approved direction, pending written-spec review

## Goal

Make the existing language selector change the complete public site experience for English, Simplified Chinese, German, Japanese, and Spanish without changing the current visual design or routes.

## Scope

- Localize primary navigation, footer, global calls to action, page headings, page body copy, product data, inquiry form labels and states, FAQ content, and route-specific SEO metadata.
- Keep all core copy and product content in independent data files.
- Preserve English as the guaranteed fallback when a translated value is unavailable.
- Persist an explicit visitor choice in local storage. A saved choice always overrides automatic detection.
- Add an IP-country adapter that can read a hosting-provided country code or call a configurable geo endpoint.
- Fall back from IP detection to browser language, then English.
- Update the document language whenever the active language changes.
- Do not add or translate unconfirmed factory facts, certifications, equipment counts, contact details, or other unsupported claims.

## Architecture

### Translation data

Create typed locale dictionaries keyed by the existing language type. Shared UI copy and page copy live in locale data modules. Product records use localized field objects for all customer-facing strings while keeping route slugs, image paths, and structural IDs language-neutral.

The UI reads content through a small translation accessor. English remains required by the type system and is the fallback for missing translations.

### Language state

The language provider owns:

- the current language;
- the manual-selection persistence flag;
- initial browser-language selection;
- asynchronous IP-country refinement when no saved preference exists;
- updating `document.documentElement.lang`.

Automatic selection priority:

1. saved manual preference;
2. IP/CDN country code;
3. browser language;
4. English.

The initial browser language may render briefly while IP detection is pending. The provider changes it only if the visitor has not manually selected a language in the meantime.

### IP adapter

Add a small service with two sources:

1. a country code injected at build/runtime through `VITE_VISITOR_COUNTRY_CODE`;
2. an optional JSON endpoint configured through `VITE_GEO_API_URL`.

The endpoint may return `countryCode`, `country`, or `country_code`. Invalid responses, network errors, and timeouts return no country and never block the site. Hosting-specific forwarding or edge logic remains an integration responsibility documented in `.env.example` and the project handoff.

### SEO

SEO content changes with the active locale. Canonical URLs remain language-neutral because the site does not use language-prefixed routes. Open Graph locale reflects the active language. Structured-data text uses the same localized source data as the visible page.

## Components and data flow

1. `LanguageProvider` resolves the initial language and exposes `lang` and `setLang`.
2. `Header`, `Footer`, page components, product cards/details, and the inquiry form obtain localized data using `lang`.
3. `Seo` receives localized metadata and schema values from the page.
4. Selecting a language updates all consumers immediately and persists the choice.
5. Refreshing the page restores the saved choice.

No layout or route changes are required.

## Error handling

- Missing translation: use English.
- Geo endpoint unavailable, slow, or malformed: keep browser language.
- Unsupported country or browser language: use English.
- Saved unsupported value: ignore it.
- A late geo response cannot overwrite a manual choice.

## Testing

- Unit tests for locale lookup, automatic-selection priority, country mapping, and geo response parsing.
- Provider tests for manual switching, persistence, document language, and late IP-response protection.
- Page tests proving navigation and representative page/product/form content change language.
- SEO tests proving title, description, Open Graph locale, and structured data use the active locale.
- Existing inquiry, routing, content-safety, lint, and production-build checks remain green.

## Acceptance criteria

- All five choices visibly change the site’s main public content.
- Every requested route continues to render.
- A manual language choice survives refresh and wins over automatic detection.
- IP adaptation works through documented configuration and fails safely.
- No unsupported company claims are introduced.
- Tests, lint, and `npm run build` pass.
