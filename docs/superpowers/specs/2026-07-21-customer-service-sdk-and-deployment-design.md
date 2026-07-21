# SINOFORM Customer Service SDK and Deployment Design

Date: 2026-07-21
Status: Approved direction, pending written-spec review

## Goals

- Reserve a stable integration boundary for SINOFORM's internally developed customer-service SDK.
- Keep the current website fully functional when the SDK is absent, disabled, slow, or unavailable.
- Pass useful page, language, product, and campaign context to the SDK without exposing inquiry-form personal data.
- Prepare the Vite production build for temporary Cloudflare Pages deployment and later binding to `sinoforce.net`.

## Current domain state

- `sinoforce.net` is registered with GoDaddy.
- Authoritative nameservers are `NS33.DOMAINCONTROL.COM` and `NS34.DOMAINCONTROL.COM`.
- The existing `www` host points to the previous FAI/凡科 site.
- No DNS change is authorized until the owner restores GoDaddy access or the previous provider performs the change.
- Existing mail-related MX and TXT records must be preserved during any future DNS migration.

## Customer-service architecture

### Public adapter contract

Create a vendor-neutral `CustomerServiceAdapter` interface with these operations:

- `init(config, context)` loads and initializes the SDK;
- `open()` opens the customer-service panel;
- `close()` closes it;
- `identify(visitor)` optionally identifies a visitor after consent;
- `setContext(context)` updates page and product context;
- `destroy()` removes listeners and SDK state.

The first implementation is a script-based adapter for the future internal SDK. It does not assume the SDK's final global object name or method signatures; those values are provided through configuration and isolated inside the adapter.

### Context model

The website may provide:

- active language;
- current pathname and complete public URL;
- product slug and localized product name when on a product page;
- UTM source, medium, campaign, term, and content parameters;
- referrer origin when available.

Name, company, email, phone, message, uploaded-file information, and other inquiry-form values are never sent automatically. Visitor identity is accepted only through an explicit future call after the required consent and business rules are defined.

### React provider

Add a `CustomerServiceProvider` inside the existing language and router context. It:

- reads SDK configuration from environment variables;
- remains inert when configuration is incomplete;
- loads the external script once;
- initializes the adapter after the script is ready;
- updates context on route or language changes;
- exposes status, `open`, and `close` through a hook;
- cleans up on unmount.

The provider has `disabled`, `loading`, `ready`, and `error` states. SDK errors are contained and never break navigation, SEO, RFQ, or rendering.

### Configuration

Reserve these build-time variables:

```dotenv
VITE_CUSTOMER_SERVICE_ENABLED=false
VITE_CUSTOMER_SERVICE_SDK_URL=
VITE_CUSTOMER_SERVICE_APP_ID=
VITE_CUSTOMER_SERVICE_GLOBAL=
```

The default is disabled. Enabling requires a valid HTTPS SDK URL, App ID, and agreed global integration name. No secret key is placed in the browser bundle.

### User interface

Do not add a second visible floating button while the SDK is unavailable. The existing RFQ button remains unchanged. A future customer-service launcher can consume the provider hook after the internal SDK's visual requirements are known.

## Deployment design

### Temporary deployment

Use Cloudflare Pages with:

- build command: `npm run build`;
- output directory: `dist`;
- Node.js version compatible with the current Vite toolchain;
- SPA fallback so all React Router paths resolve to `index.html`;
- temporary `*.pages.dev` address for acceptance testing.

Production environment variables are configured in the hosting dashboard, not committed to source control.

### Domain cutover

After GoDaddy access is restored:

1. export or screenshot every existing DNS record;
2. preserve MX, SPF, DKIM, DMARC, and verification records;
3. add the exact Cloudflare Pages custom-domain records shown by the hosting dashboard;
4. verify HTTPS for both apex and `www`;
5. redirect one hostname to the canonical `https://www.sinoforce.net` address;
6. test all routes, forms, structured data, language behavior, and email delivery;
7. remove the old FAI website records only after successful acceptance.

DNS values are not invented in advance because Cloudflare supplies project-specific targets.

## Error handling and security

- SDK script timeout or load error produces provider status `error` and no visible site failure.
- Repeated mounts reuse the same script and do not initialize twice.
- Only HTTPS SDK URLs are accepted in production.
- No browser-side secret is supported.
- URL context is limited to public routing and allow-listed campaign parameters.
- The website remains usable when trackers, scripts, or third-party storage are blocked.

## Testing

- Unit tests validate configuration and context extraction.
- Adapter tests cover one-time script loading, successful initialization, failure, and cleanup.
- Provider tests cover disabled mode, route/language context updates, and safe error state.
- Existing 51 tests, lint, and production build must remain green.

## Acceptance criteria

- The site contains a documented, typed integration boundary for the internal SDK.
- No SDK request occurs with default configuration.
- Enabling valid mock configuration loads the script exactly once and sends non-personal page context.
- SDK failure does not affect any current website feature.
- Cloudflare Pages deployment settings and domain cutover safeguards are documented.
- No DNS record is changed without domain-owner authorization.
