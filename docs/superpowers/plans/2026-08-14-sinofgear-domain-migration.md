# SINOF Gear Domain Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the production website from `https://sinfogear.com` to `https://sinofgear.com`, retain path-preserving redirects from the old domain, and leave the existing inquiry-email delivery unchanged.

**Architecture:** Xinnet remains the registrar for `sinofgear.com`, while Cloudflare becomes its authoritative DNS provider and the existing Cloudflare Pages project `sinoform` remains the origin. The application and static generator publish only `sinofgear.com` canonical URLs. Host-based Cloudflare Redirect Rules handle `www.sinofgear.com` and the old `sinfogear.com` host without creating redirect loops.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Cloudflare Pages and Functions, Cloudflare DNS/Redirect Rules, Resend, PowerShell, curl.

## Global Constraints

- The only canonical production origin is exactly `https://sinofgear.com`.
- `https://www.sinofgear.com` permanently redirects to `https://sinofgear.com`.
- Every URL on `sinfogear.com` permanently redirects to the same path and query on `sinofgear.com`.
- The domain remains registered and renewed through Xinnet; only authoritative DNS moves to Cloudflare.
- The Cloudflare Pages project remains `sinoform`.
- `INQUIRY_TO_EMAIL` remains `452900431@qq.com`.
- `INQUIRY_FROM_EMAIL` remains `Sinoform RFQ <inquiries@sinfogear.com>` during this migration.
- Do not modify the Resend API key, MX, SPF, DKIM, or DMARC records during this migration.
- Do not submit a real inquiry during automated validation without explicit approval.
- Preserve unrelated worktree changes, especially the existing deletions under `platform/packages/contracts/` and the untracked `.superpowers/` directory.
- Historical specs and plans remain historical records; only active source, tests, README, and current deployment documentation change canonical origin.

---

### Task 1: Capture DNS and Deployment Rollback State

**Files:**
- Read: `README.md`
- Read: `src/data/site.ts`
- Read: `scripts/static-site.ts`
- Read: `scripts/static-site-cli.ts`
- Read: Cloudflare Pages project `sinoform`
- Read: Cloudflare DNS zones for `sinfogear.com` and `sinofgear.com`

**Interfaces:**
- Consumes: the existing production Pages deployment and current old-domain DNS records.
- Produces: a written preflight record containing the current production deployment ID, old-domain DNS records, and the Cloudflare-assigned nameservers for the new domain.

- [ ] **Step 1: Confirm the local change boundary**

Run:

```powershell
git status --short
git branch --show-current
rg -n "sinfogear\.com|sinofgear\.com" src scripts functions README.md PROJECT_STRUCTURE.md
```

Expected: the active application still identifies `https://sinfogear.com` as canonical, while `inquiries@sinfogear.com` appears in email configuration and must remain unchanged.

- [ ] **Step 2: Record the current public behavior**

Run:

```powershell
curl.exe -sS -o NUL -D - https://sinfogear.com/
curl.exe -sS -o NUL -D - https://sinfogear.com/products/worm-gears
curl.exe -sS https://sinfogear.com/sitemap.xml | Select-String "sinfogear.com"
```

Expected: the old production site returns HTTP 200 and the sitemap contains old-domain URLs.

- [ ] **Step 3: Record the current Cloudflare Pages deployment**

Use the authenticated Wrangler installation to run:

```powershell
wrangler pages deployment list --project-name sinoform
```

Record the newest Production deployment ID and URL in the execution notes. This is the rollback target if the new deployment fails.

- [ ] **Step 4: Add `sinofgear.com` to the existing Cloudflare account**

Add the domain as a DNS zone without changing its registrar. Choose the Free plan unless the account already uses another agreed plan. Cloudflare will return two authoritative nameservers; record both exactly in the execution notes.

- [ ] **Step 5: Snapshot any DNS records Cloudflare imports**

Before changing nameservers, export or copy the complete Cloudflare DNS record list for `sinofgear.com`. Because the domain currently has no public DNS answer, the expected result is either an empty zone or registrar parking records. Do not create email records.

