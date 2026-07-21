# AI 外贸精准获客工作台（第一阶段）

这是团队内部使用的工厂诊断与市场方向工作台。第一阶段覆盖：登录与项目权限、工厂资料版本库、AI 能力提取、逐条人工审核、产品—市场候选、人工市场证据、主备方向选择和审计记录。

## 本地启动

要求 Node.js 24 和 pnpm 11。首次运行：

```powershell
Copy-Item .env.example .env
pnpm install
pnpm --filter @workbench/api db:migrate
pnpm --filter @workbench/api seed
pnpm dev
```

打开 `http://localhost:4173`。本地初始账号为 `admin@example.com`，初始密码来自 `.env` 的 `SEED_ADMIN_PASSWORD`。

> `ChangeMe-Local-Only-123!` 只允许用于本机开发。任何共享、演示或正式环境都必须改为独立强密码，并更换 `DOWNLOAD_TOKEN_SECRET`。

`pnpm dev` 同时运行 API、AI 后台任务和网页工作台。结构化数据保存在 `var/workbench.db`，原始文件保存在 `var/files/`；二者均不会提交到 Git。

## AI 模式

默认 `.env.example` 使用 `AI_PROVIDER=fake`，可完整演示工作流且不会调用外部网络。模拟结果必须像真实 AI 结果一样逐条人工审核。

使用真实 OpenAI 时：

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=你的密钥
OPENAI_MODEL=gpt-5.6-terra
```

模型名可通过 `OPENAI_MODEL` 更换，业务数据与审核流程不依赖具体模型。最小真实连通性检查：

```powershell
pnpm test:openai-smoke
```

未设置 `OPENAI_API_KEY` 时，该命令会明确跳过且不会发送请求。

## 验证

```powershell
pnpm test
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`test:e2e` 会先清理并重建专用的 `var/e2e.db` 与 `var/e2e-files/`，不会删除日常开发数据库或资料。浏览器场景使用合成齿轮目录和模拟 AI，不访问外部服务。

## 数据备份与清理

停止 `pnpm dev` 后，备份 `var/workbench.db` 和整个 `var/files/`，两者必须保持同一时间点。建议复制到加密、受访问控制的位置。

只清理本地开发数据时，请先确认目标精确位于本项目 `platform/var/` 下，再移走 `workbench.db`、`workbench.db-wal`、`workbench.db-shm` 和 `files/`。下次运行迁移与 seed 会创建空环境，但已删除的原始资料不可由数据库恢复。

## 第一阶段安全边界

- AI 只能生成待审核草稿，不能自动对外发布、报价或联系客户。
- 只有 `CONFIRMED` 能力可进入市场候选生成。
- 市场需求、竞争和订单价值默认“尚未验证”。候选至少有一条人工 HTTPS 证据后才能成为主或备方向。
- 原始文件不可覆盖；重复内容、危险格式和超过 50 MB 的文件会被拒绝。
- 下载链接签名且 5 分钟过期；项目权限在服务端再次校验。
- 工厂敏感资料进入真实 AI 前，应确认团队与工厂的数据处理约定，并优先使用脱敏副本。
