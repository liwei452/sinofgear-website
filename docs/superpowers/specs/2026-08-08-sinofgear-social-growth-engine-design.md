# SinofGear AI Social Growth Engine

## Technical Design Document V1.0

**文档状态：** 已完成产品、架构、页面方向、ER、API、状态机与验收评审，等待最终书面确认

**目标项目：** 全新独立项目 `sinofgear-growth-engine`，不复用现有 `app/platform` 代码

**目标用户：** 机械制造、齿轮及工业零部件外贸企业的内部运营团队

**首期组织模式：** 单企业内部使用，所有业务数据预留多企业隔离边界

---

## 1. 产品定位

SinofGear AI Social Growth Engine 是面向机械制造和齿轮外贸企业的 AI 社媒增长中台。

它通过两条闭环创造价值：

1. 主动增长：产品与素材 → AI 内容 → 多平台发布 → 独立站访问 → 渠道归因。
2. 被动增长：行业公开内容 → 公开信号 → 潜客候选 → AI 洞察 → CRM 智能体交接。

本产品不是网易外贸通替代品，不是 CRM，也不是销售自动化系统。其最终输出是经过证据支撑、可供人工判断并可交给 CRM 智能体继续处理的候选线索。

### 1.1 核心价值

- 用一份结构化产品资料生成多个平台的内容。
- 统一管理原始素材、媒体适配版本和内容版本。
- 按平台能力选择自动发布、确认发布、导出发布包或人工发布。
- 使用 UTM、短链接和隐私安全的访问事件分析社媒流量。
- 从合规取得的公开内容中发现采购信号。
- 让 AI 的内容生成、潜客判断和运营建议均可追溯、可审核、可修正。

### 1.2 成功标准

系统必须跑通以下两个真实闭环：

```text
产品与素材
→ 五个平台内容
→ 人工审核与排期
→ 模拟或真实发布
→ 短链接访问
→ 渠道分析
```

```text
行业关键词
→ 合规公开来源
→ 来源信号
→ 潜客评分与 AI 洞察
→ 联系建议
→ CRM 智能体模拟或真实交接
```

---

## 2. 系统边界

### 2.1 系统负责

- 企业成员、角色和组织数据隔离。
- 产品知识库和结构化产品参数。
- 图片、视频、案例等素材及其平台适配版本。
- Campaign、ContentBrief、母内容和平台内容。
- AI 内容生成、翻译、视觉分析和运营建议草稿。
- 人工审核、发布排期、发布任务和发布结果。
- UTM、短链接、点击事件和匿名访问会话。
- 关键词、公开来源监测、来源账号、来源内容和来源信号。
- 潜客候选、评分、AI 洞察、联系建议和证据包。
- 向 CRM 智能体进行幂等交接。
- 异步任务、Webhook、通知和操作审计。

### 2.2 系统不负责

- CRM 客户生命周期管理。
- 报价、订单、合同、收款、销售跟进和成交管理。
- 无人工或规则批准的自动陌生私信和自动群发。
- 浏览器模拟登录、指纹浏览器、防封号系统。
- 抓取私密内容、非公开数据或平台禁止采集的数据。
- AI 自动报价、自动承诺交期或自动做出工程结论。
- 未经平台授权的发布、评论、消息或数据读取。

### 2.3 候选线索边界

`LeadCandidate` 不是 CRM 客户。它只表示系统基于公开证据识别出的潜在采购主体或联系人。

系统内部允许记录：

- 公开身份和主页。
- 来源内容、评论或其他公开信号。
- 产品需求、行业和国家判断。
- 评分、等级、置信度和人工修正。
- 推荐联系理由、渠道和话术草稿。
- CRM 交接请求和结果。

系统内部不记录销售阶段、报价、跟进计划或成交状态。

---

## 3. 总体架构

系统采用模块化单体和异步任务中心。各业务域共享一个 PostgreSQL 数据库，但只能通过明确的模块接口访问其他领域能力。

```text
Vue 3 管理后台
        ↓
Django REST API
        ↓
业务领域模块
├─ Identity       组织、成员、角色
├─ Catalog        产品知识库
├─ Assets         素材与媒体适配
├─ Campaigns      增长活动与内容策略
├─ Content        母内容与平台内容
├─ Publishing     账号、排期与发布
├─ Tracking       UTM、短链与访问分析
├─ Radar          公开来源、信号与潜客候选
├─ AI             AI Orchestrator 与可审计运行
├─ Jobs           统一异步任务
├─ Integrations   平台、CRM、AI 和媒体连接器
└─ Audit          审批、通知与操作日志
        ↓
PostgreSQL + MinIO
        ↕
Redis + Celery + Celery Beat
        ↓
AI / 翻译 / 视觉 / FFmpeg / 社媒 / CRM 连接器
```

