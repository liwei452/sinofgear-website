# Production Inquiry Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock RFQ response with a tested Cloudflare Pages Function that sends form data and one drawing attachment to `452900431@qq.com` through Resend.

**Architecture:** The React form sends same-origin `multipart/form-data` to `/api/inquiries`. A Cloudflare Pages Function validates the payload, filters honeypot submissions, builds an escaped email, calls the Resend HTTP API, and returns a reference only after Resend accepts the message. Secrets remain in Cloudflare runtime bindings.

**Tech Stack:** React 19, TypeScript 5.9, Vitest, Cloudflare Pages Functions, Fetch API, Resend Email API

## Global Constraints

- Send every real notification to `452900431@qq.com` through the server-side `INQUIRY_TO_EMAIL` binding.
- Accept one optional `.pdf`, `.step`, `.stp`, `.iges`, `.igs`, `.dxf`, or `.dwg` file, maximum 15 MB.
- Never expose or commit `RESEND_API_KEY`.
- Do not persist inquiry personal data in browser storage or a database.
- Use `inquiries@sinfogear.com` as the default verified sender and the customer email as `reply_to`.
- Keep CRM storage, automatic replies, analytics conversion events, CAPTCHA, and rate limiting outside this phase.
- Every production behavior follows red-green-refactor: add a focused failing test, confirm the expected failure, then add minimal code.

---

## File Structure

- `src/lib/inquiry.ts`: browser-side RFQ value model and file validation.
- `src/lib/inquiry.test.ts`: value and drawing-file validation tests.
- `src/services/inquiryApi.ts`: multipart request adapter and safe response parsing.
- `src/services/inquiryApi.test.ts`: browser API request tests.
- `src/components/InquiryForm.tsx`: actual file state, honeypot field, and localized status UI.
- `src/pages/ContactPage.test.tsx`: user-visible form flow coverage.
- `src/data/pages.ts`, `src/i18n/siteTranslations.ts`: real submission and attachment copy.
- `functions/api/inquiries.ts`: thin Pages Function entry point.
- `functions/lib/inquiryServer.ts`: parsing, server validation, email composition, and Resend adapter.
- `functions/lib/inquiryServer.test.ts`: server behavior and provider boundary tests.
- `.env.example`, `.gitignore`, `README.md`, `PROJECT_STRUCTURE.md`: safe runtime configuration and operations documentation.

### Task 1: Browser Drawing Model and Validation

**Files:**
- Modify: `src/lib/inquiry.ts`
- Modify: `src/lib/inquiry.test.ts`

**Interfaces:**
- Produces: `MAX_DRAWING_BYTES = 15 * 1024 * 1024`
- Produces: `ALLOWED_DRAWING_EXTENSIONS: readonly string[]`
- Produces: `InquiryValues.drawingFile: File | null`
- Produces: `InquiryValues.website: string` as the honeypot value
- Produces: `validateDrawing(file: File | null): string | undefined`

- [ ] **Step 1: Write failing tests for a valid PDF, unsupported extension, and a file larger than 15 MB**

```ts
it('accepts a supported drawing no larger than 15 MB', () => {
  const file = new File(['drawing'], 'gear.step', { type: 'application/octet-stream' })
  expect(validateDrawing(file)).toBeUndefined()
})

it('rejects unsupported drawing extensions', () => {
  const file = new File(['image'], 'gear.png', { type: 'image/png' })
  expect(validateDrawing(file)).toBe('Upload a PDF, STEP, STP, IGES, IGS, DXF, or DWG file.')
})

it('rejects drawings larger than 15 MB', () => {
  const file = new File([new Uint8Array(MAX_DRAWING_BYTES + 1)], 'gear.pdf', { type: 'application/pdf' })
  expect(validateDrawing(file)).toBe('The drawing must be 15 MB or smaller.')
})
```

- [ ] **Step 2: Run `npm test -- src/lib/inquiry.test.ts` and confirm failure because the file API and validator do not exist**

- [ ] **Step 3: Replace `drawingFileName` with `drawingFile`, add constants, and implement extension/size validation**

