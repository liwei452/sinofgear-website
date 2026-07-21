# AI 外贸精准获客工作台第一阶段实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付一个内部可登录的工作台，使团队能够为齿轮工厂建立项目、上传资料、用 AI 提取并人工确认能力、生成和选择产品—市场候选方向。

**Architecture:** 保留仓库根目录的 SINOFORM 对外网站，在 `platform/` 中建立独立的 npm workspace，包含 React 工作台、Fastify API 和共享契约包。PostgreSQL 保存结构化数据和审核历史，S3 兼容对象存储保存原始文件，独立 worker 执行 OpenAI Responses API 的结构化提取任务；AI 通过接口隔离，后续可以替换模型供应商。

**Tech Stack:** TypeScript 5.9、React 19、Vite 7、React Router 7、TanStack Query 5、Fastify 5、Prisma、PostgreSQL 17、MinIO、OpenAI JavaScript SDK、Zod 4、Vitest、Testing Library、Playwright。

## Global Constraints

- 当前根目录外贸网站保持独立部署，第一阶段不得把内部工作台路由嵌入 `src/`。
- 第一阶段只开放管理员、项目成员和只读成员；不开放工厂协作者。
- 只有 `CONFIRMED` 能力可进入产品—市场候选生成；`NEEDS_EVIDENCE`、`INTERNAL_ONLY` 和 `REJECTED` 不得用于对外内容。
- AI 输出必须记录原始文件、模型、生成时间、置信度和人工审核状态。
- 第一阶段不包含 LinkedIn 自动抓取、自动邮件、AI 自动报价、通用 CRM、在线收费或工厂自助注册。
- 文件允许 PDF、DOC/DOCX、CSV/XLS/XLSX、TXT/MD、JPG/JPEG/PNG/WEBP；单文件上限固定为 50 MB。
- OpenAI 默认模型为 `gpt-5.6-terra`，通过 `OPENAI_MODEL` 覆盖；业务代码不得依赖该模型名称。
- 所有对外动作保持人工控制；本阶段不从工作台发送邮件或 LinkedIn 消息。

---

## Scope Decomposition

完整设计拆为三个独立阶段：

1. **本计划：工作台基础、工厂诊断、能力审核和市场方向选择。**
2. 后续独立计划：目标企业导入、研究评分、触达内容与跟进状态。
3. 后续独立计划：官网活动标识、AI 客服/询盘同步、漏斗复盘和双报告生成。

第一阶段完成后即形成可演示、可录入真实齿轮工厂资料的垂直切片，不依赖第二、三阶段才能验收。

## File Structure

```text
platform/
  package.json                     # workspace 命令
  package-lock.json                # platform 独立依赖锁
  docker-compose.yml               # PostgreSQL 与 MinIO 本地依赖
  .env.example                     # 无密钥的配置样例
  README.md                        # 启动、迁移、worker 与验收说明
  packages/contracts/
    package.json
    src/index.ts                   # 全端共享 Zod schema 和 TypeScript 类型
    src/capability.ts              # 能力提取与审核契约
    src/market.ts                  # 市场候选、证据和选择契约
  apps/api/
    package.json
    prisma/schema.prisma           # 用户、会话、项目、文件、任务、能力、候选和审计数据
    prisma/seed.ts                 # 初始管理员
    src/app.ts                     # Fastify 组装与统一错误格式
    src/server.ts                  # HTTP 进程入口
    src/worker.ts                  # AI 后台任务入口
    src/config.ts                  # 环境变量校验
    src/auth/session.ts            # 不透明 session cookie
    src/auth/authorization.ts      # 角色与项目授权
    src/storage/objectStorage.ts   # 对象存储接口
    src/storage/s3Storage.ts       # MinIO/S3 实现
    src/ai/capabilityExtractor.ts  # AI 能力提取接口
    src/ai/openAiExtractor.ts      # OpenAI Responses 适配器
    src/ai/marketGenerator.ts      # 候选方向生成接口和 OpenAI 适配器
    src/jobs/claimTask.ts           # 安全领取一个队列任务
    src/jobs/processTask.ts         # 处理、重试并记录 AI 任务
    src/routes/auth.ts
    src/routes/projects.ts
    src/routes/files.ts
    src/routes/capabilities.ts
    src/routes/markets.ts
    src/routes/audit.ts
    src/test/fakes.ts               # 测试存储和 AI 假实现
    src/**/*.test.ts
  apps/workbench/
    package.json
    src/main.tsx
    src/app/router.tsx              # 登录保护和页面路由
    src/app/queryClient.ts
    src/api/client.ts               # 带 cookie 的统一 API 客户端
    src/layout/WorkbenchLayout.tsx
    src/pages/LoginPage.tsx
    src/pages/DashboardPage.tsx
    src/pages/ProjectListPage.tsx
    src/pages/ProjectOverviewPage.tsx
    src/pages/ProjectFilesPage.tsx
    src/pages/CapabilityReviewPage.tsx
    src/pages/MarketSelectionPage.tsx
    src/components/AsyncTaskStatus.tsx
    src/components/EvidenceLink.tsx
    src/test/setup.ts
    src/**/*.test.tsx
    e2e/phase-one.spec.ts
```