### 3.1 技术栈

- 后端：Python、Django、Django REST Framework。
- 结构化数据：PostgreSQL。
- 异步任务：Redis、Celery、Celery Beat。
- 文件存储：MinIO，生产环境可替换为 S3 兼容对象存储。
- 媒体处理：FFmpeg。
- 前端：Vue 3、TypeScript、Vite、Element Plus、Pinia。
- API 文档：OpenAPI 3。
- 部署：Docker Compose 起步，服务边界允许后续迁移到独立容器或托管服务。

### 3.2 项目目录

```text
sinofgear-growth-engine/
├─ backend/
│  ├─ config/
│  ├─ apps/
│  │  ├─ identity/
│  │  ├─ catalog/
│  │  ├─ assets/
│  │  ├─ campaigns/
│  │  ├─ content/
│  │  ├─ publishing/
│  │  ├─ tracking/
│  │  ├─ radar/
│  │  ├─ ai/
│  │  ├─ jobs/
│  │  └─ audit/
│  ├─ integrations/
│  │  ├─ ai/
│  │  ├─ platforms/
│  │  ├─ crm/
│  │  ├─ media/
│  │  └─ translation/
│  └─ tests/
├─ frontend/
│  ├─ src/modules/
│  ├─ src/shared/
│  └─ tests/
├─ infrastructure/
├─ docs/
└─ docker-compose.yml
```

### 3.3 组织隔离

- 首期数据库中只启用一个 `Organization`。
- 所有业务表均携带 `organization_id`；平台字典等全局只读表除外。
- `organization_id` 从登录会话和服务端权限上下文取得，不接受前端任意指定。
- 对象查询、异步任务、文件路径、缓存键和审计日志均必须包含组织边界。
- 后续升级多企业时不改变业务对象主键和 API 路径。

---

## 4. 业务流程

### 4.1 主动增长链路

```text
Campaign
  ├─ Product
  ├─ MaterialAsset → AssetVariant
  ├─ ContentBrief
  └─ Landing Page
        ↓
MasterContent
        ↓
PlatformContent
        ↓
PublishTask
        ↓
PublishedPost
        ↓
TrackingLink → ShortLink
        ↓
ClickEvent → VisitorSession
        ↓
Analytics
```

`Campaign` 是内容生产和归因的共同上下文，至少包含目标国家、目标客户类型、内容目标、主推产品、落地页、语言和时间范围。

`ContentBrief` 是 AI 内容质量的核心输入，必须明确：

- 目标国家。
- 目标客户类型。
- 采购阶段。
- 内容目的。
- 关键词。
- CTA。
- 落地页面。
- 禁止表达。
- 核心卖点。
- 竞争优势。

### 4.2 被动增长链路

```text
Keyword
    ↓
MonitoringTask
    ↓
SourceAccount + SourceContent
    ↓
SourceSignal
    ↓
LeadCandidate
    ↓
LeadInsight
    ↓
OutreachDraft
    ↓
LeadHandoff
    ↓
CRM Agent
```

`SourceSignal` 统一承载所有可以支持潜客判断的公开信号，其类型至少包括：

- `COMMENT`
- `POST_AUTHOR`
- `CHANNEL_OWNER`
- `PROFILE_MATCH`
- `MENTION`
- `HASHTAG_MATCH`

`PublicComment` 保存评论原文、翻译和公开来源，但评论只是信号的一种，不是 `LeadCandidate` 的唯一来源。

### 4.3 AI Orchestrator

AI Orchestrator 统一编排以下工作流：

1. 内容工作流：产品与素材 → ContentBrief → 母内容 → 平台内容。
2. 潜客分析工作流：公开信号 → 需求与企业判断 → 评分与证据 → 联系建议。
3. 运营建议工作流：内容、流量和潜客数据 → 下周产品、平台和内容建议草稿。

AI Orchestrator 不是自主销售代理。它不能绕过审核发布内容、自动联系潜客、生成报价或改变 CRM 客户状态。

---

## 5. 页面与交互设计

### 5.1 交互模式

采用模块型后台，保留完整功能入口和专业用户的跳转效率，同时提供新手保护层：

- 首页显示待办、异常、增长概况和下一步建议。
- 首次使用提供连接账号、创建产品、上传素材、生成内容和模拟发布清单。
- 所有主要新建流程统一为“选择 → AI 生成 → 预览 → 人工确认”。
- 专业术语首次出现时提供就地解释。
- AI 默认生成草稿，不默认执行对外操作。
- 失败页面说明发生了什么、哪些数据已保存以及下一步怎么做。

