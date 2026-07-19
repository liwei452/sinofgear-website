# SINOFORM 项目结构与上线交接

## 一、技术结构

```text
src/
├─ components/
│  ├─ InquiryForm.tsx       # 询盘表单、校验及提交状态
│  ├─ PageHero.tsx          # 内页统一首屏
│  ├─ ProductCard.tsx       # 产品列表卡片
│  ├─ Seo.tsx               # title、meta、canonical、OG、JSON-LD
│  ├─ SiteLayout.tsx        # Header、Footer、页面出口、滚动复位
│  └─ ui/                   # 现有 UI 基础组件
├─ data/
│  ├─ pages.ts              # 页面核心文案、表单文案与选项
│  ├─ products.ts           # 六类产品的独立配置
│  └─ site.ts               # 品牌、域名、路由和导航配置
├─ i18n/
│  ├─ language.ts           # 浏览器语言识别、手动选择、英文回退
│  └─ LanguageContext.tsx   # 多语言状态与本地持久化
├─ lib/
│  ├─ inquiry.ts            # 询盘类型、校验、产品预填解析
│  └─ seo.ts                # canonical 和结构化数据生成
├─ pages/
│  ├─ HomePage.tsx
│  ├─ ProductsPage.tsx
│  ├─ ProductDetailPage.tsx # 所有产品共用同一个模板
│  ├─ CapabilitiesPage.tsx
│  ├─ QualityPage.tsx
│  ├─ ContactPage.tsx
│  └─ NotFoundPage.tsx
├─ services/
│  └─ inquiryApi.ts         # 本地 mock 提交及真实 API 替换边界
└─ sections/
   ├─ Header.tsx
   ├─ Footer.tsx
   └─ FloatingCta.tsx
```

测试文件与被测试模块放在同一目录，覆盖产品数据、语言逻辑、SEO、路由、内容安全、产品模板、询盘校验和 mock API。

## 二、正式路由

- `/`
- `/products`
- `/products/spur-gears`
- `/products/helical-gears`
- `/products/bevel-gears`
- `/products/timing-pulleys`
- `/products/gear-racks`
- `/products/custom-gears`
- `/capabilities`
- `/quality`
- `/contact`

未知地址进入自定义 404 页面，并设置 `noindex, nofollow`。

## 三、产品配置扩展方式

产品页不复制 JSX。新增或修改产品时，在 `src/data/products.ts` 中维护产品记录：

- `slug`
- 产品名称和价值主张
- 图片及替代文本
- 主要特点
- 材料
- 精度说明
- 定制能力
- 应用行业
- 检测说明
- FAQ
- SEO title 和 description

`ProductDetailPage.tsx` 自动读取对应 slug 的配置并生成页面、RFQ 参数和 Product、BreadcrumbList、FAQPage 结构化数据。

## 四、多语言策略

- 支持语言结构：英语、德语、日语、西班牙语、中文。
- 首次访问按浏览器语言自动匹配。
- 客户手动切换后，选择保存在 `sinoform-language`。
- 第一阶段只有英文文案经过确认，其他语言显示英文回退内容。
- `languageFromCountryCode()` 是部署平台 IP 国家代码的预留接入口；当前版本不调用第三方 IP 查询服务。
- 搜索引擎不进行强制语言跳转。

## 五、SEO

每个路由由 `Seo.tsx` 独立写入 title、meta description、canonical、Open Graph、robots 和 JSON-LD。

canonical 默认基于 `https://www.sinoforce.net`，可用 `VITE_SITE_URL` 覆盖。

结构化数据只使用已确认内容：

- Organization：仅品牌与网址
- Product：无价格、库存、评分、SKU 或认证
- BreadcrumbList
- FAQPage

## 六、询盘 API 接入位置

当前表单调用 `src/services/inquiryApi.ts` 中的 `submitInquiry()`。该函数目前返回本地 mock 编号，不上传数据，也不把个人信息写入 localStorage。

接入真实 API 时：

1. 设置 `VITE_INQUIRY_API_URL`。
2. 将 `submitInquiry()` 的 mock 结果替换为 `POST {VITE_INQUIRY_API_URL}/inquiries`。
3. JSON 请求发送 Name、Company、Email、Country、Product、Quantity、Material 和 Message。
4. 图纸文件使用经过批准的 multipart 或对象存储直传流程，不要放入普通 JSON。
5. 服务端必须完成文件类型、大小、病毒扫描、访问权限、保留期限和删除策略。
6. 前端继续沿用现有成功、失败和重试状态。

第一阶段的文件控件只显示本地文件名，不传输文件内容。

## 七、上线服务器要求

- 启用 HTTPS。
- 所有非静态文件请求回退到 `/index.html`，支持 React Router 深层 URL。
- 将 `VITE_SITE_URL` 设置为最终 HTTPS 域名。
- 配置缓存策略，但不要长期缓存 `index.html`。
- 在接入真实表单前添加隐私政策、同意机制、防垃圾提交和服务端校验。

## 八、待确认资料清单

正式上线前仍需业务方确认：

1. 销售邮箱。
2. 电话或 WhatsApp（如需展示）。
3. 公司法定名称。
4. 公司或工厂地址（如需展示）。
5. 已获得的认证及证书编号、范围、有效期。
6. 各制造工序是否自有或外协。
7. 各产品可加工材料、热处理和表面处理。
8. 各产品尺寸范围、模数范围和可承诺精度等级。
9. 检测设备、检测方法、抽样方案和可提供报告类型。
10. 可承诺的报价时效、打样周期和量产周期。
11. 最小起订量和订单数量政策。
12. 知识产权、保密协议和图纸保留规则。
13. 隐私政策、Cookie 政策和数据处理说明。
14. 真实询盘 API、CRM 或邮件接收目标。
15. 图纸上传的存储、访问、保留和删除政策。
16. 德语、日语、西班牙语和中文的人工审核译文。
17. Timing Pulley 与 Custom Gear 的正式产品图片。

未确认资料在当前页面中均未作为事实发布。