---

### Task 1: 建立独立 platform workspace 与健康检查

**Files:**
- Create: `platform/package.json`
- Create: `platform/docker-compose.yml`
- Create: `platform/.env.example`
- Create: `platform/packages/contracts/package.json`
- Create: `platform/packages/contracts/src/index.ts`
- Create: `platform/apps/api/package.json`
- Create: `platform/apps/api/src/config.ts`
- Create: `platform/apps/api/src/app.ts`
- Create: `platform/apps/api/src/server.ts`
- Create: `platform/apps/api/src/app.test.ts`
- Create: `platform/apps/workbench/package.json`
- Create: `platform/apps/workbench/index.html`
- Create: `platform/apps/workbench/src/main.tsx`
- Create: `platform/apps/workbench/src/app/router.tsx`
- Create: `platform/apps/workbench/src/pages/DashboardPage.tsx`
- Create: `platform/apps/workbench/src/test/setup.ts`
- Create: `platform/apps/workbench/src/pages/DashboardPage.test.tsx`

**Interfaces:**
- Produces: `buildApp(): Promise<FastifyInstance>` and `GET /health -> { status: "ok" }`.
- Produces: workspace commands `npm run dev`, `npm test`, `npm run build`, `npm run lint`.

- [ ] **Step 1: Write the failing API and UI smoke tests**

```ts
// platform/apps/api/src/app.test.ts
import { describe, expect, it } from 'vitest'
import { buildApp } from './app.js'

describe('health', () => {
  it('returns ok', async () => {
    const app = await buildApp()
    const response = await app.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
    await app.close()
  })
})

// platform/apps/workbench/src/pages/DashboardPage.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardPage } from './DashboardPage'

describe('DashboardPage', () => {
  it('names the internal workbench', () => {
    render(<DashboardPage />)
    expect(screen.getByRole('heading', { name: 'AI 外贸精准获客工作台' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Install workspace dependencies and run the tests to verify failure**

Run from `platform/`:

```powershell
npm install
npm test
```

Expected: FAIL because `buildApp` and `DashboardPage` do not exist.

- [ ] **Step 3: Add minimal API, UI and local infrastructure**

```ts
// platform/apps/api/src/app.ts
import Fastify from 'fastify'

export async function buildApp() {
  const app = Fastify({ logger: false })
  app.get('/health', async () => ({ status: 'ok' as const }))
  return app
}

// platform/apps/workbench/src/pages/DashboardPage.tsx
export function DashboardPage() {
  return <main><h1>AI 外贸精准获客工作台</h1></main>
}
```

`platform/docker-compose.yml` must define PostgreSQL 17 on port `5433` and MinIO on ports `9000/9001`, use named volumes, create bucket `factory-files`, and read credentials only from `.env`. `platform/.env.example` must contain non-secret local defaults plus `OPENAI_API_KEY=` and `OPENAI_MODEL=gpt-5.6-terra`.

- [ ] **Step 4: Run smoke verification**

```powershell
npm test
npm run build
```

Expected: both smoke tests PASS; API and workbench TypeScript builds succeed.

- [ ] **Step 5: Commit**

```powershell
git add platform
git commit -m "feat: scaffold export workbench platform"
```

---

### Task 2: 建立共享契约、数据库和项目级授权

**Files:**
- Create: `platform/packages/contracts/src/capability.ts`
- Create: `platform/packages/contracts/src/market.ts`
- Modify: `platform/packages/contracts/src/index.ts`
- Create: `platform/apps/api/prisma/schema.prisma`
- Create: `platform/apps/api/prisma/seed.ts`
- Create: `platform/apps/api/src/db.ts`
- Create: `platform/apps/api/src/auth/session.ts`
- Create: `platform/apps/api/src/auth/authorization.ts`
- Create: `platform/apps/api/src/auth/authorization.test.ts`
- Create: `platform/apps/api/src/routes/auth.ts`
- Modify: `platform/apps/api/src/app.ts`

**Interfaces:**
- Produces: `ProjectRole = 'ADMIN' | 'MEMBER' | 'VIEWER'`.
- Produces: `CapabilityReviewStatus = 'PENDING_REVIEW' | 'CONFIRMED' | 'NEEDS_EVIDENCE' | 'INTERNAL_ONLY' | 'REJECTED'`.
- Produces: `requireProjectRole(request, projectId, allowedRoles): Promise<ProjectMembership>`.
- Produces: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` with HTTP-only `workbench_session` cookie.

- [ ] **Step 1: Write authorization tests**

```ts
// platform/apps/api/src/auth/authorization.test.ts
import { describe, expect, it } from 'vitest'
import { canAccessProject } from './authorization.js'

describe('canAccessProject', () => {
  it('allows a member to edit their project', () => {
    expect(canAccessProject('MEMBER', ['ADMIN', 'MEMBER'])).toBe(true)
  })

  it('prevents a viewer from editing', () => {
    expect(canAccessProject('VIEWER', ['ADMIN', 'MEMBER'])).toBe(false)
  })

  it('allows a viewer to read', () => {
    expect(canAccessProject('VIEWER', ['ADMIN', 'MEMBER', 'VIEWER'])).toBe(true)
  })
})
```

