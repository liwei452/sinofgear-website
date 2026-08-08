# Gear Manufacturing Ontology Layer Design

## 1. 目标

为 SinofGear AI Social Growth Engine 增加一个面向齿轮制造与工业采购的轻量知识本体层，使产品内容生成、公开信号分析和潜客判断复用同一套受控概念与关系。

该模块是 AI 的业务理解层，不替代 PostgreSQL 业务数据库，也不把项目改造成独立知识图谱平台。

## 2. 范围

首期只建设 Gear Manufacturing Ontology，覆盖：

- 产品类型：Spur Gear、Helical Gear、Bevel Gear、Worm Gear、Gear Shaft。
- 参数：模数、齿数、压力角、精度等级。
- 材料：20CrMnTi、42CrMo、Stainless Steel、Nylon。
- 工艺：Hobbing、Shaping、Grinding、Carburizing、Quenching、Heat Treatment。
- 标准：DIN、ISO、AGMA。
- 行业：Packaging Machinery、Agricultural Machinery、Robotics、Food Machinery、Automation Equipment。
- 应用场景：Automated Packaging Line、Conveyor Drive、Robot Joint、Agricultural Gearbox。
- 客户类型：OEM、Equipment Manufacturer、Repair Company、Distributor。
- 采购意图：Need Supplier、Need Quotation、Need Custom Manufacturing、Need Replacement Part。

首期不包含：

- Neo4j、RDF、OWL 或 SPARQL。
- 独立向量数据库。
- 通用机械行业全量知识图谱。
- 未经审核的 AI 自动知识写入。
- 自动推理后直接发布内容、联系潜客或修改业务记录。

## 3. 架构位置

```text
AI Orchestrator
        ↑
Ontology Context Service
        ↑
PostgreSQL Knowledge Module
├─ KnowledgeConcept
├─ KnowledgeAlias
├─ KnowledgeRelation
├─ KnowledgeEvidence
└─ Domain Concept Links
        ↑
Business Database
├─ Product
├─ ContentBrief
├─ SourceSignal
└─ LeadInsight
```

PostgreSQL 继续保存业务事实。Ontology Context Service 只负责解析概念、关系、别名和已批准证据，并为 AI 工作流生成可审计的知识快照。

## 4. 数据模型

### 4.1 KnowledgeConcept

表示受控业务概念。

字段：

- `id`
- `scope`：`SYSTEM` 或 `ORGANIZATION`
- `organization_id`：系统概念为空，企业自定义概念必填
- `concept_type`
- `code`
- `label_zh`
- `label_en`
- `description`
- `status`
- `version`
- `created_by`
- `created_at`
- `updated_at`

`concept_type` 首期取值：

- `PRODUCT_TYPE`
- `PARAMETER`
- `MATERIAL`
- `PROCESS`
- `STANDARD`
- `APPLICATION`
- `INDUSTRY`
- `CUSTOMER_TYPE`
- `PURCHASE_INTENT`

约束：

- 系统概念以 `scope + concept_type + code` 唯一。
- 企业概念以 `organization_id + concept_type + code` 唯一。
- 企业查询可读取系统概念和本企业概念，不能读取其他企业概念。
- 已被业务对象引用的概念不能物理删除，只能 `DEPRECATED`。

### 4.2 KnowledgeAlias

保存多语言同义词、行业简称和常见表达。

字段：

- `id`
- `concept_id`
- `language`
- `alias`
- `normalized_alias`
- `alias_type`：`SYNONYM`、`ABBREVIATION`、`MARKET_TERM`
- `status`

示例：

```text
Helical Gear
├─ 斜齿轮
├─ helical gears
└─ hélicoïdal gear（市场文本中的混合表达，仅在审核后保留）
```

同一作用域、语言和规范化别名不能同时指向多个已批准概念；发生冲突时必须人工消歧。

### 4.3 KnowledgeRelation

表示两个概念之间的受控关系。

字段：

