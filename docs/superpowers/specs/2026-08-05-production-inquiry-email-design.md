# Production Inquiry Email Design

## Goal

Replace the public website's local mock inquiry response with a real, secure submission path that delivers complete RFQs to `452900431@qq.com`.

## Scope

This phase includes:

- a same-origin Cloudflare Pages Function at `/api/inquiries`;
- server-side inquiry validation;
- email delivery through a transactional email provider;
- one optional engineering drawing attachment;
- a hidden honeypot field for basic bot filtering;
- localized success and failure feedback;
- a generated inquiry reference included in both the browser response and email;
- automated tests for client submission, server validation, attachment rules, and provider failure handling.

This phase does not include a CRM, permanent inquiry database, automatic customer replies, GA4/GTM/Google Ads conversion events, or CAPTCHA. Those remain follow-up work after delivery reliability is verified.

## Architecture

The React form submits `multipart/form-data` to the same-origin endpoint `/api/inquiries`. The browser never receives the email-provider API key or mailbox credentials.

The Cloudflare Pages Function:

1. accepts only `POST` requests;
2. parses the multipart payload;
3. silently accepts honeypot submissions without sending email;
4. validates required text fields and length limits;
5. validates the optional drawing by extension, MIME type where available, and a 15 MB size limit;
6. generates a `SF-...` inquiry reference;
7. sends a structured UTF-8 email to `452900431@qq.com` through the configured provider API;
8. returns JSON containing the reference and receipt timestamp only after the provider confirms acceptance.

The deployed Function reads the provider API key, sender address, and recipient address from Cloudflare environment variables or secrets. No secret is committed to source control.

## Form and Attachment Behavior

The current form fields remain: name, company, email, country, product, quantity, material, drawing, and message. The drawing input stores the actual `File` for submission instead of recording only its name.

Allowed drawing extensions are `.pdf`, `.step`, `.stp`, `.iges`, `.igs`, `.dxf`, and `.dwg`. Only one file may be uploaded, with a maximum size of 15 MB. Invalid or oversized files are rejected before submission and again by the server.

The email subject contains the inquiry reference, product, and company. The email body contains all submitted text fields, the website page URL, submission time, and client IP-derived country when Cloudflare provides it. The customer's email is used as `reply_to`, while the sender remains a verified `@sinfogear.com` address.

## Security and Privacy

- Provider credentials exist only as Cloudflare secrets.
- All text is escaped before inclusion in HTML email.
- Request and field sizes are bounded.
- The Function rejects unsupported content types and methods.
- The honeypot field is visually hidden but accessible to simple bots.
- Personal data is not stored in browser storage or a database in this phase.
- Error responses do not expose provider responses, secrets, or stack traces.

The initial anti-spam layer is deliberately small. Cloudflare Turnstile and rate limiting can be added if real traffic shows abuse.

## User Experience

While sending, the submit button remains disabled. On success, the current confirmation view remains but its mock-language copy is replaced with a real receipt message and inquiry reference. On network or provider failure, the form keeps the entered values and offers retry. Attachment guidance states the supported formats and 15 MB limit.

## Configuration

Deployment requires:

- a transactional email provider account;
- a verified sending domain or sender under `sinfogear.com`;
- an API key stored as a Cloudflare secret;
- `INQUIRY_TO_EMAIL=452900431@qq.com`;
- a verified sender such as `INQUIRY_FROM_EMAIL=inquiries@sinfogear.com`.

The provider adapter is isolated so the provider can be replaced without changing the form or validation rules.

## Testing and Acceptance

Automated tests must prove:

- the browser sends real multipart data and the selected file;
- successful server responses show the returned reference;
- invalid and oversized files are blocked;
- required server fields are enforced independently of the browser;
- bot honeypot submissions do not trigger provider delivery;
- provider rejection produces a safe retryable error;
- the recipient defaults to the configured QQ mailbox, not user-controlled input.

Before production is considered ready:

1. all public-site tests, lint, and production build pass;
2. a test deployment accepts a real inquiry with a small PDF;
3. the email arrives at `452900431@qq.com` with correct text and attachment;
4. failure behavior is checked without exposing secrets;
5. the production domain is deployed and re-tested.