```ts
export const MAX_DRAWING_BYTES = 15 * 1024 * 1024
export const ALLOWED_DRAWING_EXTENSIONS = ['pdf', 'step', 'stp', 'iges', 'igs', 'dxf', 'dwg'] as const

export function validateDrawing(file: File | null) {
  if (!file) return undefined
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_DRAWING_EXTENSIONS.includes(extension as (typeof ALLOWED_DRAWING_EXTENSIONS)[number])) {
    return 'Upload a PDF, STEP, STP, IGES, IGS, DXF, or DWG file.'
  }
  if (file.size > MAX_DRAWING_BYTES) return 'The drawing must be 15 MB or smaller.'
  return undefined
}
```

- [ ] **Step 4: Run `npm test -- src/lib/inquiry.test.ts` and confirm all inquiry validation tests pass**

- [ ] **Step 5: Commit only the Task 1 files with `git commit -m "feat: validate inquiry drawing uploads"`**

### Task 2: Real Browser Submission Adapter

**Files:**
- Modify: `src/services/inquiryApi.ts`
- Modify: `src/services/inquiryApi.test.ts`

**Interfaces:**
- Consumes: `InquiryValues` with `drawingFile: File | null`
- Produces: `submitInquiry(values: InquiryValues, options?: { fetcher?: typeof fetch }): Promise<InquiryResult>`
- Sends: `POST /api/inquiries` with `FormData`

- [ ] **Step 1: Replace mock tests with failing tests that inspect a real multipart POST and safe error behavior**

```ts
it('posts all inquiry values and the drawing to the production endpoint', async () => {
  const fetcher = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) =>
    Response.json({ reference: 'SF-TEST123', receivedAt: '2026-08-05T00:00:00.000Z' }),
  )
  await submitInquiry({ ...inquiry, drawingFile: new File(['pdf'], 'gear.pdf') }, { fetcher })
  expect(fetcher).toHaveBeenCalledWith('/api/inquiries', expect.objectContaining({ method: 'POST' }))
  const body = fetcher.mock.calls[0][1]?.body as FormData
  expect(body.get('email')).toBe(inquiry.email)
  expect((body.get('drawing') as File).name).toBe('gear.pdf')
})

it('throws a safe message when the API rejects the request', async () => {
  const fetcher = vi.fn(async () => Response.json({ error: 'internal provider text' }, { status: 502 }))
  await expect(submitInquiry(inquiry, { fetcher })).rejects.toThrow(
    'We could not submit your inquiry. Please try again.',
  )
})
```

- [ ] **Step 2: Run `npm test -- src/services/inquiryApi.test.ts` and confirm failure because the adapter still returns a mock reference**

- [ ] **Step 3: Implement multipart serialization, fetch injection for tests, response shape checks, and the fixed public error message**

```ts
export async function submitInquiry(values: InquiryValues, options: { fetcher?: typeof fetch } = {}) {
  const body = new FormData()
  for (const [key, value] of Object.entries(values)) {
    if (key === 'drawingFile') continue
    body.set(key, String(value))
  }
  if (values.drawingFile) body.set('drawing', values.drawingFile, values.drawingFile.name)
  body.set('sourceUrl', window.location.href)
  const response = await (options.fetcher ?? fetch)('/api/inquiries', { method: 'POST', body })
  if (!response.ok) throw new Error('We could not submit your inquiry. Please try again.')
  return parseInquiryResult(await response.json())
}
```

- [ ] **Step 4: Run `npm test -- src/services/inquiryApi.test.ts` and confirm both success and failure tests pass**

- [ ] **Step 5: Commit only the Task 2 files with `git commit -m "feat: submit inquiries to production endpoint"`**

### Task 3: Form File State, Honeypot, and Real Receipt Copy

**Files:**
- Modify: `src/components/InquiryForm.tsx`
- Modify: `src/pages/ContactPage.test.tsx`
- Modify: `src/data/pages.ts`
- Modify: `src/i18n/siteTranslations.ts`

**Interfaces:**
- Consumes: `validateDrawing()` and `InquiryValues.drawingFile`
- Adds multipart field: `website` as an empty honeypot value
- Keeps existing `InquirySubmitter` and `InquiryResult` UI boundary

- [ ] **Step 1: Add failing interaction tests for file selection, invalid file feedback, and real success copy**