### 5.2 页面地图

```text
总览

内容资产
├─ 产品库
├─ 素材中心
└─ AI 内容工厂

传播
├─ 发布中心
├─ 发布日历
└─ 平台账号

增长
├─ Campaign 与 UTM
├─ 短链接
└─ 流量分析

潜客发现
├─ 关键词库
├─ 监测任务
├─ 来源账号与内容
├─ 来源信号
├─ 潜客候选
├─ AI 洞察
├─ 联系建议
└─ CRM 交接

系统
├─ 异步任务
├─ 审核与通知
├─ 成员与权限
└─ 系统设置
```

### 5.3 视觉基线

- 品牌主色：`#005BA8`。
- 基础色：白色、浅灰背景、深灰正文。
- 页面使用清晰留白、轻边框和稳定的信息层级。
- 红色和黄色仅用于错误、风险和需关注状态。
- 当前阶段锁定信息结构和组件层级；精细视觉、图标和动效在后续 UI 专项中完成。

---

## 6. 数据模型

### 6.1 基础与权限

#### Organization

- `id`
- `name`
- `slug`
- `status`
- `timezone`
- `default_language`
- `created_at`

#### User

- `id`
- `email`
- `display_name`
- `is_active`
- `last_login_at`

#### Role

- `id`
- `code`
- `name`
- `permissions`

#### Membership

- `id`
- `organization_id`
- `user_id`
- `role_id`
- `status`
- `created_at`

唯一约束：`organization_id + user_id`。

#### Platform

统一平台字典，不为潜客来源另建重复的 `SourcePlatform`。

- `id`
- `code`
- `name`
- `region`
- `is_active`

#### PlatformCapability

- `id`
- `platform_id`
- `capability`
- `supported_mode`
- `constraints_json`

唯一约束：`platform_id + capability + supported_mode`。

能力至少包括：

- `PUBLISH`
- `METRICS_READ`
- `COMMENT_READ`
- `PUBLIC_SEARCH`
- `MEDIA_UPLOAD`
- `WEBHOOK`

发布模式：`API_AUTO`、`API_CONFIRM`、`EXPORT_PACKAGE`、`MANUAL`。

#### SocialAccount

- `id`
- `organization_id`
- `platform_id`
- `connector_credential_id`
- `external_account_id`
- `display_name`
- `publish_mode`
- `connection_status`
- `last_synced_at`

SocialAccount 通过 `connector_credential_id` 引用凭据；API 仅返回账号实际可用能力，不返回凭据内容。

#### ConnectorCredential

- `id`
- `organization_id`
- `platform_id`
- `secret_reference`
- `scopes`
- `expires_at`
- `status`

生产环境不在业务表保存明文令牌。`secret_reference` 指向密钥管理服务；本地开发只能使用受保护的加密存储。

### 6.2 内容增长

#### Product

- `id`
- `organization_id`
- `name_zh`
- `name_en`
- `product_type`
- `material`
- `module_range`
- `tooth_count_range`
- `pressure_angle`
- `accuracy_grade`
- `heat_treatment`
- `surface_treatment`
- `manufacturing_capabilities`
- `inspection_capabilities`
- `application_industries`
- `moq`
- `lead_time`
- `landing_page_url`
- `status`
- `version`

#### MaterialAsset

- `id`
- `organization_id`
- `asset_type`
- `storage_key`
- `original_filename`
- `mime_type`
- `size_bytes`
- `checksum`
- `language`
- `status`
- `metadata_json`
- `created_by`

原始素材不可被适配版本覆盖。文件内容使用 `organization_id + checksum` 去重。

#### AssetVariant

- `id`
- `organization_id`
- `source_asset_id`
- `storage_key`
- `aspect_ratio`
- `language`
- `subtitle_track`
- `platform_id`
- `generation_method`
- `status`
- `processing_job_id`

#### Campaign

- `id`
- `organization_id`
- `name`
- `target_countries`
- `target_customer_type`
- `objective`
- `landing_page_url`
- `languages`
- `starts_at`
- `ends_at`
- `status`

`CampaignProduct` 建立 Campaign 与 Product 的多对多关系。

#### ContentBrief

- `id`
- `organization_id`
- `campaign_id`
- `target_country`
- `target_customer_type`
- `purchase_stage`
- `content_objective`
- `keywords`
- `cta`
- `landing_page_url`
- `prohibited_claims`
- `core_selling_points`
- `competitive_advantages`
- `target_platforms`
- `language`
- `status`
- `version`

