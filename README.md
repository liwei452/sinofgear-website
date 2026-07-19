# SINOFORM B2B Gear Website

SINOFORM 第一阶段 B2B 外贸独立站，基于 React、TypeScript、Vite、Tailwind CSS 和 React Router。

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
```

`VITE_SITE_URL` 用于 canonical、Open Graph URL 和结构化数据。`VITE_INQUIRY_API_URL` 是后续真实询盘接口的预留地址。

## 部署要求

站点使用 React Router 的浏览器历史路由。部署到正式服务器时，除静态资源外的未知请求必须回退到 `/index.html`，否则直接打开产品详情 URL 会返回服务器 404。

完整结构和上线资料清单见 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)。