```ts
it('passes the selected engineering drawing to the submitter', async () => {
  const submitter = vi.fn(async () => ({ reference: 'SF-REAL1', receivedAt: new Date().toISOString() }))
  render(<ContactPage submitter={submitter} />)
  const drawing = new File(['drawing'], 'gear.step', { type: 'application/octet-stream' })
  await user.upload(screen.getByLabelText(/drawing/i), drawing)
  await fillRequiredFields(user)
  await user.click(screen.getByRole('button', { name: /submit inquiry/i }))
  expect(submitter).toHaveBeenCalledWith(expect.objectContaining({ drawingFile: drawing, website: '' }))
})
```

- [ ] **Step 2: Run `npm test -- src/pages/ContactPage.test.tsx` and confirm failure because the component records only a filename**

- [ ] **Step 3: Store the `File`, run `validateDrawing` before submission, add an off-screen honeypot input, and replace mock copy in all five languages**

```tsx
<div className="absolute left-[-10000px]" aria-hidden="true">
  <Label htmlFor="website">Website</Label>
  <Input id="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => setField('website', event.target.value)} />
</div>
```

Use English success copy: `Thank you. Your inquiry has been sent to our engineering team. Please keep the reference below for follow-up.`

Use English attachment note: `Optional drawing: PDF, STEP/STP, IGES/IGS, DXF, or DWG; maximum 15 MB.`

- [ ] **Step 4: Run `npm test -- src/pages/ContactPage.test.tsx src/lib/inquiry.test.ts` and confirm the form and validator pass**

- [ ] **Step 5: Commit only the Task 3 files with `git commit -m "feat: send drawing files from inquiry form"`**

### Task 4: Server Validation and Email Provider Module

**Files:**
- Create: `functions/lib/inquiryServer.ts`
- Create: `functions/lib/inquiryServer.test.ts`

**Interfaces:**
- Produces: `parseInquiryForm(form: FormData): ParsedInquiry`
- Produces: `buildInquiryEmail(inquiry: ParsedInquiry, meta: SubmissionMeta, env: InquiryEnv): ResendEmailPayload`
- Produces: `sendInquiryEmail(payload: ResendEmailPayload, env: InquiryEnv, fetcher?: typeof fetch): Promise<void>`
- Produces: `InquiryValidationError` for safe 400 responses

- [ ] **Step 1: Add failing unit tests for required fields, 15 MB and extension enforcement, HTML escaping, fixed recipient, attachment base64, honeypot detection, and provider rejection**

```ts
it('escapes customer input and always targets the configured mailbox', async () => {
  const parsed = parseInquiryForm(validForm({ message: '<script>alert(1)</script>' }))
  const email = await buildInquiryEmail(parsed, { reference: 'SF-TEST', receivedAt: '2026-08-05T00:00:00.000Z', country: 'US' }, configuredEnv())
  expect(email.to).toEqual(['452900431@qq.com'])
  expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  expect(email.html).not.toContain('<script>')
})

it('turns an attachment into Resend base64 content', async () => {
  const parsed = parseInquiryForm(validForm({ drawing: new File(['abc'], 'gear.step') }))
  const email = await buildInquiryEmail(parsed, testMeta, configuredEnv())
  expect(email.attachments).toEqual([{ filename: 'gear.step', content: 'YWJj' }])
})
```

- [ ] **Step 2: Run `npm test -- functions/lib/inquiryServer.test.ts` and confirm failure because the server module does not exist**

- [ ] **Step 3: Implement bounded parsing, escaping, provider-independent payload construction, and a Resend `POST https://api.resend.com/emails` adapter**

```ts
await fetcher('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
```

The payload must set `from`, `to: [env.INQUIRY_TO_EMAIL]`, `reply_to`, `subject`, `html`, `text`, and optional `attachments` using Resend's documented base64 `content` field.

- [ ] **Step 4: Run `npm test -- functions/lib/inquiryServer.test.ts` and confirm all validation, escaping, attachment, and provider tests pass**

- [ ] **Step 5: Commit the two server module files with `git commit -m "feat: validate and deliver inquiry emails"`**

### Task 5: Cloudflare Pages Function Endpoint

**Files:**
- Create: `functions/api/inquiries.ts`
- Create: `functions/api/inquiries.test.ts`

**Interfaces:**
- Consumes: server helpers from `functions/lib/inquiryServer.ts`
- Produces: `onRequestPost(context)` and `onRequest(context)` Pages Function exports
- Returns: `200 { reference, receivedAt }`, `400 { error: 'Invalid inquiry.' }`, `405`, or `502 { error: 'Inquiry delivery failed.' }`