- [ ] **Step 2: Run the focused test to verify failure**

```powershell
npm --workspace apps/api test -- src/auth/authorization.test.ts
```

Expected: FAIL because `canAccessProject` is missing.

- [ ] **Step 3: Define the exact shared status contracts**

```ts
// platform/packages/contracts/src/capability.ts
import { z } from 'zod'

export const capabilityReviewStatusSchema = z.enum([
  'PENDING_REVIEW',
  'CONFIRMED',
  'NEEDS_EVIDENCE',
  'INTERNAL_ONLY',
  'REJECTED',
])

export const capabilityDraftSchema = z.object({
  category: z.enum(['PRODUCT', 'MATERIAL', 'PROCESS', 'DIMENSION', 'PRECISION', 'APPLICATION', 'DELIVERY', 'QUALITY', 'OTHER']),
  name: z.string().min(1),
  value: z.string().min(1),
  evidenceQuote: z.string().min(1),
  sourceLocator: z.string().min(1),
  confidence: z.number().min(0).max(1),
  recommendedStatus: capabilityReviewStatusSchema,
})

export const capabilityExtractionSchema = z.object({
  summary: z.string().min(1),
  capabilities: z.array(capabilityDraftSchema),
  interviewQuestions: z.array(z.string().min(1)),
})

export type CapabilityReviewStatus = z.infer<typeof capabilityReviewStatusSchema>
export type CapabilityExtraction = z.infer<typeof capabilityExtractionSchema>
```

```ts
// platform/packages/contracts/src/market.ts
import { z } from 'zod'

export const marketCandidateSchema = z.object({
  productFocus: z.string().min(1),
  region: z.string().min(1),
  customerType: z.string().min(1),
  rationale: z.string().min(1),
  capabilityIds: z.array(z.string()).min(1),
  uncertainties: z.array(z.string()),
  interviewQuestions: z.array(z.string()),
  scores: z.object({
    capabilityFit: z.number().int().min(1).max(5),
    evidenceStrength: z.number().int().min(1).max(5),
    discoverability: z.number().int().min(1).max(5),
    deliveryConfidence: z.number().int().min(1).max(5),
    technicalRisk: z.number().int().min(1).max(5),
  }),
})

export const marketGenerationSchema = z.object({
  candidates: z.array(marketCandidateSchema).min(3).max(5),
})
```

- [ ] **Step 4: Add the data model and authorization implementation**

`schema.prisma` must define `User`, `Session`, `FactoryProject`, `ProjectMembership`, `FileAsset`, `AiTask`, `Capability`, `CapabilityReview`, `MarketCandidate`, `MarketEvidence`, `MarketDecision`, and `AuditEvent`. Every project-owned table must include `projectId` and an index on it. `Session.tokenHash` is unique; raw session tokens must never be stored.

```ts
// platform/apps/api/src/auth/authorization.ts
export type ProjectRole = 'ADMIN' | 'MEMBER' | 'VIEWER'

export function canAccessProject(role: ProjectRole, allowedRoles: ProjectRole[]) {
  return allowedRoles.includes(role)
}
```

`session.ts` must generate 32 random bytes, store only a SHA-256 hash, set `workbench_session` as `httpOnly`, `sameSite: 'strict'`, `path: '/'`, and `secure` in production, and expire sessions after 12 hours. Login errors must always return `401 { code: 'INVALID_CREDENTIALS', message: '邮箱或密码错误' }` without revealing whether the email exists.

- [ ] **Step 5: Apply migration, seed the administrator, and run tests**

```powershell
docker compose up -d postgres minio minio-init
npm --workspace apps/api run prisma:migrate -- --name initial_workbench
npm --workspace apps/api run seed
npm --workspace apps/api test
```

Expected: migration succeeds; seed reports one administrator; authorization and health tests PASS.

- [ ] **Step 6: Commit**

```powershell
git add platform/packages platform/apps/api platform/docker-compose.yml
git commit -m "feat: add workbench identity and project data model"
```

---

### Task 3: 工厂项目列表、项目档案和受保护工作台布局

**Files:**
- Create: `platform/apps/api/src/routes/projects.ts`
- Create: `platform/apps/api/src/routes/projects.test.ts`
- Modify: `platform/apps/api/src/app.ts`
- Create: `platform/apps/workbench/src/api/client.ts`
- Create: `platform/apps/workbench/src/app/queryClient.ts`
- Create: `platform/apps/workbench/src/layout/WorkbenchLayout.tsx`
- Create: `platform/apps/workbench/src/pages/LoginPage.tsx`
- Create: `platform/apps/workbench/src/pages/ProjectListPage.tsx`
- Create: `platform/apps/workbench/src/pages/ProjectOverviewPage.tsx`
- Modify: `platform/apps/workbench/src/app/router.tsx`
- Create: `platform/apps/workbench/src/pages/ProjectListPage.test.tsx`

