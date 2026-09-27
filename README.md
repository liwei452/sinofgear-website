# SINOF B2B 齿轮网站

第一阶段 B2B 外贸独立站，基于 React、TypeScript、Vite、Tailwind CSS 和 React Router。

## 本地运行

```bash
npm install
npm run dev
```

生产验证：

```bash
npm test
npm run lint
npm run build
```

## 环境变量

复制 `.env.example` 为 `.env`：

```env
VITE_SITE_URL=https://sinofgears.com
VITE_VISITOR_COUNTRY_CODE=
VITE_GEO_API_URL=
VITE_CUSTOMER_SERVICE_ENABLED=false
VITE_CUSTOMER_SERVICE_SDK_URL=https://static.t.venorzom.com/loader.js
VITE_CUSTOMER_SERVICE_SITE_KEY=
VITE_CUSTOMER_SERVICE_ENDPOINT=https://apigw.t.venorzom.com/
VITE_CUSTOMER_SERVICE_LOCALE=en
INQUIRY_TO_EMAIL=admin@sinofgears.onmicrosoft.com
INQUIRY_FROM_EMAIL=Sinoform RFQ <inquiries@sinofgears.com>
```

- `VITE_SITE_URL`：Canonical、Open Graph 和结构化数据使用的正式域名。
- `VITE_VISITOR_COUNTRY_CODE`：可选，用于测试或由托管平台注入两位国家代码。
- `VITE_GEO_API_URL`：可选的同源 JSON 国家识别接口；未设置时默认读取 Cloudflare `/cdn-cgi/trace`。
- `VITE_CUSTOMER_SERVICE_ENABLED`：自研客服 SDK 总开关。
- `VITE_CUSTOMER_SERVICE_SDK_URL`：客服 SDK 的 HTTPS ESM loader 地址。
- `VITE_CUSTOMER_SERVICE_SITE_KEY`：可公开的站点公钥，不能填写服务端密钥。
- `VITE_CUSTOMER_SERVICE_ENDPOINT`：自研客服 API Gateway 的 HTTPS 地址。
- `VITE_CUSTOMER_SERVICE_LOCALE`：客服与 Contact Us 表单语言，当前生产环境使用 `en`。
- `INQUIRY_TO_EMAIL`：服务端询盘通知收件邮箱，生产值为 `admin@sinofgears.onmicrosoft.com`。
- `INQUIRY_FROM_EMAIL`：Resend 域名验证通过后的发件身份，默认 `Sinoform RFQ <inquiries@sinofgears.com>`。
- `RESEND_API_KEY`：只在 Cloudflare 中保存为加密 Secret，不写入 `.env`、源码或仓库。

### CRM 与询盘链路

- 生产站只在访客点击询盘助手或提交询盘后加载 Venorzom Web Embed；`agent_chat` 与无头 Contact Us 共用同一实例，普通浏览不会提前创建 CRM 会话。
- `/api/inquiries` 仍是询盘、图纸和邮件通知的主链路；CRM 暂作为邮件成功后的 best-effort 镜像，不会因 CRM 故障让客户重复提交。
- 当前线上 Contact Us schema 仅发布了 `business_email`，因此网站只同步邮箱。姓名、公司、产品、留言和图纸须在 CRM 后台发布对应字段与附件规则后再接入，禁止猜测字段 key 或把文件写入文本字段。
- 远程 ESM loader 目前限制为已审核的 Venorzom 域名；在供应商提供版本化资源前，后续仍应升级为固定版本或自托管并校验文件哈希。

自定义 IP 接口可以返回 `{ "countryCode": "DE" }`、`{ "country": "DE" }` 或 `{ "country_code": "DE" }`。默认 Cloudflare 接口读取 `loc=DE`。网络错误、超时、无效或未映射国家均不会阻塞页面。

## Google Analytics 4