- `id`
- `organization_id`：系统关系为空
- `subject_concept_id`
- `predicate`
- `object_concept_id`
- `status`
- `confidence`
- `version`
- `suggested_by_ai_run_id`
- `reviewed_by`
- `reviewed_at`

`predicate` 首期取值：

- `IS_A`
- `APPLIES_TO`
- `USES_MATERIAL`
- `REQUIRES_PROCESS`
- `COMPLIES_WITH`
- `RELEVANT_TO_CUSTOMER_TYPE`
- `INDICATES_PURCHASE_INTENT`
- `REQUIRES_PARAMETER`

示例：

```text
Helical Gear  IS_A                         Gear
Helical Gear  APPLIES_TO                   Automated Packaging Line
Helical Gear  COMPLIES_WITH                DIN
Need Supplier INDICATES_PURCHASE_INTENT    Procurement Intent
```

关系规则：

- `IS_A` 不允许形成循环。
- 主体和客体必须符合 predicate 的允许类型组合。
- 同一作用域内相同主体、predicate 和客体不能重复。
- AI 建议关系的初始状态只能为 `SUGGESTED`。
- 只有 `APPROVED` 关系可进入 AI 生产上下文。

### 4.4 KnowledgeEvidence

保存概念或关系的依据，不保存私密或未经授权数据。

字段：

- `id`
- `organization_id`
- `evidence_type`：`PRODUCT_DOCUMENT`、`PUBLIC_SOURCE`、`HUMAN_ENTRY`、`STANDARD_REFERENCE`
- `source_object_type`
- `source_object_id`
- `source_url`
- `excerpt`
- `captured_at`
- `status`
- `created_by`

KnowledgeConcept 和 KnowledgeRelation 通过关联表连接一个或多个 KnowledgeEvidence。后续源内容变化不能覆盖已经用于 AI 判断的证据快照。

### 4.5 Domain Concept Links

业务对象不直接把所有语义塞进 JSON，而是通过明确的领域关联表连接概念。

Phase A：

- `ProductConceptLink`
  - `product_id`
  - `concept_id`
  - `role`：`TYPE`、`MATERIAL`、`PROCESS`、`STANDARD`、`APPLICATION`、`PARAMETER`
  - `status`
  - `evidence_id`
- `ContentBriefConceptLink`
  - `content_brief_id`
  - `concept_id`
  - `role`：`TARGET_INDUSTRY`、`TARGET_CUSTOMER_TYPE`、`PURCHASE_INTENT`、`STANDARD`、`APPLICATION`

Phase B：

- `SourceSignalConceptLink`
- `LeadInsightConceptLink`

这些关联表属于对应业务域；Knowledge 模块不反向依赖 Product、ContentBrief、SourceSignal 或 LeadInsight。

## 5. 状态与审核

概念、别名和关系采用统一状态：

```text
SUGGESTED → APPROVED → DEPRECATED
     ↓
  REJECTED
```

- 人工创建的记录也必须经过审核后才能进入 AI 上下文。
- `REJECTED` 记录保留建议来源和拒绝理由，用于改进 Prompt。
- `DEPRECATED` 记录仍可解释历史 AIRun，但不进入新的生成和分析。
- 审核操作写入现有 ApprovalRecord 和 AuditLog。

## 6. Ontology Context Service

提供以下稳定接口：

```python
resolve_alias(*, organization_id, text, language) -> list[ConceptMatch]

get_product_context(*, product_id) -> OntologySnapshot

get_content_brief_context(*, content_brief_id) -> OntologySnapshot

expand_concepts(*, concept_ids, predicates, max_depth=2) -> OntologySnapshot
```

`OntologySnapshot` 必须包含：

- 使用的概念 ID、code、版本和标签。
- 使用的关系 ID、predicate 和版本。
- 证据引用。
- 生成时间。
- organization_id。

AIRun 保存 OntologySnapshot，不在任务执行中读取会变化的实时关系。

首期关系扩展使用 PostgreSQL 递归 CTE，最大深度固定为 2，避免不可控图遍历。