**Interfaces:**
- Produces: `FactoryProjectSummary { id, name, stage, completeness, nextAction, updatedAt }`.
- Produces: `GET /projects`, `POST /projects`, `GET /projects/:projectId`, `PATCH /projects/:projectId`.
- Consumes: authenticated user and project roles from Task 2.

- [ ] **Step 1: Write API authorization and project list tests**

```ts
it('returns only projects assigned to a member', async () => {
  const response = await memberApp.inject({ method: 'GET', url: '/projects' })
  expect(response.statusCode).toBe(200)
  expect(response.json().items.map((item: { name: string }) => item.name)).toEqual(['SINOFORM 齿轮工厂'])
})

it('rejects unauthenticated project access', async () => {
  const response = await app.inject({ method: 'GET', url: '/projects' })
  expect(response.statusCode).toBe(401)
})
```

- [ ] **Step 2: Run focused tests to verify failure**

```powershell
npm --workspace apps/api test -- src/routes/projects.test.ts
```

Expected: FAIL with route not found.

- [ ] **Step 3: Implement the project API and completeness calculation**

```ts
export function calculateProjectCompleteness(input: {
  hasProfile: boolean
  fileCount: number
  reviewedCapabilityCount: number
  primaryMarketCount: number
}) {
  const completed = [
    input.hasProfile,
    input.fileCount > 0,
    input.reviewedCapabilityCount > 0,
    input.primaryMarketCount === 1,
  ].filter(Boolean).length
  return completed * 25
}
```

Project creation requires `name`, `legalName`, `primaryContact`, `exportStage`, and `existingAcquisitionChannels`. Only administrators create projects. Members edit assigned projects; viewers read only. Every create/update writes an `AuditEvent` containing actor, project, action, entity type, entity id and changed field names.

- [ ] **Step 4: Write the UI list test**

```tsx
it('shows project progress and next action', async () => {
  server.use(http.get('/api/projects', () => HttpResponse.json({ items: [{
    id: 'project-1', name: 'SINOFORM 齿轮工厂', stage: '资料采集',
    completeness: 25, nextAction: '上传首份产品资料', updatedAt: '2026-07-21T00:00:00Z',
  }] })))
  render(<TestRouter initialEntries={['/projects']} />)
  expect(await screen.findByText('SINOFORM 齿轮工厂')).toBeInTheDocument()
  expect(screen.getByText('25%')).toBeInTheDocument()
  expect(screen.getByText('上传首份产品资料')).toBeInTheDocument()
})
```

- [ ] **Step 5: Implement login protection and project pages**

`api/client.ts` must always send `credentials: 'include'` and normalize errors to `{ code, message, fieldErrors? }`. `router.tsx` must redirect anonymous users to `/login` and return to the requested page after login. The layout must expose keyboard-accessible desktop navigation and a mobile drawer; viewer accounts must not see create/edit controls.

- [ ] **Step 6: Run API and UI tests**

```powershell
npm --workspace apps/api test -- src/routes/projects.test.ts
npm --workspace apps/workbench test -- src/pages/ProjectListPage.test.tsx
```

Expected: all focused tests PASS.

- [ ] **Step 7: Commit**

```powershell
git add platform/apps/api/src/routes platform/apps/workbench/src
git commit -m "feat: add factory project workspace"
```

---

### Task 4: 原始文件上传、对象存储和版本记录

**Files:**
- Create: `platform/apps/api/src/storage/objectStorage.ts`
- Create: `platform/apps/api/src/storage/s3Storage.ts`
- Create: `platform/apps/api/src/routes/files.ts`
- Create: `platform/apps/api/src/routes/files.test.ts`
- Modify: `platform/apps/api/src/app.ts`
- Create: `platform/apps/workbench/src/pages/ProjectFilesPage.tsx`
- Create: `platform/apps/workbench/src/pages/ProjectFilesPage.test.tsx`
- Modify: `platform/apps/workbench/src/app/router.tsx`

**Interfaces:**
- Produces: `ObjectStorage.put`, `ObjectStorage.get`, `ObjectStorage.createSignedDownloadUrl`.
- Produces: `POST /projects/:projectId/files`, `GET /projects/:projectId/files`, `GET /projects/:projectId/files/:fileId/download`.
- Produces: immutable `FileAsset` versions and SHA-256 checksum.

- [ ] **Step 1: Write upload validation tests**

```ts
it('rejects executable files', async () => {
  const response = await upload(memberApp, 'project-1', 'payload.exe', 'application/octet-stream', Buffer.from('MZ'))
  expect(response.statusCode).toBe(415)
  expect(response.json().code).toBe('UNSUPPORTED_FILE_TYPE')
})

it('stores an allowed PDF under the project prefix', async () => {
  const response = await upload(memberApp, 'project-1', 'catalog.pdf', 'application/pdf', pdfBytes)
  expect(response.statusCode).toBe(201)
  expect(fakeStorage.lastPut?.key).toMatch(/^projects\/project-1\/files\//)
  expect(response.json().version).toBe(1)
})
```

- [ ] **Step 2: Run tests to verify failure**

```powershell
npm --workspace apps/api test -- src/routes/files.test.ts
```