- [ ] **Step 1: Add failing handler tests for success, method rejection, invalid multipart data, honeypot no-send, missing configuration, and provider failure**

```ts
it('returns a receipt only after the provider accepts the email', async () => {
  const response = await onRequestPost(makeContext(validRequest(), configuredEnv(), acceptingFetch))
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual(expect.objectContaining({ reference: expect.stringMatching(/^SF-/) }))
})

it('accepts a honeypot submission without calling the provider', async () => {
  const fetcher = vi.fn()
  const response = await onRequestPost(makeContext(validRequest({ website: 'bot.example' }), configuredEnv(), fetcher))
  expect(response.status).toBe(200)
  expect(fetcher).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run `npm test -- functions/api/inquiries.test.ts` and confirm failure because the route does not exist**

- [ ] **Step 3: Implement the thin route, derive country from `request.cf?.country`, generate the reference with `crypto.randomUUID()`, and map internal errors to safe JSON responses**

```ts
export const onRequestPost = async (context: PagesContext<InquiryEnv>) => {
  const form = await context.request.formData()
  const inquiry = parseInquiryForm(form)
  const receivedAt = new Date().toISOString()
  const reference = `SF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  if (!inquiry.isBot) {
    const payload = await buildInquiryEmail(inquiry, { reference, receivedAt, country: context.request.cf?.country ?? '' }, context.env)
    await sendInquiryEmail(payload, context.env)
  }
  return Response.json({ reference, receivedAt })
}
```

- [ ] **Step 4: Run `npm test -- functions/api/inquiries.test.ts functions/lib/inquiryServer.test.ts` and confirm endpoint and server tests pass**

- [ ] **Step 5: Commit the endpoint files with `git commit -m "feat: add Cloudflare inquiry endpoint"`**

### Task 6: Configuration, Full Verification, and Production Handoff

**Files:**
- Modify: `.env.example`
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `PROJECT_STRUCTURE.md`

**Interfaces:**
- Requires secret: `RESEND_API_KEY`
- Requires variables: `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`

- [ ] **Step 1: Add safe examples and deployment instructions without a real key**

```dotenv
INQUIRY_TO_EMAIL=452900431@qq.com
INQUIRY_FROM_EMAIL=Sinoform RFQ <inquiries@sinfogear.com>
```

`RESEND_API_KEY` is intentionally absent from the example file and is entered interactively with the Cloudflare secret command below.

Document these production commands:

```powershell
npx wrangler pages secret put RESEND_API_KEY --project-name sinoform
npx wrangler pages secret put INQUIRY_TO_EMAIL --project-name sinoform
npx wrangler pages secret put INQUIRY_FROM_EMAIL --project-name sinoform
npm run build
npx wrangler pages deploy dist --project-name sinoform --branch main
```

- [ ] **Step 2: Ensure `.gitignore` contains `.dev.vars`, `.dev.vars.*`, and `.env.local`**

- [ ] **Step 3: Run the isolated public-site suite `npm test -- --exclude 'platform/**'` and confirm zero failures**

- [ ] **Step 4: Run `npm exec -- eslint src functions` and confirm zero errors**

- [ ] **Step 5: Run `npm run build` and confirm the production bundle succeeds**

- [ ] **Step 6: Verify the Resend sending domain records for `sinfogear.com`, create a sending-only API key, and save it as a Cloudflare encrypted secret**

- [ ] **Step 7: Deploy a preview, submit one small PDF RFQ, and confirm the subject, reply-to, fields, and PDF arrive at `452900431@qq.com`**

- [ ] **Step 8: Deploy production, submit a second RFQ on `https://sinfogear.com/contact`, and confirm the browser reference matches the delivered email**

- [ ] **Step 9: Commit documentation changes with `git commit -m "docs: configure production inquiry delivery"`**

## Final Acceptance Checklist

- [ ] The public form no longer returns the local mock message.
- [ ] A real inquiry reaches `452900431@qq.com`.
- [ ] The customer email is the reply-to address.
- [ ] The allowed drawing arrives intact and unsupported or oversized files are rejected.
- [ ] No API key or personal data appears in the bundle, repository, or browser storage.
- [ ] Provider failures leave form values intact and show the retry action.
- [ ] Public tests, endpoint tests, lint, and production build all pass immediately before deployment.