通过关联表连接 Product、MaterialAsset 和 AssetVariant。

#### MasterContent

- `id`
- `organization_id`
- `campaign_id`
- `content_brief_id`
- `title`
- `body`
- `language`
- `status`
- `version`
- `ai_run_id`
- `created_by`
- `approved_by`
- `approved_at`

#### PlatformContent

- `id`
- `organization_id`
- `master_content_id`
- `platform_id`
- `title`
- `body`
- `hashtags`
- `metadata_json`
- `status`
- `version`
- `ai_run_id`
- `approved_by`
- `approved_at`

#### PublishTask

- `id`
- `organization_id`
- `platform_content_id`
- `social_account_id`
- `publish_mode`
- `scheduled_at`
- `status`
- `idempotency_key`
- `attempt_count`
- `last_error_code`
- `job_id`

#### PublishedPost

- `id`
- `organization_id`
- `publish_task_id`
- `platform_id`
- `external_post_id`
- `post_url`
- `published_at`
- `result_snapshot`

### 6.3 数据归因

#### TrackingLink

- `id`
- `organization_id`
- `campaign_id`
- `published_post_id`
- `target_url`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `status`

#### ShortLink

- `id`
- `organization_id`
- `tracking_link_id`
- `code`
- `status`
- `expires_at`

`code` 全局唯一。短链服务完成事件写入后执行 302 跳转。

#### ClickEvent

- `id`
- `organization_id`
- `short_link_id`
- `occurred_at`
- `country_code`
- `device_class`
- `referrer_host`
- `privacy_safe_network_hash`
- `visitor_session_id`

点击事件只追加、不覆盖，数据量增长后按时间分区。

#### VisitorSession

- `id`
- `organization_id`
- `anonymous_id`
- `consent_status`
- `started_at`
- `last_seen_at`
- `landing_path`
- `event_summary`

不采集浏览器指纹，不通过匿名会话推断真实个人身份，不把访问者自动认定为潜客。

### 6.4 潜客雷达

#### Keyword

- `id`
- `organization_id`
- `term`
- `keyword_type`
- `language`
- `status`

#### MonitoringTask

- `id`
- `organization_id`
- `platform_id`
- `schedule`
- `cursor`
- `status`
- `last_success_at`
- `next_run_at`

通过 `MonitoringTaskKeyword` 关联多个 Keyword。

#### SourceAccount

- `id`
- `organization_id`
- `platform_id`
- `external_account_id`
- `account_name`
- `profile_url`
- `country_guess`
- `company_assessment`
- `industry_guess`
- `follower_count`
- `last_observed_at`

唯一约束：`organization_id + platform_id + external_account_id`。

#### SourceContent

- `id`
- `organization_id`
- `platform_id`
- `source_account_id`
- `external_content_id`
- `content_type`
- `title`
- `body_excerpt`
- `source_url`
- `published_at`
- `observed_at`
- `source_snapshot`

唯一约束：`organization_id + platform_id + external_content_id`。

#### PublicComment

- `id`
- `organization_id`
- `source_content_id`
- `external_comment_id`
- `author_source_account_id`
- `content`
- `language`
- `translation`
- `published_at`
- `source_url`

#### SourceSignal

- `id`
- `organization_id`
- `platform_id`
- `signal_type`
- `source_account_id`
- `source_content_id`
- `public_comment_id`
- `evidence_snapshot`
- `detected_at`
- `status`

`evidence_snapshot` 保存判断时可见的公开证据；来源记录后续变化不会覆盖历史证据。

#### LeadCandidate

- `id`
- `organization_id`
- `platform_id`
- `source_account_id`
- `normalized_identity_key`
- `display_name`
- `profile_url`
- `company_name_guess`
- `country_guess`
- `industry_guess`
- `score`
- `grade`
- `status`
- `human_adjusted_score`
- `adjustment_reason`

`LeadCandidateSignal` 保存候选与多个来源信号的关系。候选去重以组织、平台和规范化公开身份为边界。

#### LeadInsight

- `id`
- `organization_id`
- `lead_candidate_id`
- `product_need`
- `industry`
- `country_assessment`
- `purchase_signals`
- `recommended_action`
- `confidence`
- `ai_run_id`
- `review_status`
- `reviewed_by`
- `reviewed_at`

#### OutreachDraft

- `id`
- `organization_id`
- `lead_candidate_id`
- `lead_insight_id`
- `channel`
- `draft_type`
- `language`
- `subject`
- `body`
- `contact_reason`
- `status`
- `ai_run_id`

`OutreachDraft` 只是建议和草稿，不代表系统已经发送。