Expected: FAIL because upload routes and storage adapter are absent.

- [ ] **Step 3: Implement storage and strict upload rules**

```ts
// platform/apps/api/src/storage/objectStorage.ts
export interface StoredObject {
  key: string
  contentType: string
  size: number
  checksum: string
}

export interface ObjectStorage {
  put(input: { key: string; contentType: string; bytes: Buffer }): Promise<StoredObject>
  get(key: string): Promise<Buffer>
  createSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string>
}
```

The route must stream multipart data, stop at `50 * 1024 * 1024` bytes, validate extension and MIME together, calculate SHA-256, and write the object only after project edit authorization succeeds. Re-uploading the same logical filename creates version `n + 1`; it never overwrites an object key. Download URLs expire after 300 seconds.

- [ ] **Step 4: Implement the file page and failure states**

The page must show filename, version, size, upload time, uploader, extraction status and a download action. It must display distinct Chinese messages for unsupported type, oversize file, duplicate checksum and network failure; failed uploads remain retryable and never appear as successful rows.

- [ ] **Step 5: Run focused and integration tests**

```powershell
npm --workspace apps/api test -- src/routes/files.test.ts
npm --workspace apps/workbench test -- src/pages/ProjectFilesPage.test.tsx
```

Expected: allowed uploads PASS; invalid type and oversize cases return the documented codes; UI states PASS.

- [ ] **Step 6: Commit**

```powershell
git add platform/apps/api/src/storage platform/apps/api/src/routes/files* platform/apps/workbench/src/pages/ProjectFilesPage*
git commit -m "feat: add versioned factory file uploads"
```

---

### Task 5: AI 异步能力提取与安全重试

**Files:**
- Create: `platform/apps/api/src/ai/capabilityExtractor.ts`
- Create: `platform/apps/api/src/ai/openAiExtractor.ts`
- Create: `platform/apps/api/src/ai/openAiExtractor.test.ts`
- Create: `platform/apps/api/src/jobs/claimTask.ts`
- Create: `platform/apps/api/src/jobs/processTask.ts`
- Create: `platform/apps/api/src/jobs/processTask.test.ts`
- Create: `platform/apps/api/src/worker.ts`
- Modify: `platform/apps/api/src/routes/files.ts`
- Modify: `platform/apps/api/package.json`

**Interfaces:**
- Produces: `CapabilityExtractor.extract(input): Promise<CapabilityExtraction>`.
- Produces: `POST /projects/:projectId/files/:fileId/extractions -> { taskId, status: 'QUEUED' }`.
- Produces: `GET /projects/:projectId/tasks/:taskId` with `QUEUED | RUNNING | SUCCEEDED | FAILED`.
- Consumes: `capabilityExtractionSchema` from Task 2 and file bytes from Task 4.

- [ ] **Step 1: Write provider contract and task retry tests**

```ts
it('persists structured capability drafts with source evidence', async () => {
  fakeExtractor.result = {
    summary: '目录显示可按图加工斜齿轮',
    capabilities: [{
      category: 'PRODUCT', name: '斜齿轮', value: '支持按图加工',
      evidenceQuote: 'Custom helical gears according to drawing', sourceLocator: '第 4 页',
      confidence: 0.91, recommendedStatus: 'PENDING_REVIEW',
    }],
    interviewQuestions: ['该能力是否为长期稳定能力？'],
  }
  await processTask(task.id, dependencies)
  const saved = await prisma.capability.findMany({ where: { sourceFileId: file.id } })
  expect(saved).toHaveLength(1)
  expect(saved[0].reviewStatus).toBe('PENDING_REVIEW')
})

it('marks the third transient failure as failed', async () => {
  fakeExtractor.error = new RetryableAiError('RATE_LIMIT')
  await processTask(task.id, dependencies)
  await processTask(task.id, dependencies)
  await processTask(task.id, dependencies)
  expect((await prisma.aiTask.findUniqueOrThrow({ where: { id: task.id } })).status).toBe('FAILED')
})
```

- [ ] **Step 2: Run tests to verify failure**

```powershell
npm --workspace apps/api test -- src/jobs/processTask.test.ts
```

Expected: FAIL because extractor and task processor are missing.

- [ ] **Step 3: Implement the replaceable extractor contract**

```ts
// platform/apps/api/src/ai/capabilityExtractor.ts
import type { CapabilityExtraction } from '@workbench/contracts'

export interface CapabilityExtractorInput {
  filename: string
  contentType: string
  bytes: Buffer
  projectContext: string
}

export interface CapabilityExtractor {
  extract(input: CapabilityExtractorInput): Promise<CapabilityExtraction>
}
```

- [ ] **Step 4: Implement the OpenAI Responses adapter with structured output**

Use `openai.responses.parse`, `zodTextFormat(capabilityExtractionSchema, 'factory_capability_extraction')`, and model `config.OPENAI_MODEL`. Documents use an `input_file` item with Base64 data; images use an `input_image` data URL. The system instruction must state: extract only explicit evidence, quote the smallest supporting passage, use `PENDING_REVIEW` by default, use `NEEDS_EVIDENCE` for marketing claims without technical support, never infer certification/precision/capacity/delivery, and write uncertain points as interview questions.