## 7. AI 工作流集成

### 7.1 内容生成

```text
Product + ProductConceptLink
        ↓
Approved Concepts and Relations
        ↓
ContentBrief + ContentBriefConceptLink
        ↓
OntologySnapshot
        ↓
AI Orchestrator
```

生成内容时，受控概念作为业务语义，Product 的已确认参数仍是事实来源。Ontology 不能覆盖 Product 的明确字段。

### 7.2 潜客分析

Phase B 将公开文本先映射为概念建议，再创建 SourceSignal。AI 可以建议：

- 产品类型。
- 应用行业。
- 客户类型。
- 采购意图。
- 需要追问的产品参数。

建议概念及关系在人工审核前不能升级为系统知识。

## 8. API

Phase A 内部管理 API：

```text
GET  /api/v1/knowledge/concepts
POST /api/v1/knowledge/concepts
GET  /api/v1/knowledge/concepts/{id}
POST /api/v1/knowledge/concepts/{id}/submit-review
POST /api/v1/knowledge/concepts/{id}/approve
POST /api/v1/knowledge/concepts/{id}/reject

GET  /api/v1/knowledge/relations
POST /api/v1/knowledge/relations
POST /api/v1/knowledge/relations/{id}/approve
POST /api/v1/knowledge/relations/{id}/reject

GET  /api/v1/knowledge/aliases
POST /api/v1/knowledge/aliases
POST /api/v1/knowledge/resolve
```

权限：

- `ADMINISTRATOR` 管理和审核系统/企业知识。
- `REVIEWER` 审核企业知识，不能修改系统知识。
- `OPERATOR` 创建企业知识建议和别名建议。
- `READ_ONLY` 只能查看已批准知识。

## 9. UI

Phase A 增加一个简洁的“工业知识”管理页：

- 按概念类型筛选。
- 查看中英文标签、别名、关系和证据。
- 审核 AI 或人工建议。
- 显示被哪些 Product 和 ContentBrief 引用。
- 不在首期制作可拖拽图谱画布。

## 10. 异常处理

- 别名冲突：返回候选概念，要求人工消歧。
- `IS_A` 循环：拒绝写入并返回形成循环的路径。
- 不允许的类型关系：返回 predicate 的主体/客体类型约束。
- 已引用概念删除：拒绝删除，建议改为 `DEPRECATED`。
- AI 建议缺少证据：允许保存为 `SUGGESTED`，禁止进入生产上下文。
- Snapshot 中概念后来废弃：历史 AIRun 继续展示原版本，新运行不再使用。

## 11. 测试与验收

自动测试覆盖：

- 系统概念与企业概念的组织隔离。
- code、别名和关系唯一约束。
- 别名规范化和冲突消歧。
- `IS_A` 循环检测。
- predicate 主体/客体类型校验。
- 只有 APPROVED 知识进入 OntologySnapshot。
- Snapshot 固定概念和关系版本。
- Product 和 ContentBrief 领域关联。
- AI 建议只能进入 SUGGESTED。
- DEPRECATED 知识仍可解释历史 AIRun。

人工验收场景：

```text
创建 Helical Gear、Grinding、DIN、Packaging Machinery 概念
→ 建立并审核关系
→ 将概念关联到斜齿轮产品和德国包装机械 ContentBrief
→ 生成 OntologySnapshot
→ Fake AI 内容中出现正确的产品、行业和标准语义
→ Snapshot 可追溯到概念、关系、版本和证据
```

## 12. 演进门槛

只有满足以下条件之一，才评估 Neo4j 或其他图数据库：

- PostgreSQL 关系数量和递归查询已成为可测量的性能瓶颈。
- 已出现需要超过两层关系遍历的稳定业务查询。
- 内容或潜客质量数据证明图推理带来明确收益。
- 团队具备双数据库同步、备份和故障恢复能力。

向图数据库演进时，PostgreSQL 仍是事实源；图数据库是可重建的查询投影，不成为业务交易主库。