#### LeadHandoff

- `id`
- `organization_id`
- `lead_candidate_id`
- `lead_insight_id`
- `destination`
- `evidence_payload`
- `idempotency_key`
- `status`
- `external_reference`
- `job_id`
- `created_at`
- `completed_at`

交接负载必须包含：

```json
{
  "candidate_id": "candidate-id",
  "lead_insight_id": "insight-id",
  "source_evidence": [
    {
      "url": "https://public-source.example/item",
      "content": "Public evidence excerpt",
      "timestamp": "2026-08-08T10:00:00Z",
      "platform": "youtube"
    }
  ]
}
```

CRM 智能体收到候选、洞察和证据后，自行决定是否创建正式客户。

### 6.5 AI、异步任务与审计

#### PromptVersion

- `id`
- `organization_id`，系统模板可为空
- `workflow_type`
- `name`
- `version`
- `template`
- `input_schema`
- `output_schema`
- `status`
- `created_at`

唯一约束：`organization_id + workflow_type + name + version`。

#### AIRun

- `id`
- `organization_id`
- `workflow_type`
- `provider`
- `model`
- `prompt_version_id`
- `input_snapshot`
- `output_json`
- `confidence`
- `status`
- `human_correction`
- `reviewer_id`
- `started_at`
- `finished_at`
- `job_id`

#### Job

- `id`
- `organization_id`
- `job_type`
- `status`
- `progress`
- `input_reference`
- `result_reference`
- `error_code`
- `error_message`
- `attempt_count`
- `created_at`
- `started_at`
- `finished_at`

`Job` 是 AI 生成、媒体转换、发布、监测和 CRM 交接的统一异步任务资源。

#### WebhookEvent

- `id`
- `provider`
- `external_event_id`
- `event_type`
- `signature_status`
- `payload_hash`
- `payload_snapshot`
- `processing_status`
- `received_at`
- `processed_at`

`provider + external_event_id` 唯一，防止重复处理回调。

#### ApprovalRecord

- `id`
- `organization_id`
- `object_type`
- `object_id`
- `action`
- `actor_id`
- `comment`
- `created_at`

#### AuditLog

- `id`
- `organization_id`
- `actor_id`
- `action`
- `object_type`
- `object_id`
- `metadata`
- `occurred_at`

关键查看、创建、修改、批准、导出、重试和交接行为必须写入审计日志。

### 6.6 索引原则

- 所有业务列表索引以 `organization_id` 开头。
- PublishTask：`organization_id + status + scheduled_at`。
- Job：`organization_id + status + created_at`。
- MonitoringTask：`status + next_run_at`。
- ClickEvent：`organization_id + occurred_at`、`short_link_id + occurred_at`。
- SourceContent：平台外部 ID 唯一索引和 `observed_at` 索引。
- SourceSignal：`organization_id + signal_type + detected_at`。
- LeadCandidate：规范化身份唯一索引和 `status + score` 排序索引。
- AuditLog 和 WebhookEvent 按时间保留并支持归档。

---

## 7. API 设计

### 7.1 通用规则

- 统一前缀：`/api/v1`。
- 使用 JSON；文件上传使用受控 multipart 或预签名上传。
- 列表采用游标或稳定分页，返回明确排序字段。
- 创建、发布、交接和重试等高风险操作支持 `Idempotency-Key`。
- 耗时操作返回 `202 Accepted` 和 `job_id`。
- 错误响应使用稳定的业务错误码、用户可读说明和恢复建议。
- OpenAPI Schema 是前后端和连接器的接口契约。

### 7.2 资源分组

```text
/auth                  登录、当前用户和会话
/memberships           企业成员与角色
/platforms             平台与能力字典
/social-accounts       自有账号和实际可用能力
/products              产品与结构化参数
/assets                素材、关联和适配版本
/campaigns             活动、产品、市场和落地页
/content-briefs         内容策略输入
/master-contents       母内容生成、修改和审核
/platform-contents     平台内容和素材组合
/publish-tasks         审核、排期、取消和重试
/published-posts       发布结果
/tracking-links        UTM 链接
/short-links           短链接管理
/analytics             点击、会话和渠道分析
/keywords              关键词库
/monitoring-tasks      监测任务和执行控制
/source-accounts       公开来源账号
/source-contents       公开帖子和视频
/source-signals        公开采购信号
/lead-candidates       候选线索和评分
/lead-insights         AI 洞察与证据
/outreach-drafts       联系建议和话术草稿
/lead-handoffs         CRM 智能体交接
/ai-runs               AI 运行和审计
/jobs                  统一异步任务状态
/webhooks              外部服务回调入口
/audit-logs            授权范围内的审计查询
```