---

### Task 2: Change the Canonical Origin with TDD

**Files:**
- Modify: `src/data/site.test.ts`
- Modify: `src/data/site.ts`
- Modify: `src/pages/AboutPage.test.tsx`
- Modify: `src/lib/seo.test.ts`
- Modify: `scripts/static-site.test.ts`
- Modify: `scripts/static-site.ts`
- Modify: `scripts/static-site-cli.ts`
- Modify: `functions/api/inquiries.test.ts`
- Modify: `functions/lib/inquiryServer.test.ts`
- Modify: `README.md`
- Modify: `PROJECT_STRUCTURE.md`

**Interfaces:**
- Consumes: `siteConfig.defaultUrl`, `getSiteUrl()`, `generateStaticSite()`, and the existing SEO schema builders.
- Produces: active source and generated output whose canonical origin is exactly `https://sinofgear.com`, while email sender values remain on `sinfogear.com`.

- [ ] **Step 1: Update tests first to require the new origin**

Change canonical expectations in the active tests from `https://sinfogear.com` to `https://sinofgear.com`. Keep these email assertions unchanged:

```ts
expect(siteConfig).toMatchObject({
  defaultUrl: 'https://sinofgear.com',
  rfqEmail: 'inquiries@sinfogear.com',
})
```

In inquiry-server tests, update only `sourceUrl` fixtures:

```ts
sourceUrl: 'https://sinofgear.com/contact?product=spur-gears'
```

Do not change:

