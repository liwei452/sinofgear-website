# Customer Service SDK and Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe, typed integration boundary for SINOFORM's internal customer-service SDK and prepare the Vite site for Cloudflare Pages deployment.

**Architecture:** A framework-neutral adapter owns external script loading and SDK calls; a React provider supplies route and language context without sending form PII. Hosting configuration adds SPA fallback and documents a temporary Pages deployment followed by a controlled GoDaddy DNS cutover.

**Tech Stack:** React 19, TypeScript, React Router, Vite, Vitest, Testing Library, Cloudflare Pages

## Global Constraints

- Default SDK configuration is disabled and makes no network request.
- Do not assume the internal SDK's final method signatures beyond the adapter contract.
- Do not place secret keys in Vite environment variables.
- Do not automatically send inquiry-form personal data.
- SDK errors must not affect navigation, SEO, RFQ, or rendering.
- Do not modify DNS without domain-owner authorization.
- Preserve all existing visual styling and the existing RFQ launcher.

---

### Task 1: Configuration and public context model

**Files:**
- Create: `src/customerService/types.ts`
- Create: `src/customerService/config.ts`
- Create: `src/customerService/context.ts`
- Test: `src/customerService/config.test.ts`
- Test: `src/customerService/context.test.ts`

**Interfaces:**
- Produces: `CustomerServiceConfig`, `CustomerServiceContext`, `CustomerServiceVisitor`, `CustomerServiceAdapter`
- Produces: `readCustomerServiceConfig(env): CustomerServiceConfig | null`
- Produces: `buildCustomerServiceContext(location, lang, product): CustomerServiceContext`

- [ ] **Step 1: Write failing configuration tests**

```ts
expect(readCustomerServiceConfig({ VITE_CUSTOMER_SERVICE_ENABLED: 'false' })).toBeNull()
expect(readCustomerServiceConfig({
  VITE_CUSTOMER_SERVICE_ENABLED: 'true',
  VITE_CUSTOMER_SERVICE_SDK_URL: 'https://cdn.example.com/sdk.js',
  VITE_CUSTOMER_SERVICE_APP_ID: 'public-app-id',
  VITE_CUSTOMER_SERVICE_GLOBAL: 'SinoformSupport',
})).toMatchObject({ appId: 'public-app-id', globalName: 'SinoformSupport' })
expect(readCustomerServiceConfig({
  VITE_CUSTOMER_SERVICE_ENABLED: 'true',
  VITE_CUSTOMER_SERVICE_SDK_URL: 'http://cdn.example.com/sdk.js',
})).toBeNull()
```

- [ ] **Step 2: Write failing context tests**

```ts
expect(buildCustomerServiceContext(
  { pathname: '/products/spur-gears', search: '?utm_source=google&email=x@example.com' },
  'de',
  { slug: 'spur-gears', name: 'Stirnräder' },
)).toEqual(expect.objectContaining({
  language: 'de',
  pathname: '/products/spur-gears',
  productSlug: 'spur-gears',
  campaign: { source: 'google' },
}))
expect(JSON.stringify(result)).not.toContain('email')
```

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test -- src/customerService/config.test.ts src/customerService/context.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Implement the typed configuration and allow-listed context builder**

Accept only `enabled === "true"`, an HTTPS SDK URL, non-empty App ID, and a safe JavaScript global identifier. Extract only `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `utm_content`; never copy arbitrary query parameters.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm test -- src/customerService/config.test.ts src/customerService/context.test.ts`

Expected: all configuration and context tests pass.

- [ ] **Step 6: Commit**

```text
git add src/customerService
git commit -m "feat: define customer service integration contract"
```

### Task 2: Script adapter

**Files:**
- Create: `src/customerService/scriptAdapter.ts`
- Test: `src/customerService/scriptAdapter.test.ts`