### 7.3 异步任务 API

```text
GET  /api/v1/jobs
GET  /api/v1/jobs/{job_id}
POST /api/v1/jobs/{job_id}/retry
POST /api/v1/jobs/{job_id}/cancel
```

示例响应：

```json
{
  "job_id": "job-id",
  "type": "CONTENT_GENERATE",
  "status": "RUNNING",
  "progress": 65,
  "created_at": "2026-08-08T10:00:00Z",
  "finished_at": null,
  "error": null,
  "result_reference": null
}
```

只有仍可取消的任务允许取消；只有符合重试策略且操作者有权限的失败任务允许重试。

### 7.4 Webhook API

```text
POST /api/v1/webhooks/linkedin
POST /api/v1/webhooks/meta
POST /api/v1/webhooks/google
POST /api/v1/webhooks/crm
POST /api/v1/webhooks/ai/{provider}
```

所有 Webhook 必须：

- 读取原始请求体后验签。
- 校验时间窗口，防止重放攻击。
- 按外部事件 ID 幂等。
- 先持久化 `WebhookEvent`，再异步处理。
- 返回平台要求的快速确认响应。
- 对失败处理采用有限重试和死信记录。

### 7.5 关键动作接口

```text
POST /content-briefs/{id}/generate-master-content
POST /master-contents/{id}/submit-review
POST /master-contents/{id}/approve
POST /platform-contents/{id}/submit-review
POST /platform-contents/{id}/approve
POST /publish-tasks/{id}/schedule
POST /publish-tasks/{id}/cancel
POST /monitoring-tasks/{id}/run
POST /monitoring-tasks/{id}/pause
POST /lead-candidates/{id}/analyze
POST /lead-candidates/{id}/review
POST /lead-candidates/{id}/generate-outreach
POST /lead-handoffs
```

动作接口必须在服务端验证当前状态、权限、平台能力和依赖对象的审核状态。

---

## 8. 异步任务体系

### 8.1 任务类型

- `CONTENT_GENERATE`
- `CONTENT_TRANSLATE`
- `MEDIA_TRANSCODE`
- `MEDIA_SUBTITLE`
- `PUBLISH_POST`
- `FETCH_POST_METRICS`
- `MONITOR_PUBLIC_SOURCE`
- `ANALYZE_SOURCE_SIGNAL`
- `ANALYZE_LEAD`
- `GENERATE_OUTREACH`
- `CRM_HANDOFF`
- `OPERATIONS_RECOMMENDATION`

### 8.2 执行规则

- API 创建 Job 和领域对象后再提交 Celery，避免任务存在但业务记录不存在。
- Worker 领取任务时使用原子状态转换，防止并发重复执行。
- 每次执行记录 attempt、开始时间、结束时间、错误码和结果引用。
- 发布、Webhook 和 CRM 交接必须使用业务幂等键。
- 平台限流采用按连接器配置的退避时间，不进行无限重试。
- 任务取消只阻止尚未开始的外部副作用；已经由平台接受的发布不能伪装成已取消。
- 失败任务保留输入快照，不允许重试时悄悄替换原输入。

### 8.3 Job 状态

```text
QUEUED → RUNNING → SUCCEEDED
            ↓
          FAILED → RETRY_QUEUED
            ↓
         CANCELLED
```

`CANCELLED` 只用于未完成外部副作用的任务；取消请求无法撤销平台已经完成的发布。

---

## 9. 状态机设计

### 9.1 MasterContent

```text
DRAFT → GENERATING → IN_REVIEW → APPROVED
                         ↓           ↓
                      REJECTED    ARCHIVED
```

母内容可被多个平台内容多次复用，因此不使用 `PUBLISHED` 作为母内容状态。

### 9.2 PlatformContent

```text
DRAFT → IN_REVIEW → APPROVED → PUBLISHED → ARCHIVED
             ↓
          REJECTED
```

`ARCHIVED` 表示退出日常使用但保留历史、关联与版本，不等于删除。

### 9.3 PublishTask

```text
DRAFT → PENDING_APPROVAL → SCHEDULED → RUNNING → SUCCEEDED
                                ↓           ↓
                            CANCELLED     FAILED → RETRY_QUEUED
```

部分平台成功时，每个平台任务独立记录结果，不把整批内容标记为全部失败。

### 9.4 LeadCandidate

```text
DISCOVERED → ANALYZING → ANALYZED → REVIEWED
                                      ├→ READY_FOR_HANDOFF → HANDED_OFF
                                      └→ IGNORED
```