生产构建通过 `.env.production` 使用公开测量 ID `G-LR5GZ47F66`。`src/main.tsx` 的既有公共入口调用 `initializeAnalytics`，只在 `sinofgears.com` / `www.sinofgears.com` 加载一次异步 Google tag。localhost、Pages 预览域名、CRM 子域名以及 `/growth-preview`、`/growth`、`/crm`、`/admin` 入口不加载统计。

GA4 的初始页面和 React Router 历史路由页面由 **Enhanced measurement → Page views → Page changes based on browser history events** 自动计数；必须保持该设置开启。GA 分支不手动发送 `page_view`。2026-09-28 读取该 ID 的 Google 标签脚本时，历史事件已开启。若以后改用手动页面事件，必须先关闭 GA4 的自动历史计数，不能只设置 `send_page_view: false`。GTM 分支保留优先级；生产环境不要同时配置 `VITE_GTM_CONTAINER_ID`，否则须在该 GTM 容器内另行配置 GA4。

CRM/网站验收应先在新标签页打开 `https://sinofgears.com/?analytics=off`，再开始操作；本标签页后续导航和刷新继续禁用统计。也可在访问前由自动化设置 `sessionStorage['sinof-analytics-disabled']='true'`。这不影响真实网站访客。若浏览器禁止 sessionStorage，应在每次文档导航保留 `analytics=off`。此开关不是 GA4 后台内部流量过滤器，不能自动识别所有员工访问。

本接入保留既有 `dataLayer` / `gtag` 和已排队的 analytics consent；不设置 `analytics_storage: granted`，也没有新增 Cookie 弹窗。广告存储、广告用户数据和个性化默认为 denied，Google Signals 和广告个性化关闭。不新增姓名、邮箱、公司、留言、附件或用户标识事件，既有询盘成功事件仅包含产品类别和是否有图纸。网站源码目前未包含 CMP；发布前应由网站负责人确认当前同意策略。不要在公开链接的 URL 中放入个人信息。

Cloudflare Pages 项目为 `sinoform`，源码分支 `master`，构建命令 `npm run build`、输出 `dist`。检查 Pages 中是否有覆盖 `VITE_GA_MEASUREMENT_ID` 或配置了 `VITE_GTM_CONTAINER_ID`。审核合并与生产发布是独立操作；代码测试通过不代表已经上线或 GA4 已收数。上线后再核对真实浏览器单次脚本加载、首页/产品/关于及前进后退请求，并在 GA4 Realtime/DebugView 确认。不要为测试提交真实询盘。

参考：[Google SPA 测量](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)、[避免重复 page_view](https://developers.google.com/analytics/devguides/collection/ga4/views)、[同意模式](https://developers.google.com/tag-platform/security/guides/consent)。

## 多语言规则

网站包含英语、简体中文、德语、日语和西班牙语内容。用户手动选择保存在 `sinoform-language`，优先级始终最高。

自动选择顺序：

1. 已保存的手动选择；
2. Cloudflare IP 国家代码（或配置的同源国家识别接口）；
3. 英语。

国家映射为：中国大陆、香港、澳门、台湾使用中文；德国、奥地利、瑞士、列支敦士登使用德语；日本使用日语；西班牙、墨西哥、阿根廷、智利、哥伦比亚、秘鲁使用西班牙语；其他地区使用英语。客户手动切换后始终优先。

## 公司资料与联系邮箱

公司介绍与已确认的厂房、设备、实验室、精度、认证和荣誉资料集中维护在 `src/data/company.ts`。`admin@sinofgears.onmicrosoft.com` 作为公开联系邮箱显示；网站询盘通过同源 `/api/inquiries` 安全接口发送到 `admin@sinofgears.onmicrosoft.com`。

新增公开产品包括橡胶同步带、聚氨酯同步带、输送带、平面传动带和圆带。公开素材不包含 NITTA 名称、标识、规格或文件；原始资料图片保留在项目外部资料包中。

## 部署要求

网站使用浏览器历史路由。正式服务器必须把静态资源以外的未知请求回退到 `/index.html`，否则直接访问产品详情页会返回服务器 404。

完整项目结构、API 接入说明和待确认资料见 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)。

