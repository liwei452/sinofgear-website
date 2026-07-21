# Tiered File Size Limits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow factory source files up to 200 MB to be stored while restricting direct AI extraction to files smaller than 50 MB.

**Architecture:** The API owns both size limits and exposes AI eligibility with each file item. The browser mirrors the upload limit for immediate feedback and uses the server-provided eligibility flag to prevent invalid extraction requests; the extraction endpoint remains the authoritative guard.

**Tech Stack:** TypeScript, Fastify, SQLite, React, TanStack Query, Vitest, Testing Library

## Global Constraints

- Maximum stored upload size is 200 MB per file.
- Direct AI extraction accepts only files smaller than 50 MB.
- Files from 50 MB through 200 MB remain downloadable and versioned.
- Both browser and API enforce their relevant boundary.
- Preserve unrelated working-tree changes.

---

### Task 1: Enforce tiered limits in the API

**Files:**
- Modify: `platform/apps/api/src/routes/files.ts`
- Test: `platform/apps/api/src/routes/files.test.ts`

**Interfaces:**
- Produces: `maximumUploadFileSize = 200 * 1024 * 1024`
- Produces: `maximumAiExtractionFileSize = 50 * 1024 * 1024`
- Produces: `isAiExtractionEligible(size: number): boolean`
- Produces: `FileAsset.aiExtractionEligible: boolean`
- Produces: `AI_FILE_TOO_LARGE` response with HTTP 422 from the extraction endpoint.

- [ ] **Step 1: Write failing API tests**

Add boundary coverage before changing production code:

```ts
expect(maximumUploadFileSize).toBe(200 * 1024 * 1024)
expect(isAiExtractionEligible(maximumAiExtractionFileSize - 1)).toBe(true)
expect(isAiExtractionEligible(maximumAiExtractionFileSize)).toBe(false)
```

Insert a 50 MB-sized file metadata row directly into the in-memory database, post to its extraction endpoint, and assert:

```ts
expect(response.statusCode).toBe(422)
expect(response.json().code).toBe('AI_FILE_TOO_LARGE')
expect(database.prepare('SELECT COUNT(*) AS count FROM ai_tasks').get()).toEqual({ count: 0 })
```

Rename the existing oversize upload test to assert `maximumUploadFileSize + 1` is rejected.

- [ ] **Step 2: Run the API route test and verify RED**

Run: `pnpm --filter @workbench/api test -- src/routes/files.test.ts`

Expected: FAIL because the new constants, eligibility field, and extraction guard do not exist.

- [ ] **Step 3: Implement the minimal API behavior**

Add the constants and predicate:

```ts
export const maximumUploadFileSize = 200 * 1024 * 1024
export const maximumAiExtractionFileSize = 50 * 1024 * 1024
export function isAiExtractionEligible(size: number) {
  return size < maximumAiExtractionFileSize
}
```

Use the upload constant for multipart limits and 200 MB error copy. Derive `aiExtractionEligible` in `toFileAsset` with the predicate. Before enqueuing, return:

```ts
if (!asset.aiExtractionEligible) {
  return reply.code(422).send({
    code: 'AI_FILE_TOO_LARGE',
    message: '文件已保存，但达到或超过 AI 直接提取的 50 MB 上限，请拆分或压缩后再提取。',
  })
}
```

- [ ] **Step 4: Run API tests and verify GREEN**

Run: `pnpm --filter @workbench/api test -- src/routes/files.test.ts`

Expected: all file route tests PASS.

- [ ] **Step 5: Commit the API boundary**

Stage the two API files, then run: `git commit -m "feat: separate upload and AI extraction limits"`

### Task 2: Explain and enforce the limits in the workbench

**Files:**
- Modify: `platform/apps/workbench/src/pages/ProjectFilesPage.tsx`
- Test: `platform/apps/workbench/src/pages/ProjectFilesPage.test.tsx`
- Modify: `platform/README.md`

**Interfaces:**
- Consumes: `FileItem.aiExtractionEligible: boolean` from Task 1.
- Produces: 200 MB client upload validation and an ineligible-file status/action state.

- [ ] **Step 1: Write failing workbench tests**

Update the upload error expectation to mention 200 MB. Add a rendered file fixture with `aiExtractionEligible: false` and assert:

```ts
expect(await screen.findByText('需拆分后提取')).toBeInTheDocument()
expect(screen.queryByRole('button', { name: '开始 AI 提取' })).not.toBeInTheDocument()
expect(screen.getByRole('button', { name: '下载' })).toBeInTheDocument()
```

- [ ] **Step 2: Run the page test and verify RED**

Run: `pnpm --filter @workbench/web test -- src/pages/ProjectFilesPage.test.tsx`

Expected: FAIL because the page still advertises 50 MB uploads and ignores AI eligibility.

- [ ] **Step 3: Implement the minimal workbench behavior**

Use:

```ts
interface FileItem {
  // existing fields
  aiExtractionEligible: boolean
}

const maximumUploadFileSize = 200 * 1024 * 1024
```

Change client error copy to 200 MB and explain: `单个文件最多 200 MB；小于 50 MB 可直接 AI 提取，较大的文件请先拆分或压缩。` For ineligible files, render `需拆分后提取` and omit the extraction button while retaining Download. Update `platform/README.md` with the same two limits.

- [ ] **Step 4: Run page tests and verify GREEN**

Run: `pnpm --filter @workbench/web test -- src/pages/ProjectFilesPage.test.tsx`

Expected: all project files page tests PASS.

- [ ] **Step 5: Run full verification**

Run `pnpm test`, then `pnpm lint`, then `pnpm build`.

Expected: all tests pass, lint exits 0, and production build succeeds.

- [ ] **Step 6: Commit the workbench behavior**

Stage the workbench files and README, then run: `git commit -m "feat: support 200 MB source files"`

### Task 3: Restart and smoke-test the running workbench

**Files:**
- No file changes.

**Interfaces:**
- Consumes: web app on port 4273, API on port 4100, worker with fake AI provider.

- [ ] **Step 1: Restart only the workbench API, worker, and web processes**

Use the existing explicit database and storage paths so the seeded login and SINOFORM project remain available.

- [ ] **Step 2: Verify the live endpoints**

Confirm `http://127.0.0.1:4273` returns HTTP 200, login succeeds through `http://127.0.0.1:4100/api/session`, and the project files response includes `aiExtractionEligible`.

- [ ] **Step 3: Verify browser copy**

Open the project file library and confirm it shows the 200 MB storage limit and 50 MB AI extraction boundary.