`HANDED_OFF` 只代表完成交接，不代表 CRM 接纳、报价或成交。

### 9.5 MonitoringTask

```text
DRAFT → ACTIVE ↔ PAUSED
           ↓
         ERROR → ACTIVE
           ↓
        ARCHIVED
```

单次执行状态由 Job 管理，MonitoringTask 只保存配置和长期运行状态。

---

## 10. 权限设计

首期定义以下系统角色：

### Administrator

- 管理成员、角色、连接器和全部项目数据。
- 批准高风险操作和查看审计日志。

### Operator

- 管理产品、素材、Campaign、内容、排期和监测任务。
- 可提交审核，但不能绕过审批要求。

### Reviewer

- 审核内容、潜客洞察、联系建议和 CRM 交接。
- 可拒绝并填写原因，不能修改系统连接凭据。

### ReadOnly

- 查看授权数据和报告。
- 不能发起 AI、发布、监测、导出或交接操作。

权限在 API 服务端执行。前端隐藏按钮只用于体验，不是安全边界。

---

## 11. AI Agent 设计

### 11.1 Provider 抽象

AI、翻译和视觉服务必须通过 Provider 接口接入，业务表不依赖某个模型供应商。

每次 `AIRun` 必须记录：

- Provider 和模型名称。
- PromptVersion。
- InputSnapshot。
- 结构化 OutputJSON。
- Confidence。
- HumanCorrection。
- Reviewer。
- 开始、结束和失败信息。

### 11.2 结构化输出

- 每个 PromptVersion 声明输入和输出 Schema。
- 输出在写入业务表前完成 Schema 验证。
- 验证失败进行有限修复重试；仍失败则保留原始响应并转人工处理。
- AI 不确定的产品能力、认证、精度、交期和价格不得自动补全为事实。

### 11.3 人工修正

- 人工修改不覆盖 AI 原始输出。
- `AIRun.output_json` 保存原始结构化结果。
- `human_correction` 保存差异和修正理由。
- 领域对象保存最终批准版本。

### 11.4 运营建议

运营建议工作流可以输出：

- 建议继续或暂停推广的产品。
- 平台和市场效果比较。
- 下周内容主题建议。
- 资料缺口和需要补充的素材。

这些输出始终是建议草稿，不自动改变 Campaign、预算、排期或发布任务。

---

## 12. 平台连接器设计

### 12.1 统一接口

每个平台连接器声明并实现其支持能力：

- 连接与令牌刷新。
- 发布文本、图片或视频。
- 查询发布状态。
- 获取允许读取的指标。
- 搜索或读取允许访问的公开内容。
- 接收和验证 Webhook。

未支持的能力必须明确返回 `CAPABILITY_NOT_SUPPORTED`，不能静默降级为模拟登录或非授权抓取。

### 12.2 能力解析

实际可用能力由三层共同决定：

```text
PlatformCapability
∩ Connector 实现能力
∩ SocialAccount 授权范围
= 当前账号能力
```

前端根据当前账号能力显示 API 自动发布、确认发布、导出包或人工操作。

### 12.3 首期平台策略

- 所有平台都有统一模型、模拟连接器和导出包能力。
- 已具备官方授权和稳定 API 的平台可以启用真实连接器。
- API 不允许的国内平台使用 `EXPORT_PACKAGE` 或 `MANUAL`。
- 公开监测只使用官方 API、合规搜索服务或人工导入。

---

## 13. 异常处理

### 13.1 用户可恢复错误

界面必须回答三个问题：

1. 发生了什么。
2. 哪些数据已经安全保存。
3. 用户下一步可以执行什么。

### 13.2 错误场景

| 场景 | 系统行为 | 用户动作 |
|---|---|---|
| AI 输出不符合 Schema | 保留输入和原响应，有限重试后转人工 | 修改输入或人工补全 |
| 平台令牌失效 | 暂停该账号的新任务，不影响其他账号 | 重新授权 |
| 平台限流 | 按平台策略延期并记录预计重试时间 | 等待或调整排期 |
| 部分平台发布失败 | 逐平台记录结果，只重试失败任务 | 检查失败平台 |
| 媒体转换失败 | 保留原始素材和失败步骤 | 更换源文件或参数后重试 |
| 重复来源内容 | 使用平台外部 ID 拦截重复写入 | 查看已有记录 |
| 重复候选 | 显示匹配身份与证据 | 合并、保留或忽略 |
| 监测来源不可用 | 保存游标与上次成功时间 | 恢复后继续 |
| CRM 交接超时 | 使用相同幂等键安全重试 | 查看交接任务 |
| Webhook 重复 | 按外部事件 ID 忽略重复副作用 | 无需操作 |
| 权限不足 | 拒绝请求并记录安全审计 | 联系管理员 |