## Cloudflare Pages 部署

在 Cloudflare Pages 创建项目时使用：

- 构建命令：`npm run build`
- 输出目录：`dist`
- Node.js：使用当前受支持的 LTS 版本
- 首次部署：先使用 Cloudflare 提供的 `*.pages.dev` 临时网址验收

`public/_redirects` 会进入生产构建，保证 `/products/spur-gears` 等 React Router 地址直接打开时仍返回网站页面。

在 Pages 项目的环境变量中填写正式域名、Geo API 和客服 SDK 配置，不要把密钥提交到仓库。自研客服 SDK 默认关闭；只有完整配置 HTTPS 地址、公共 App ID 和全局对象名称后才会加载。

### 配置真实询盘邮件

1. 在 Resend 添加并验证 `sinfogear.com` 发信域名，按其控制台给出的值添加 SPF 与 DKIM DNS 记录。
2. 创建仅用于发信的 Resend API Key。
3. 把以下三项保存到 Cloudflare Pages 项目 `sinoform` 的 Variables and Secrets；API Key 必须选择加密保存。

```powershell
npx wrangler pages secret put RESEND_API_KEY --project-name sinoform
npx wrangler pages secret put INQUIRY_TO_EMAIL --project-name sinoform
npx wrangler pages secret put INQUIRY_FROM_EMAIL --project-name sinoform
```

询盘使用 `multipart/form-data` 提交，支持一个 PDF、STEP/STP、IGES/IGS、DXF 或 DWG 附件，最大 15 MB。服务器会再次检查必填字段、邮箱、字段长度、文件格式和大小；客户数据不写入 localStorage 或本项目数据库。

### 绑定 sinofgears.com

域名在腾讯云注册，网站部署到 Cloudflare Pages。调整 DNS 时：

1. 截图或导出全部 DNS 记录；
2. 保留 MX、SPF、DKIM、DMARC 和其他邮件、验证记录；
3. 在 Cloudflare Pages 添加 `sinofgears.com` 和 `www.sinofgears.com` 自定义域名；
4. 严格使用 Cloudflare 控制台为该项目生成的 DNS 目标值；
5. 等 HTTPS 生效后验证首页、所有产品路由、语言、SEO 和询盘表单；
6. 将 `www.sinofgears.com`、`sinfogear.com` 和 `www.sinfogear.com` 跳转到规范地址 `https://sinofgears.com`；
7. 验收成功后再删除不再使用的旧网站记录。

Cloudflare 的 DNS 目标与项目有关，因此不要提前猜测或填写 CNAME 值。切换前保留旧记录截图，以便异常时快速回滚。

## Growth Engine 博客发布桥

网站保持静态预渲染。Growth Engine 只把人工批准的英文文章写入 `content/blog/{article_key}.json`；Cloudflare Pages 随后执行既有构建，生成博客页面、站点地图、结构化数据和公开内容索引。

Cloudflare Pages 需要配置：

- KV 绑定：`BLOG_PREVIEWS`
- 加密 Secret：`GROWTH_PUBLISH_TOKEN`
- 加密 Secret：`GITHUB_CONTENT_TOKEN`
- 变量：`GROWTH_ORGANIZATION_ID`
- 变量：`GITHUB_REPOSITORY=liwei452/sinofgear-website`
- 变量：`GITHUB_BRANCH=master`

`GITHUB_CONTENT_TOKEN` 只授予本仓库 Contents 写权限。预览地址位于 `/growth-preview/{article_key}?version={version}`，同时返回 `noindex` 响应头和页面标记。正式发布接口先返回 `PUBLISHING`；只有线上静态文章带有匹配的 `data-article-key` 与 `data-article-version` 时才返回 `PUBLISHED`。

不要把生产 Token 写入 `.env`、仓库或前端变量。首次生产接入、验收和回退步骤见 Growth Engine 仓库的 `docs/sinof-site-publishing-operations.md`。