```ts
const response = await client.responses.parse({
  model: config.OPENAI_MODEL,
  input: [{ role: 'system', content: EXTRACTION_POLICY }, { role: 'user', content }],
  text: { format: zodTextFormat(capabilityExtractionSchema, 'factory_capability_extraction') },
})
if (!response.output_parsed) throw new PermanentAiError('EMPTY_STRUCTURED_OUTPUT')
return capabilityExtractionSchema.parse(response.output_parsed)
```

- [ ] **Step 5: Implement idempotent task processing**

`claimTask` must atomically change one `QUEUED` task to `RUNNING`. A task identity is unique on `(type, sourceFileId, sourceFileVersion, promptVersion)`. Retrying a succeeded identity returns the existing result. Retryable failures use delays of 30, 120 and 600 seconds; schema/refusal/unsupported-file failures are permanent. Each attempt records model, prompt version, started time, finished time, error code and token usage when provided.

- [ ] **Step 6: Run provider, worker and API tests**

```powershell
npm --workspace apps/api test -- src/ai/openAiExtractor.test.ts src/jobs/processTask.test.ts src/routes/files.test.ts
```

Expected: fake provider tests PASS without network; retry stops after three failures; duplicate task request reuses the existing task.

- [ ] **Step 7: Commit**

```powershell
git add platform/apps/api/src/ai platform/apps/api/src/jobs platform/apps/api/src/worker.ts platform/apps/api/src/routes/files.ts
git commit -m "feat: extract factory capabilities with reviewable AI tasks"
```

---

### Task 6: 能力画像审核、证据追溯和访谈问题

**Files:**
- Create: `platform/apps/api/src/routes/capabilities.ts`
- Create: `platform/apps/api/src/routes/capabilities.test.ts`
- Modify: `platform/apps/api/src/app.ts`
- Create: `platform/apps/workbench/src/components/AsyncTaskStatus.tsx`
- Create: `platform/apps/workbench/src/components/EvidenceLink.tsx`
- Create: `platform/apps/workbench/src/pages/CapabilityReviewPage.tsx`
- Create: `platform/apps/workbench/src/pages/CapabilityReviewPage.test.tsx`
- Modify: `platform/apps/workbench/src/app/router.tsx`

**Interfaces:**
- Produces: `GET /projects/:projectId/capabilities` grouped by category.
- Produces: `PATCH /projects/:projectId/capabilities/:capabilityId/review`.
- Produces: `GET /projects/:projectId/interview-questions`.
- Consumes: capability drafts and evidence from Task 5.

- [ ] **Step 1: Write the publication-boundary API test**

```ts
it('requires a reason and records reviewer when confirming a capability', async () => {
  const response = await memberApp.inject({
    method: 'PATCH',
    url: `/projects/${project.id}/capabilities/${capability.id}/review`,
    payload: { status: 'CONFIRMED', reason: '工厂负责人在 2026-07-21 访谈中确认' },
  })
  expect(response.statusCode).toBe(200)
  expect(response.json()).toMatchObject({ reviewStatus: 'CONFIRMED', reviewedBy: member.id })
})

it('prevents viewers from reviewing', async () => {
  const response = await viewerApp.inject({
    method: 'PATCH', url: `/projects/${project.id}/capabilities/${capability.id}/review`,
    payload: { status: 'CONFIRMED', reason: '无权操作' },
  })
  expect(response.statusCode).toBe(403)
})
```

- [ ] **Step 2: Run the focused test to verify failure**

```powershell
npm --workspace apps/api test -- src/routes/capabilities.test.ts
```

Expected: FAIL because review routes are missing.

- [ ] **Step 3: Implement immutable review history**

Every review creates a `CapabilityReview` row; it never overwrites earlier review rows. The current `Capability.reviewStatus` is updated in the same transaction. `CONFIRMED`, `NEEDS_EVIDENCE`, `INTERNAL_ONLY` and `REJECTED` require a non-empty reason. Editing name/value creates a new capability revision linked by `supersedesCapabilityId`.

- [ ] **Step 4: Write and implement the review UI test**

```tsx
it('shows evidence before allowing confirmation', async () => {
  render(<CapabilityReviewPage />)
  expect(await screen.findByText('Custom helical gears according to drawing')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '确认能力' }))
  expect(screen.getByLabelText('确认依据')).toBeRequired()
})
```

The page must show category, extracted value, confidence, source filename, source locator, evidence quote, review history and interview questions. Bulk confirmation is forbidden. Keyboard focus moves to the next pending item after a successful review. AI/task failures are visible through `AsyncTaskStatus` with a retry action for members and administrators.

- [ ] **Step 5: Run API and UI tests**

```powershell
npm --workspace apps/api test -- src/routes/capabilities.test.ts
npm --workspace apps/workbench test -- src/pages/CapabilityReviewPage.test.tsx
```

Expected: review permissions, required reason, history and evidence display tests PASS.

- [ ] **Step 6: Commit**