---

## 14. 测试方案

### 14.1 单元测试

- 状态机转换。
- 潜客评分规则和等级边界。
- UTM 与短码生成。
- PlatformCapability 能力解析。
- PromptVersion Schema 验证。
- 幂等键和重复检测。

### 14.2 集成测试

- PostgreSQL 约束、组织隔离和索引路径。
- MinIO 文件保存与原始素材不可覆盖。
- Redis、Celery 任务领取、取消和重试。
- Webhook 验签、去重和异步处理。
- 模拟 AI、平台、媒体和 CRM 连接器。

### 14.3 API 契约测试

- OpenAPI Schema 与实际响应一致。
- `/jobs` 提供统一任务状态。
- 高风险接口验证权限、状态和 Idempotency-Key。
- 错误码包含可恢复建议且不泄露密钥或内部堆栈。

### 14.4 端到端测试

闭环一：

```text
创建产品
→ 上传原始视频
→ 创建 Campaign 与 ContentBrief
→ 生成母内容和五个平台内容
→ 审核与排期
→ 模拟发布
→ 创建短链
→ 记录访问
→ 查看渠道分析
```

闭环二：

```text
创建行业关键词
→ 运行模拟监测
→ 写入来源账号、内容与信号
→ 生成潜客候选
→ AI 分析与人工修正
→ 生成 OutreachDraft
→ 携带 Evidence 模拟交接 CRM
```

### 14.5 安全与隐私测试

- 跨组织访问全部拒绝。
- 连接器凭据不进入日志、API 响应或 AIRun 快照。
- ClickEvent 和 VisitorSession 不采集浏览器指纹。
- 未批准内容无法发布。
- 未审核候选无法交接。
- Webhook 签名错误、过期或重放时不执行副作用。

### 14.6 人工验收

- 新手能在没有开发人员帮助的情况下完成两个闭环。
- 失败任务能从总览或任务页找到原因并安全恢复。
- 每个 AI 结论能追溯到模型、PromptVersion、输入、输出和人工修正。
- CRM Evidence 能回答“为什么这个候选值得联系”。

---

## 15. MVP 开发计划

所有下列模块都属于项目开发范围。分批交付只用于控制集成风险，不代表删除后续模块。

### Phase A：骨架与主动增长闭环

- 创建独立 Django、Vue 和基础设施项目骨架。
- 建立组织、角色、平台和能力模型。
- 生成首批数据库模型、迁移和 OpenAPI Schema。
- 完成产品、素材、Campaign、ContentBrief、母内容和平台内容。
- 完成统一 Job、PromptVersion、AIRun 和模拟连接器。
- 完成审核、模拟发布、UTM、短链和点击分析。
- 验收主动增长闭环。

### Phase B：潜客发现闭环

- 完成关键词、监测任务和模拟公开来源连接器。
- 完成 SourceAccount、SourceContent、PublicComment 和 SourceSignal。
- 完成 LeadCandidate、LeadInsight、OutreachDraft 和 LeadHandoff。
- 完成评分规则、证据包、人工修正和模拟 CRM 连接器。
- 验收被动增长闭环。

### Phase C：真实连接与增强能力

- 按官方授权逐个平台接入真实发布和数据连接器。
- 完成 AssetVariant、FFmpeg 转码、字幕和多比例适配。
- 完成 Webhook 回调、真实指标同步和平台限流策略。
- 完成隐私安全 VisitorSession 和更完整的渠道分析。
- 完成运营建议工作流。
- 接入真实 CRM 智能体并验证 Evidence 交接。

### 15.1 不进入当前范围的扩展

- CRM 销售流程。
- 自动报价。
- 无审核自动陌生触达。
- 在线支付和套餐计费。
- 移动端原生应用。
- 平台未授权的模拟登录和数据采集。

---

## 16. 最终验收结论

V1.0 达标必须同时满足：

- 主动增长闭环和被动增长闭环均可运行。
- 模拟连接器可以在无外部账号时完成确定性测试。
- 真实连接器不会改变领域模型和核心 API。
- 候选线索与 CRM 客户保持明确隔离。
- 内容、AI 判断、发布、访问和交接均可追溯。
- 所有外部副作用具备权限检查、幂等和失败恢复。
- UI 采用品牌蓝 `#005BA8`，模块清晰，新手可以完成主要流程。

满足以上条件后，项目才进入后续商业化、更多平台和深度 CRM 集成评估。