```ts
INQUIRY_FROM_EMAIL: 'Sinoform RFQ <inquiries@sinfogear.com>'
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```powershell
vitest run src/data/site.test.ts src/pages/AboutPage.test.tsx src/lib/seo.test.ts scripts/static-site.test.ts functions/api/inquiries.test.ts functions/lib/inquiryServer.test.ts
```

Expected: FAIL because production code and static defaults still emit `sinfogear.com`.

- [ ] **Step 3: Change active canonical defaults**

In `src/data/site.ts`, set:

```ts
defaultUrl: 'https://sinofgear.com',
rfqEmail: 'inquiries@sinfogear.com',
```

In `scripts/static-site.ts`, set the default generator option to:

```ts
siteUrl = 'https://sinofgear.com'
```

In `scripts/static-site-cli.ts`, set:

```ts
siteUrl: process.env.VITE_SITE_URL?.trim() || 'https://sinofgear.com'
```

- [ ] **Step 4: Update active documentation**

In `README.md` and `PROJECT_STRUCTURE.md`:

- change the public website, canonical-origin, Cloudflare Pages custom-domain, and sitemap examples to `sinofgear.com`;
- document `www.sinofgear.com` as a redirect-only hostname;
- retain `inquiries@sinfogear.com` in current Resend and inquiry-email instructions;
- add a note that sender-domain migration waits for the enterprise mailbox phase.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run the same focused Vitest command from Step 2.

Expected: all focused tests PASS, with canonical assertions using `sinofgear.com` and sender assertions still using `inquiries@sinfogear.com`.

- [ ] **Step 6: Verify the active-string boundary**

Run:

```powershell
rg -n "https://sinfogear\.com" src scripts functions README.md PROJECT_STRUCTURE.md
rg -n "inquiries@sinfogear\.com" src functions README.md
```

Expected: the first command finds no active canonical URL. The second command still finds the intentionally retained RFQ sender configuration and documentation.

- [ ] **Step 7: Commit the canonical-origin change**

```powershell
git add src/data/site.ts src/data/site.test.ts src/pages/AboutPage.test.tsx src/lib/seo.test.ts scripts/static-site.ts scripts/static-site-cli.ts scripts/static-site.test.ts functions/api/inquiries.test.ts functions/lib/inquiryServer.test.ts README.md PROJECT_STRUCTURE.md
git commit -m "feat: migrate canonical site origin to sinofgear.com"
```

---

### Task 3: Build and Inspect the New-Domain Production Artifact

**Files:**
- Generated: `dist/index.html`
- Generated: `dist/products/worm-gears.html`
- Generated: `dist/blog.html`
- Generated: `dist/sitemap.xml`
- Generated: `dist/robots.txt`
- Generated: `dist/404.html`

**Interfaces:**
- Consumes: the canonical defaults implemented in Task 2.
- Produces: a deployment-ready `dist/` directory containing only new-domain canonical URLs.

- [ ] **Step 1: Run the complete website test suite**

Collect only website tests so the unrelated `platform/` monorepo is not included:

```powershell
$tests = @(rg --files src functions scripts | Where-Object { $_ -match '\.test\.(ts|tsx)$' })
vitest run @tests
```

Expected: all website test files PASS.

- [ ] **Step 2: Run lint and type checks**

```powershell
eslint src functions scripts
tsc -b
```

Expected: exit code 0 for both commands.

- [ ] **Step 3: Build with the explicit production origin**

Set the build-time origin and run the existing production build:

```powershell
$env:VITE_SITE_URL='https://sinofgear.com'
pnpm build
```

Expected: Vite client build, SSR static generator build, and static generation all finish successfully.

- [ ] **Step 4: Inspect generated canonical and crawler files**

Run:

```powershell
rg -n "sinfogear\.com" dist
rg -n "sinofgear\.com" dist\index.html dist\products\worm-gears.html dist\blog.html dist\sitemap.xml dist\robots.txt
```

Expected: the first command returns no old-domain matches. The second command finds the new origin in canonical links, schema, sitemap, and robots output.

- [ ] **Step 5: Verify the generated 404 and sitemap syntax**

Run:

```powershell
Select-String -Path dist\404.html -Pattern 'Page Not Found|noindex,follow'
[xml](Get-Content -Raw dist\sitemap.xml) | Out-Null
```

Expected: the 404 contains branded noindex content and the sitemap parses without error.

---

### Task 4: Activate Cloudflare DNS and Bind the New Hostnames

**Files:**
- External: Xinnet nameserver configuration for `sinofgear.com`
- External: Cloudflare DNS zone `sinofgear.com`
- External: Cloudflare Pages custom domains for project `sinoform`

**Interfaces:**
- Consumes: the two nameservers recorded in Task 1 and the existing Pages project.
- Produces: active Cloudflare authoritative DNS plus validated custom domains for the apex and `www` hostnames.

- [ ] **Step 1: Replace nameservers at Xinnet**

In the Xinnet domain console, replace all current nameservers for `sinofgear.com` with the exact two Cloudflare-assigned nameservers recorded in Task 1. Do not change ownership, registrar lock, or renewal settings.

- [ ] **Step 2: Monitor authoritative DNS activation**

Run periodically:

```powershell
Resolve-DnsName -Type NS sinofgear.com
```

Expected: the response lists exactly the two Cloudflare nameservers. Do not proceed while the zone is still Pending in Cloudflare.

- [ ] **Step 3: Add the apex custom domain to Pages**

In Cloudflare Pages project `sinoform`, add `sinofgear.com` under Custom domains. Accept only the DNS record Cloudflare creates for the Pages project; do not add email records.

- [ ] **Step 4: Add the `www` custom domain to Pages**

Add `www.sinofgear.com` to the same Pages project so Cloudflare can validate ownership and issue TLS before it becomes redirect-only.

- [ ] **Step 5: Wait for both certificates and domain statuses**

Expected in Cloudflare: both custom domains show Active and their certificates show Active. If either remains Pending, keep the old domain serving production and investigate DNS before deployment.

---

### Task 5: Deploy and Validate the New Canonical Domain

**Files:**
- Deploy: `dist/**`
- External: Cloudflare Pages project `sinoform`

**Interfaces:**
- Consumes: the verified production artifact and active custom domains.
- Produces: a Production Pages deployment served at `https://sinofgear.com`.

- [ ] **Step 1: Deploy the verified artifact to Production**

Run:

```powershell
$deployOutput = wrangler pages deploy dist --project-name sinoform --branch main 2>&1 | Tee-Object -Variable deployLog
$deploymentUrl = [regex]::Match(($deployLog -join "`n"), 'https://[a-z0-9]+\.sinoform\.pages\.dev').Value
if (-not $deploymentUrl) { throw 'Wrangler did not return a Pages deployment URL' }
$deploymentUrl
```

Expected: Cloudflare reports Deployment complete and returns a new `sinoform.pages.dev` deployment URL. Record the deployment ID and URL.

- [ ] **Step 2: Validate the Pages deployment URL before the custom domain**

```powershell
curl.exe -sS -o NUL -D - "$deploymentUrl/"
$deploymentHtml = (curl.exe -sS "$deploymentUrl/") -join "`n"
if ($deploymentHtml -notmatch '<link rel="canonical" href="https://sinofgear.com/">') {
  throw 'Deployment canonical URL is not the new production origin'
}
```

Expected: HTTP 200. Retrieve the HTML and confirm the title and canonical use `sinofgear.com`.

- [ ] **Step 3: Validate representative new-domain routes**

Run:

```powershell
curl.exe -sS -o NUL -D - -H "Cache-Control: no-cache" https://sinofgear.com/
curl.exe -sS -o NUL -D - -H "Cache-Control: no-cache" https://sinofgear.com/products/worm-gears
curl.exe -sS -o NUL -D - -H "Cache-Control: no-cache" https://sinofgear.com/quality
curl.exe -sS -o NUL -D - -H "Cache-Control: no-cache" https://sinofgear.com/contact
curl.exe -sS -o NUL -D - -H "Cache-Control: no-cache" https://sinofgear.com/blog/what-information-is-needed-for-custom-gear-rfq
```

Expected: every route returns HTTP 200 with a valid Cloudflare TLS connection.

- [ ] **Step 4: Validate crawler output and a real 404 response**

```powershell
curl.exe -sS https://sinofgear.com/sitemap.xml
curl.exe -sS https://sinofgear.com/robots.txt
curl.exe -sS -o NUL -D - https://sinofgear.com/domain-migration-404-check
```

Expected: sitemap is XML containing only `sinofgear.com`; robots points to the new sitemap; the unknown route returns HTTP 404.

- [ ] **Step 5: Confirm inquiry configuration without submitting**

Check Cloudflare Pages Production variables and secrets. Confirm:

```text
INQUIRY_TO_EMAIL = 452900431@qq.com
INQUIRY_FROM_EMAIL = Sinoform RFQ <inquiries@sinfogear.com>
RESEND_API_KEY = encrypted and unchanged
```

Do not submit the form unless the user explicitly authorizes a real test inquiry.

---

### Task 6: Enable Host-Based Permanent Redirects

**Files:**
- External: Cloudflare Redirect Rule in zone `sinofgear.com`
- External: Cloudflare Redirect Rule in zone `sinfogear.com`

**Interfaces:**
- Consumes: a fully validated `https://sinofgear.com` production site.
- Produces: loop-free 301 redirects that preserve paths and query strings.

- [ ] **Step 1: Create the new-zone `www` redirect rule**

In the `sinofgear.com` Cloudflare zone, create a dynamic redirect rule with this condition:

```text
http.host eq "www.sinofgear.com"
```

Target expression:

```text
concat("https://sinofgear.com", http.request.uri.path)
```

Use status code 301 and preserve the query string.

- [ ] **Step 2: Create the old-zone canonical redirect rule**

In the `sinfogear.com` Cloudflare zone, create a dynamic redirect rule with this condition:

```text
http.host in {"sinfogear.com" "www.sinfogear.com"}
```

Target expression:

```text
concat("https://sinofgear.com", http.request.uri.path)
```

Use status code 301 and preserve the query string. This rule belongs to the old zone; do not add a catch-all external redirect to the Pages `_redirects` file because that would also affect the new custom domain and could loop.

- [ ] **Step 3: Verify apex, `www`, old-domain paths, and queries**

Run without following redirects:

```powershell
curl.exe -sS -o NUL -D - https://www.sinofgear.com/products/worm-gears
curl.exe -sS -o NUL -D - https://sinfogear.com/products/worm-gears
curl.exe -sS -o NUL -D - "https://sinfogear.com/contact?product=spur-gears&utm_source=legacy"
```

Expected:

```text
301 Location: https://sinofgear.com/products/worm-gears
301 Location: https://sinofgear.com/products/worm-gears
301 Location: https://sinofgear.com/contact?product=spur-gears&utm_source=legacy
```

- [ ] **Step 4: Verify there is no redirect loop**

```powershell
curl.exe -sS -L --max-redirs 5 -o NUL -w "%{http_code} %{url_effective}" https://sinfogear.com/products/worm-gears
curl.exe -sS -L --max-redirs 5 -o NUL -w "%{http_code} %{url_effective}" https://www.sinofgear.com/products/worm-gears
```

Expected: both finish with `200 https://sinofgear.com/products/worm-gears`.

---

### Task 7: Search Console Handoff and Final Migration Record

**Files:**
- Modify: `README.md` only if final operational details differ from Task 2 documentation
- External: Google Search Console properties for old and new domains

**Interfaces:**
- Consumes: verified redirects, sitemap, and canonical output.
- Produces: submitted new-domain sitemap, migration evidence, and a documented rollback reference.

- [ ] **Step 1: Add the new domain to Google Search Console**

Add a Domain property for `sinofgear.com`. Use Cloudflare DNS verification. Keep the existing `sinfogear.com` property; do not delete it. Also ensure these two URL-prefix properties exist and are verified, because Google exposes the Change of Address workflow on URL-prefix properties rather than Domain properties:

```text
https://sinfogear.com/
https://sinofgear.com/
```

- [ ] **Step 2: Submit the new sitemap**

Submit exactly:

```text
https://sinofgear.com/sitemap.xml
```

Expected: Search Console accepts the sitemap for processing. Index counts do not need to update immediately.

- [ ] **Step 3: Use Search Console Change of Address if available**

From the verified `https://sinfogear.com/` URL-prefix property, open Change of Address and select the verified `https://sinofgear.com/` URL-prefix property as the destination. Complete the check only after all redirect validation in Task 6 passes.

- [ ] **Step 4: Capture final public evidence**

Record:

- Cloudflare zone Active status;
- Pages deployment ID and URL;
- custom-domain Active status and TLS status;
- representative 200, 301, and 404 checks;
- sitemap and robots checks;
- unchanged inquiry variables;
- old production deployment ID retained for rollback.

- [ ] **Step 5: Run a final repository verification**

```powershell
$tests = @(rg --files src functions scripts | Where-Object { $_ -match '\.test\.(ts|tsx)$' })
vitest run @tests
eslint src functions scripts
tsc -b
git status --short
```

Expected: website tests, lint, and type checking pass. `git status` shows only pre-existing unrelated user changes.

- [ ] **Step 6: Commit any final active-documentation correction**

Only if Step 4 revealed an operational detail that differs from `README.md`:

```powershell
git add README.md
git commit -m "docs: finalize sinofgear domain operations"
```

If README already matches production, do not create an empty commit.

## Rollback Procedure

If the new domain fails after deployment:

1. Disable the old-domain redirect rule so `sinfogear.com` serves the existing Pages site again.
2. Restore the Production Pages deployment ID recorded in Task 1.
3. Keep `sinofgear.com` in Cloudflare while DNS/TLS is repaired; do not change the registrar back unless Cloudflare authoritative DNS itself is the confirmed cause.
4. Do not change Resend or inquiry email variables during rollback.
5. Re-run the old-domain HTTP 200 and inquiry-configuration checks before declaring rollback complete.