```powershell
git add platform/apps/api/src/routes/capabilities* platform/apps/workbench/src/components platform/apps/workbench/src/pages/CapabilityReviewPage*
git commit -m "feat: review factory capabilities with evidence"
```

---

### Task 7: 产品—市场候选生成、外部证据补充和主备方向选择

**Files:**
- Create: `platform/apps/api/src/ai/marketGenerator.ts`
- Create: `platform/apps/api/src/ai/marketGenerator.test.ts`
- Create: `platform/apps/api/src/routes/markets.ts`
- Create: `platform/apps/api/src/routes/markets.test.ts`
- Modify: `platform/apps/api/src/jobs/processTask.ts`
- Modify: `platform/apps/api/src/app.ts`
- Create: `platform/apps/workbench/src/pages/MarketSelectionPage.tsx`
- Create: `platform/apps/workbench/src/pages/MarketSelectionPage.test.tsx`
- Modify: `platform/apps/workbench/src/app/router.tsx`

**Interfaces:**
- Produces: `POST /projects/:projectId/market-candidates/generate`.
- Produces: `POST /projects/:projectId/market-candidates/:candidateId/evidence`.
- Produces: `POST /projects/:projectId/market-decisions` with exactly one `PRIMARY` and at most one `BACKUP`.
- Consumes: only `Capability.reviewStatus === 'CONFIRMED'`.

- [ ] **Step 1: Write the confirmed-capability boundary test**

```ts
it('sends only confirmed capabilities to the generator', async () => {
  await generateMarkets(project.id, dependencies)
  expect(fakeMarketGenerator.lastInput?.capabilities.map((item) => item.id)).toEqual([confirmedCapability.id])
})

it('rejects a primary decision without evidence', async () => {
  const response = await memberApp.inject({
    method: 'POST', url: `/projects/${project.id}/market-decisions`,
    payload: { primaryCandidateId: candidate.id, backupCandidateId: null, reason: '优先测试' },
  })
  expect(response.statusCode).toBe(422)
  expect(response.json().code).toBe('MARKET_EVIDENCE_REQUIRED')
})
```

- [ ] **Step 2: Run tests to verify failure**

```powershell
npm --workspace apps/api test -- src/routes/markets.test.ts
```

Expected: FAIL because generation and decision routes are missing.

- [ ] **Step 3: Implement market generation without invented demand claims**

The generator uses `marketGenerationSchema` structured output. It may propose 3–5 hypotheses from confirmed factory capabilities, but all demand, competition and order-value statements are initially labeled `UNVERIFIED`. The prompt must instruct the model to produce research questions rather than claim unsupported market facts.

Each candidate score shows five named dimensions from `marketCandidateSchema`; technical risk is displayed as risk, so a lower number is better. The API calculates no hidden total score. Human users compare dimensions directly.

- [ ] **Step 4: Implement external evidence and decision invariants**

Evidence entry requires `title`, absolute `https` URL, `sourceType`, `publishedAt` when known, `summary`, `supportsOrChallenges`, and reviewer. A candidate needs at least one capability source and one human-reviewed external evidence item before it can be primary or backup. Saving a new primary decision supersedes the earlier decision in one transaction and records an audit event.

- [ ] **Step 5: Implement the comparison and selection UI**

```tsx
it('labels unsupported market claims and blocks premature selection', async () => {
  render(<MarketSelectionPage />)
  expect(await screen.findByText('市场需求：尚未验证')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '设为主验证方向' })).toBeDisabled()
})
```

The page displays 3–5 candidates side-by-side on desktop and as cards on mobile. It exposes supporting capabilities, uncertainties, research questions, evidence, five scores and selection reason. Users may select exactly one primary and zero or one backup. Rejected candidates require a reason and remain in history.

- [ ] **Step 6: Run focused tests**

```powershell
npm --workspace apps/api test -- src/ai/marketGenerator.test.ts src/routes/markets.test.ts
npm --workspace apps/workbench test -- src/pages/MarketSelectionPage.test.tsx
```

Expected: only confirmed capabilities reach AI; unsupported market claims remain unverified; evidence and selection invariants PASS.

- [ ] **Step 7: Commit**

```powershell
git add platform/apps/api/src/ai/marketGenerator* platform/apps/api/src/routes/markets* platform/apps/workbench/src/pages/MarketSelectionPage*
git commit -m "feat: select evidence-backed market directions"
```

---

### Task 8: 项目总览、审计记录、端到端验收和运行文档

**Files:**
- Create: `platform/apps/api/src/routes/audit.ts`
- Create: `platform/apps/api/src/routes/audit.test.ts`
- Modify: `platform/apps/api/src/routes/projects.ts`
- Modify: `platform/apps/workbench/src/pages/DashboardPage.tsx`
- Modify: `platform/apps/workbench/src/pages/ProjectOverviewPage.tsx`
- Create: `platform/apps/workbench/e2e/phase-one.spec.ts`
- Create: `platform/apps/workbench/playwright.config.ts`
- Create: `platform/README.md`

**Interfaces:**
- Produces: `GET /projects/:projectId/audit` for administrators and project members.
- Produces: project overview with completeness, pending reviews, failed tasks, selected direction and next action.
- Produces: one Playwright scenario that proves the complete phase-one vertical slice.

