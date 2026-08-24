# SinofGears Domain Migration Implementation Plan

> **For Codex:** Execute this plan with test-driven development and verify every production-facing result before deployment.

**Goal:** Make `https://sinofgears.com` the canonical website origin while preserving the existing inquiry email delivery and safely redirecting legacy hostnames.

**Architecture:** Keep the React/Vite static-site build as the source of canonical, Open Graph, JSON-LD, sitemap, and robots metadata. Add a small Cloudflare Pages middleware that redirects legacy and `www` hostnames to the canonical apex while preserving path and query parameters. Do not change inquiry recipient/sender settings.

**Tech Stack:** React, Vite, TypeScript, Vitest, Cloudflare Pages Functions.

---

### Task 1: Lock the canonical origin with failing tests

**Files:**
- Modify: `scripts/static-site.test.ts`
- Modify: `src/lib/seo.test.ts`

- [x] Add assertions that generated canonical, Open Graph, JSON-LD, sitemap, and robots URLs use `https://sinofgears.com`.
- [x] Run the focused tests and confirm they fail for the expected old-domain reason.

### Task 2: Add legacy-host redirect behavior with failing tests

**Files:**
- Create: `functions/_middleware.test.ts`
- Create: `functions/_middleware.ts`

- [x] Test redirects from `sinfogear.com`, `www.sinfogear.com`, and `www.sinofgears.com` to `https://sinofgears.com`.
- [x] Test preservation of path and query parameters.
- [x] Test that `sinofgears.com` and `sinoform.pages.dev` continue normally.
- [x] Run the focused test and confirm it fails before implementation.

### Task 3: Implement the domain migration

**Files:**
- Modify: `src/data/site.ts`
- Modify: `scripts/static-site.ts`
- Modify: `scripts/static-site-cli.ts`
- Modify: `.env.example`
- Modify: `README.md`
- Create: `functions/_middleware.ts`

- [x] Change only website-origin defaults to `https://sinofgears.com`.
- [x] Keep `inquiries@sinfogear.com` and the existing Resend sender settings unchanged.
- [x] Implement host-only redirects with no redirect loop.
- [x] Make the focused tests pass.

### Task 4: Verify build output

- [x] Run the independent-site test suite.
- [x] Run ESLint on changed code.
- [x] Run the production build.
- [x] Inspect generated HTML, JSON-LD, sitemap, and robots output for the new domain.
- [x] Confirm no active canonical URL still points to the old domain.

### Task 5: Publish and verify

- [ ] Publish an auditable branch/commit to `liwei452/sinofgear-website` without force-pushing.
- [ ] Deploy the verified build to Cloudflare Pages project `sinoform`.
- [ ] Verify the new apex, `www`, and legacy redirects over public HTTPS.
- [ ] Confirm the live canonical, sitemap, and robots values.
