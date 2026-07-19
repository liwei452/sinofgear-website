# SINOFORM B2B 齿轮网站

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
VITE_SITE_URL=https://www.sinoforce.net
VITE_INQUIRY_API_URL=
VITE_VISITOR_COUNTRY_CODE=
VITE_GEO_API_URL=
```

- `VITE_SITE_URL`：Canonical、Open Graph 和结构化数据使用的正式域名。
- `VITE_INQUIRY_API_URL`：后续真实询盘接口地址。
- `VITE_VISITOR_COUNTRY_CODE`：可选，由托管平台注入的两位国家代码。
- `VITE_GEO_API_URL`：可选，同源 IP 国家识别 JSON 接口。

IP 接口可以返回 `{ "countryCode": "DE" }`、`{ "country": "DE" }` 或 `{ "country_code": "DE" }`。网络错误、超时和无效响应不会阻塞页面。

## 多语言规则

网站包含英语、简体中文、德语、日语和西班牙语内容。用户手动选择保存在 `sinoform-language`，优先级始终最高。

自动选择顺序：

1. 已保存的手动选择；
2. 托管平台国家代码或 IP 国家识别接口；
3. 浏览器语言；
4. 英语。

## 部署要求

网站使用浏览器历史路由。正式服务器必须把静态资源以外的未知请求回退到 `/index.html`，否则直接访问产品详情页会返回服务器 404。

完整项目结构、API 接入说明和待确认资料见 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)。