- [ ] **Step 1: Write project overview and audit tests**

```ts
it('reports the next blocked action in priority order', () => {
  expect(getNextAction({ fileCount: 1, pendingCapabilities: 3, primaryMarketCount: 0 })).toBe('审核 3 条待确认能力')
  expect(getNextAction({ fileCount: 1, pendingCapabilities: 0, primaryMarketCount: 0 })).toBe('选择主验证市场方向')
})

it('prevents viewers from reading internal audit history', async () => {
  const response = await viewerApp.inject({ method: 'GET', url: `/projects/${project.id}/audit` })
  expect(response.statusCode).toBe(403)
})
```

- [ ] **Step 2: Run tests to verify failure**

```powershell
npm --workspace apps/api test -- src/routes/audit.test.ts src/routes/projects.test.ts
```

Expected: FAIL because audit route and next-action rules are absent.

- [ ] **Step 3: Implement deterministic dashboard rules**

Next action priority is: failed AI task → no files → extraction pending → capability review pending → insufficient market evidence → no primary direction → phase one complete. The dashboard displays counts and links directly to the blocking page. AI does not decide the next action.

- [ ] **Step 4: Add the end-to-end phase-one scenario**

```ts
test('team turns a factory catalog into a selected market direction', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('邮箱').fill('admin@example.com')
  await page.getByLabel('密码').fill('ChangeMe-Local-Only-123!')
  await page.getByRole('button', { name: '登录' }).click()
  await page.getByRole('link', { name: 'SINOFORM 齿轮工厂' }).click()
  await page.getByRole('link', { name: '资料与能力画像' }).click()
  await page.setInputFiles('input[type=file]', 'e2e/fixtures/gear-catalog.pdf')
  await page.getByRole('button', { name: '开始 AI 提取' }).click()
  await expect(page.getByText('待审核')).toBeVisible()
  await page.getByRole('button', { name: '确认能力' }).first().click()
  await page.getByLabel('确认依据').fill('工厂负责人访谈确认')
  await page.getByRole('button', { name: '保存审核' }).click()
  await page.getByRole('link', { name: '选品与市场' }).click()
  await page.getByRole('button', { name: '生成候选方向' }).click()
  await page.getByRole('button', { name: '添加市场证据' }).first().click()
  await page.getByLabel('证据标题').fill('包装设备齿轮采购需求记录')
  await page.getByLabel('来源网址').fill('https://example.com/verified-market-note')
  await page.getByLabel('证据摘要').fill('团队人工审核的市场访谈记录公开摘要')
  await page.getByRole('button', { name: '保存证据' }).click()
  await page.getByRole('button', { name: '设为主验证方向' }).first().click()
  await expect(page.getByText('主验证方向')).toBeVisible()
})
```

The E2E test uses a deterministic fake AI provider selected by `AI_PROVIDER=fake`; it must not call the network. A separate opt-in smoke command `npm run test:openai-smoke` runs one small real extraction only when `OPENAI_API_KEY` is present.

- [ ] **Step 5: Document exact local operation**

`platform/README.md` must include: copy `.env.example` to `.env`; start PostgreSQL/MinIO; install dependencies; migrate and seed; run API, worker and workbench; configure `OPENAI_API_KEY`; run unit, integration, E2E and optional real-provider smoke tests; stop services without deleting named volumes. It must state that the local seeded password is for development only and must be replaced outside local development.

- [ ] **Step 6: Run the complete verification suite**

```powershell
npm test
npm run lint
npm run build
npm run test:e2e
```

Expected: all unit/integration tests PASS; lint exits 0; API, contracts and workbench builds succeed; the phase-one Playwright scenario PASSes.

- [ ] **Step 7: Manual acceptance with the real齿轮工厂资料**

Use a copy of the real factory files with personal and commercial-sensitive fields removed. Verify upload, evidence traceability, one-by-one capability review, 3–5 candidate directions, manual market evidence, one primary/optional backup decision, permission boundaries, failed-task retry and audit history. Record acceptance results in `platform/docs/phase-one-acceptance.md` without including confidential source content.

- [ ] **Step 8: Commit**

```powershell
git add platform
git commit -m "test: verify phase one acquisition workbench"
```

---

## Plan Self-Review

- **Spec coverage:** 第一阶段覆盖登录与权限、项目隔离、工厂档案、文件版本、AI提取、证据追溯、人工审核、候选市场、外部证据、主备方向、任务重试、审计和移动端只读核心体验。目标企业、触达、官网/客服和报告明确留给后续独立计划。
- **完整性检查:** 计划不包含未定义任务；环境变量、状态、接口、角色、文件上限、重试次数和验收命令均已明确。
- **Type consistency:** `CapabilityExtraction`、`CapabilityReviewStatus`、`MarketCandidate`、项目角色和任务状态由共享契约统一提供，API与工作台不重复定义。
- **Safety boundary:** 未确认能力不进入市场生成；AI不对外发送、不自动选择方向；原文件不可覆盖；人工审核与审计记录贯穿关键决策。