**Interfaces:**
- Consumes: `CustomerServiceConfig`, `CustomerServiceContext`, `CustomerServiceAdapter`
- Produces: `createScriptCustomerServiceAdapter(document, window): CustomerServiceAdapter`

- [ ] **Step 1: Write failing adapter tests**

Test that two `init()` calls append one script, a successful load calls the configured global initializer once, `open`, `close`, and `setContext` forward to the global client, a script error rejects initialization, and `destroy` removes listeners and calls the client destructor.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/customerService/scriptAdapter.test.ts`

Expected: FAIL because the adapter does not exist.

- [ ] **Step 3: Implement the adapter**

Use one script element identified by `data-sinoform-customer-service`. Resolve the client only through `window[config.globalName]`. Keep external global-shape assertions inside this file and expose the typed adapter contract to the rest of the app.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/customerService/scriptAdapter.test.ts`

Expected: all adapter tests pass.

- [ ] **Step 5: Commit**

```text
git add src/customerService/scriptAdapter.ts src/customerService/scriptAdapter.test.ts
git commit -m "feat: add script-based customer service adapter"
```

### Task 3: React provider integration

**Files:**
- Create: `src/customerService/CustomerServiceContext.tsx`
- Test: `src/customerService/CustomerServiceContext.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `useCustomerService(): { status; open; close; identify }`
- Consumes: router location, `useLang`, localized product lookup, adapter, and environment configuration

- [ ] **Step 1: Write failing provider tests**

Test disabled mode without adapter initialization, ready mode after successful initialization, safe `error` state after rejection, and context updates after route or language change. Assert the provider still renders its children in every state.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/customerService/CustomerServiceContext.test.tsx`

Expected: FAIL because the provider does not exist.

- [ ] **Step 3: Implement and mount the provider**

Mount it inside `LanguageProvider` and inside the router already supplied by the application host:

```tsx
<LanguageProvider>
  <CustomerServiceProvider>
    <Routes>{/* existing routes */}</Routes>
  </CustomerServiceProvider>
</LanguageProvider>
```

Use effect cleanup and an active flag so late initialization cannot update an unmounted provider. Do not add a visible launcher.

- [ ] **Step 4: Run provider and route tests**

Run: `npm test -- src/customerService/CustomerServiceContext.test.tsx src/App.test.tsx`

Expected: provider and existing route tests pass.

- [ ] **Step 5: Commit**

```text
git add src/customerService/CustomerServiceContext.tsx src/customerService/CustomerServiceContext.test.tsx src/App.tsx
git commit -m "feat: integrate customer service provider"
```

### Task 4: Hosting configuration and handoff

**Files:**
- Create: `public/_redirects`
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `PROJECT_STRUCTURE.md` only if no user-owned working-tree edit overlaps

**Interfaces:**
- Produces: Cloudflare Pages SPA fallback and documented build/domain procedure

- [ ] **Step 1: Add the SPA fallback**

```text
/* /index.html 200
```

- [ ] **Step 2: Add public SDK environment variables**

```dotenv
VITE_CUSTOMER_SERVICE_ENABLED=false
VITE_CUSTOMER_SERVICE_SDK_URL=
VITE_CUSTOMER_SERVICE_APP_ID=
VITE_CUSTOMER_SERVICE_GLOBAL=
```

- [ ] **Step 3: Document deployment**

Document `npm run build`, `dist`, temporary `pages.dev` acceptance, environment configuration, GoDaddy access recovery, DNS backup, mail-record preservation, custom-domain verification, HTTPS, canonical `www`, and rollback to the old FAI records.

- [ ] **Step 4: Run full verification**

Run:

```text
npm test
npm run lint
npm run build
git diff --check
```

Expected: all tests pass, lint exits zero, production build exits zero, and `dist/_redirects` exists.

- [ ] **Step 5: Commit**

```text
git add public/_redirects .env.example README.md
git commit -m "docs: prepare Cloudflare Pages deployment"
```
