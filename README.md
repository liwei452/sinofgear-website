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
VITE_SITE_URL=https://sinfogear.com
VITE_INQUIRY_API_URL=
VITE_VISITOR_COUNTRY_CODE=
VITE_GEO_API_URL=
VITE_CUSTOMER_SERVICE_ENABLED=false
VITE_CUSTOMER_SERVICE_SDK_URL=
VITE_CUSTOMER_SERVICE_APP_ID=
VITE_CUSTOMER_SERVICE_GLOBAL=
```

- `VITE_SITE_URL`：Canonical、Open Graph 和结构化数据使用的正式域名。
- `VITE_INQUIRY_API_URL`：后续真实询盘接口地址。
- `VITE_VISITOR_COUNTRY_CODE`：可选，用于测试或由托管平台注入两位国家代码。
- `VITE_GEO_API_URL`：可选的同源 JSON 国家识别接口；未设置时默认读取 Cloudflare `/cdn-cgi/trace`。
- `VITE_CUSTOMER_SERVICE_ENABLED`：自研客服 SDK 总开关，默认 `false`。
- `VITE_CUSTOMER_SERVICE_SDK_URL`：客服 SDK 的 HTTPS 脚本地址。
- `VITE_CUSTOMER_SERVICE_APP_ID`：可公开的应用 ID，不能填写服务端密钥。
- `VITE_CUSTOMER_SERVICE_GLOBAL`：SDK 在 `window` 上暴露的全局对象名称。

自定义 IP 接口可以返回 `{ "countryCode": "DE" }`、`{ "country": "DE" }` 或 `{ "country_code": "DE" }`。默认 Cloudflare 接口读取 `loc=DE`。网络错误、超时、无效或未映射国家均不会阻塞页面。

## 多语言规则

网站包含英语、简体中文、德语、日语和西班牙语内容。用户手动选择保存在 `sinoform-language`，优先级始终最高。

自动选择顺序：

1. 已保存的手动选择；
2. Cloudflare IP 国家代码（或配置的同源国家识别接口）；
3. 英语。

国家映射为：中国大陆、香港、澳门、台湾使用中文；德国、奥地利、瑞士、列支敦士登使用德语；日本使用日语；西班牙、墨西哥、阿根廷、智利、哥伦比亚、秘鲁使用西班牙语；其他地区使用英语。客户手动切换后始终优先。

## 公司资料与联系邮箱

公司介绍与已确认的厂房、设备、实验室、精度、认证和荣誉资料集中维护在 `src/data/company.ts`。`info@sinof.net` 仅作为展示邮箱出现在公司介绍、联系页和页脚；当前询盘仍提交到本地 mock，不会自动发送邮件。

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

### 绑定 sinfogear.com

域名在腾讯云注册，网站部署到 Cloudflare Pages。调整 DNS 时：

1. 截图或导出全部 DNS 记录；
2. 保留 MX、SPF、DKIM、DMARC 和其他邮件、验证记录；
3. 在 Cloudflare Pages 添加 `sinfogear.com` 和 `www.sinfogear.com` 自定义域名；
4. 严格使用 Cloudflare 控制台为该项目生成的 DNS 目标值；
5. 等 HTTPS 生效后验证首页、所有产品路由、语言、SEO 和询盘表单；
6. 将根域名跳转到规范地址 `https://sinfogear.com`；
7. 验收成功后再删除不再使用的旧网站记录。

Cloudflare 的 DNS 目标与项目有关，因此不要提前猜测或填写 CNAME 值。切换前保留旧记录截图，以便异常时快速回滚。
