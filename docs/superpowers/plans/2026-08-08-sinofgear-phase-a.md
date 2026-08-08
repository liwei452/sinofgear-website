# SinofGear Phase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在全新独立项目中交付可测试的主动增长闭环：产品与素材 → Campaign 与 ContentBrief → AI 母内容和平台内容 → 审核与模拟发布 → UTM、短链、点击和渠道分析。

**Architecture:** 使用 Django/DRF 模块化单体承载领域模型和 API，PostgreSQL 保存结构化数据，MinIO 保存原始素材，Redis/Celery 处理统一 Job。Vue 3 管理后台按模块导航组织页面，AI、平台和存储均通过可替换连接器接入；Phase A 使用确定性的 Fake AI 和 Mock Platform 连接器完成无外部账号的端到端验收。

**Tech Stack:** Python、Django、Django REST Framework、PostgreSQL、Redis、Celery、MinIO、drf-spectacular、pytest、Vue 3、TypeScript、Vite、Element Plus、Pinia、TanStack Vue Query、Vitest、Vue Test Utils、Playwright、Docker Compose。

## Global Constraints

- 目标目录是独立项目 `C:\Users\Administrator\Documents\网站\sinofgear-growth-engine`，不得复用或移动现有 `app/platform` 代码。
- 所有业务表必须包含 `organization_id`；Organization、User、Role、Platform 等明确的全局或身份表除外。
- `organization_id` 只能从服务端会话上下文取得，不接受客户端任意指定。
- 品牌主色固定为 `#005BA8`；Phase A 只实现清晰、可用的组件层级，不做精细动效。
- AI 只生成草稿；未批准的 PlatformContent 不得排期或发布。
- 所有耗时操作返回 `202 Accepted + job_id`，并通过统一 `/api/v1/jobs` 查询。
- 发布、短链创建和外部副作用必须支持 `Idempotency-Key`。
- 原始素材不可被派生版本覆盖，连接凭据和密钥不得进入 API、日志或 AIRun 快照。
- Phase A 必须使用 Fake AI、Mock Platform 和本地测试存储完成确定性自动测试，不依赖外部网络。
- 每个任务完成前运行该任务列出的测试；提交只能包含该任务范围内文件。

---

## File Structure

```text
sinofgear-growth-engine/
├─ .env.example
├─ .gitignore
├─ README.md
├─ docker-compose.yml
├─ backend/
│  ├─ pyproject.toml
│  ├─ manage.py
│  ├─ config/
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  ├─ celery.py
│  │  └─ wsgi.py
│  ├─ apps/
│  │  ├─ common/
│  │  ├─ identity/
│  │  ├─ platforms/
│  │  ├─ catalog/
│  │  ├─ assets/
│  │  ├─ campaigns/
│  │  ├─ jobs/
│  │  ├─ ai/
│  │  ├─ content/
│  │  ├─ publishing/
│  │  ├─ tracking/
│  │  └─ audit/
│  ├─ integrations/
│  │  ├─ ai/
│  │  ├─ platforms/
│  │  └─ storage/
│  └─ tests/
├─ frontend/
│  ├─ package.json
│  ├─ vite.config.ts
│  ├─ playwright.config.ts
│  └─ src/
│     ├─ app/
│     ├─ api/
│     ├─ modules/
│     ├─ shared/
│     └─ styles/
├─ infrastructure/
│  ├─ backend.Dockerfile
│  └─ frontend.Dockerfile
└─ docs/
   ├─ architecture.md
   └─ phase-a-acceptance.md
```

---

### Task 1: Bootstrap the Independent Workspace

**Files:**
- Create: `sinofgear-growth-engine/.gitignore`
- Create: `sinofgear-growth-engine/.env.example`
- Create: `sinofgear-growth-engine/README.md`
- Create: `sinofgear-growth-engine/docker-compose.yml`
- Create: `sinofgear-growth-engine/infrastructure/backend.Dockerfile`
- Create: `sinofgear-growth-engine/infrastructure/frontend.Dockerfile`
- Create: `sinofgear-growth-engine/backend/pyproject.toml`
- Create: `sinofgear-growth-engine/frontend/package.json`
- Create: `sinofgear-growth-engine/frontend/pnpm-workspace.yaml`
- Test: `sinofgear-growth-engine/backend/tests/test_project_layout.py`

**Interfaces:**
- Produces: local services named `db`, `redis`, `minio`, `api`, `worker`, `beat`, and `frontend`.
- Produces: environment variables `DATABASE_URL`, `REDIS_URL`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `DJANGO_SECRET_KEY`, `SEED_ADMIN_PASSWORD`, and `AI_PROVIDER`.

- [ ] **Step 1: Create the new directory and initialize Git**

Run in PowerShell:

```powershell
New-Item -ItemType Directory -Path 'C:\Users\Administrator\Documents\网站\sinofgear-growth-engine'
git -C 'C:\Users\Administrator\Documents\网站\sinofgear-growth-engine' init
```

Expected: an empty independent Git repository exists outside `app`.

- [ ] **Step 2: Write the layout test**

Create `backend/tests/test_project_layout.py`:

```python
from pathlib import Path


def test_required_workspace_files_exist() -> None:
    root = Path(__file__).resolve().parents[2]
    required = [
        root / "docker-compose.yml",
        root / ".env.example",
        root / "backend" / "pyproject.toml",
        root / "frontend" / "package.json",
    ]
    assert all(path.is_file() for path in required)
```

- [ ] **Step 3: Run the test and verify it fails**

Run:

```powershell
cd 'C:\Users\Administrator\Documents\网站\sinofgear-growth-engine\backend'
python -m pytest tests/test_project_layout.py -v
```

Expected: FAIL because the workspace files do not yet exist.

- [ ] **Step 4: Add dependency manifests and service definitions**

`backend/pyproject.toml` must pin compatible release ranges and define these dependency groups:

```toml
[project]
name = "sinofgear-growth-backend"
requires-python = ">=3.12,<3.14"
dependencies = [
  "Django>=5.2,<5.3",
  "djangorestframework>=3.16,<3.17",
  "drf-spectacular>=0.28,<0.29",
  "psycopg[binary]>=3.2,<3.3",
  "celery>=5.5,<5.6",
  "redis>=6,<7",
  "minio>=7.2,<8",
  "django-cors-headers>=4.7,<5",
  "gunicorn>=23,<24"
]

[project.optional-dependencies]
dev = [
  "pytest>=8.3,<9",
  "pytest-django>=4.11,<5",
  "factory-boy>=3.3,<4",
  "ruff>=0.12,<0.13"
]
```

`docker-compose.yml` must expose only frontend and API ports to the host; PostgreSQL, Redis and MinIO credentials come from `.env` and use named volumes. `.env.example` must contain development-only values and an explicit warning that production secrets must differ.

- [ ] **Step 5: Install dependencies and run the layout test**

Run:

```powershell
python -m pip install -e '.[dev]'
python -m pytest tests/test_project_layout.py -v
```

Expected: PASS.

- [ ] **Step 6: Verify Compose configuration**

Run:

```powershell
Copy-Item ..\.env.example ..\.env
docker compose -f ..\docker-compose.yml config --quiet
```

Expected: exit code 0 with no missing variable errors.

- [ ] **Step 7: Commit the workspace bootstrap**

```powershell
git add .
git commit -m "chore: bootstrap independent growth engine workspace"
```

---

### Task 2: Configure Django, PostgreSQL, Health Checks, and OpenAPI

**Files:**
- Create: `backend/manage.py`
- Create: `backend/config/settings.py`
- Create: `backend/config/urls.py`
- Create: `backend/config/celery.py`
- Create: `backend/config/wsgi.py`
- Create: `backend/apps/common/apps.py`
- Create: `backend/apps/common/api.py`
- Create: `backend/apps/common/models.py`
- Test: `backend/tests/test_health_api.py`
- Test: `backend/tests/test_openapi.py`

**Interfaces:**
- Produces: `GET /api/v1/health` returning `{"status":"ok"}`.
- Produces: `GET /api/v1/schema` returning OpenAPI 3 JSON.
- Produces: abstract `OrganizationScopedModel` with UUID primary key, `organization_id`, `created_at`, and `updated_at`.

- [ ] **Step 1: Write failing API tests**

```python
import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_health_endpoint() -> None:
    response = APIClient().get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.django_db
def test_openapi_schema_is_available() -> None:
    response = APIClient().get("/api/v1/schema")
    assert response.status_code == 200
    assert response.json()["openapi"].startswith("3.")
```

- [ ] **Step 2: Run the tests and verify they fail**

```powershell
python -m pytest tests/test_health_api.py tests/test_openapi.py -v
```

Expected: FAIL because Django configuration and routes do not exist.

- [ ] **Step 3: Implement settings and common base model**

Use `DATABASE_URL` to configure PostgreSQL, set UTC storage with configurable display timezone, install DRF and drf-spectacular, and define:

```python
class OrganizationScopedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey("identity.Organization", on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

Add health and schema routes under `/api/v1`.

- [ ] **Step 4: Run migrations and tests**

```powershell
python manage.py makemigrations
python manage.py migrate
python -m pytest tests/test_health_api.py tests/test_openapi.py -v
```

Expected: both tests PASS.

- [ ] **Step 5: Run static checks and commit**

```powershell
python -m ruff check .
git add backend
git commit -m "feat: configure Django API and health checks"
```

---

### Task 3: Implement Organization-Scoped Authentication and RBAC

**Files:**
- Create: `backend/apps/identity/models.py`
- Create: `backend/apps/identity/permissions.py`
- Create: `backend/apps/identity/serializers.py`
- Create: `backend/apps/identity/views.py`
- Create: `backend/apps/identity/urls.py`
- Create: `backend/apps/identity/services.py`
- Create: `backend/apps/identity/migrations/0001_initial.py`
- Test: `backend/apps/identity/tests/test_permissions.py`
- Test: `backend/apps/identity/tests/test_current_user_api.py`

**Interfaces:**
- Produces: `Organization`, `Role`, `Membership` and Django `User` integration.
- Produces: roles `ADMINISTRATOR`, `OPERATOR`, `REVIEWER`, `READ_ONLY`.
- Produces: `request.organization` resolved from the authenticated membership.
- Produces: `GET /api/v1/auth/me` and session login/logout endpoints.

- [ ] **Step 1: Write cross-organization permission tests**

```python
@pytest.mark.django_db
def test_operator_cannot_access_another_organization(api_client, memberships) -> None:
    client, own_org, other_org = memberships.operator_client()
    response = client.get(f"/api/v1/products?organization_id={other_org.id}")
    assert response.status_code in {200, 404}
    assert all(item["organization_id"] == str(own_org.id) for item in response.json().get("results", []))
```

Also test that READ_ONLY cannot POST and REVIEWER cannot manage credentials.

- [ ] **Step 2: Run the tests and verify they fail**

```powershell
python -m pytest apps/identity/tests -v
```

Expected: FAIL because identity models and permissions are absent.

- [ ] **Step 3: Implement membership context and permission classes**

Define service interfaces:

```python
def get_active_membership(*, user: User) -> Membership:
    return Membership.objects.select_related("organization", "role").get(
        user=user,
        status=Membership.Status.ACTIVE,
    )


def require_permission(*, membership: Membership, permission: str) -> None:
    if permission not in membership.role.permissions:
        raise PermissionDenied(f"Missing permission: {permission}")
```

Define DRF permission classes that use server-resolved membership and never trust request body organization IDs.

- [ ] **Step 4: Add seed command for the first organization and administrator**

Create an idempotent management command that reads `SEED_ADMIN_PASSWORD`, creates the initial organization, roles and administrator, and refuses the documented development password when `DEBUG=False`.

- [ ] **Step 5: Run migrations and identity tests**

```powershell
python manage.py migrate
python -m pytest apps/identity/tests -v
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add backend/apps/identity backend/config
git commit -m "feat: add organization-scoped roles and authentication"
```

---

### Task 4: Add Platform Registry, Capabilities, and Social Accounts

**Files:**
- Create: `backend/apps/platforms/models.py`
- Create: `backend/apps/platforms/capabilities.py`
- Create: `backend/apps/platforms/serializers.py`
- Create: `backend/apps/platforms/views.py`
- Create: `backend/apps/platforms/urls.py`
- Create: `backend/apps/platforms/migrations/0001_initial.py`
- Test: `backend/apps/platforms/tests/test_capability_resolution.py`
- Test: `backend/apps/platforms/tests/test_social_accounts_api.py`

**Interfaces:**
- Produces: `Platform`, `PlatformCapability`, `ConnectorCredential`, `SocialAccount`.
- Produces: `resolve_account_capabilities(account_id: UUID) -> set[AccountCapability]`.
- Produces: `GET /api/v1/platforms`, `GET/POST /api/v1/social-accounts`.
- Produces: publish modes `API_AUTO`, `API_CONFIRM`, `EXPORT_PACKAGE`, `MANUAL`.

- [ ] **Step 1: Write failing capability tests**

```python
def test_account_capabilities_are_intersection_of_platform_connector_and_scope():
    result = resolve_capabilities(
        platform={"PUBLISH", "METRICS_READ"},
        connector={"PUBLISH"},
        scopes={"PUBLISH"},
    )
    assert result == {"PUBLISH"}
```

Add an API test asserting credential secret references never appear in responses.

- [ ] **Step 2: Run tests and verify failure**

```powershell
python -m pytest apps/platforms/tests -v
```

- [ ] **Step 3: Implement models and capability resolver**

Use capability codes `PUBLISH`, `METRICS_READ`, `COMMENT_READ`, `PUBLIC_SEARCH`, `MEDIA_UPLOAD`, `WEBHOOK`. Store only `secret_reference`, scopes and expiry on ConnectorCredential.

- [ ] **Step 4: Seed platform definitions**

Seed LinkedIn, Facebook, Instagram, YouTube, TikTok, Douyin, Kuaishou, WeChat Official Account, WeChat Channels, Xiaohongshu and Bilibili with conservative capabilities. No platform is marked API-capable unless the mock or real connector implements it.

- [ ] **Step 5: Run tests and commit**

```powershell
python manage.py migrate
python -m pytest apps/platforms/tests -v
git add backend/apps/platforms
git commit -m "feat: model platform capabilities and social accounts"
```

---

### Task 5: Implement Product Knowledge Base APIs

**Files:**
- Create: `backend/apps/catalog/models.py`
- Create: `backend/apps/catalog/serializers.py`
- Create: `backend/apps/catalog/services.py`
- Create: `backend/apps/catalog/views.py`
- Create: `backend/apps/catalog/urls.py`
- Create: `backend/apps/catalog/migrations/0001_initial.py`
- Test: `backend/apps/catalog/tests/test_product_model.py`
- Test: `backend/apps/catalog/tests/test_products_api.py`

**Interfaces:**
- Produces: versioned `Product` model containing the approved structured gear fields.
- Produces: `GET/POST /api/v1/products`, `GET/PATCH /api/v1/products/{id}`.
- Produces: `ProductSnapshot` dictionary used by content generation.

- [ ] **Step 1: Write failing model and API tests**

Test product validation for module ranges, tooth-count ranges, required English name, organization isolation and optimistic version updates.

```python
def test_product_snapshot_contains_only_approved_fields(product):
    snapshot = build_product_snapshot(product)
    assert snapshot["name_en"] == product.name_en
    assert "organization_id" not in snapshot
    assert "internal_notes" not in snapshot
```

- [ ] **Step 2: Run tests and verify failure**

```powershell
python -m pytest apps/catalog/tests -v
```

- [ ] **Step 3: Implement the Product model and snapshot service**

Use explicit columns for frequently filtered fields and JSON only for flexible capability lists. Increment `version` on approved edits and reject stale `If-Match` versions with `409 PRODUCT_VERSION_CONFLICT`.

- [ ] **Step 4: Implement CRUD endpoints and filters**

Support filters for product type, material, application industry and status. All querysets begin with `request.organization`.

- [ ] **Step 5: Run tests and commit**

```powershell
python manage.py migrate
python -m pytest apps/catalog/tests -v
git add backend/apps/catalog
git commit -m "feat: add structured product knowledge base"
```

---

### Task 6: Implement Original Asset Storage and Product Links

**Files:**
- Create: `backend/apps/assets/models.py`
- Create: `backend/apps/assets/storage.py`
- Create: `backend/apps/assets/serializers.py`
- Create: `backend/apps/assets/services.py`
- Create: `backend/apps/assets/views.py`
- Create: `backend/apps/assets/urls.py`
- Create: `backend/integrations/storage/base.py`
- Create: `backend/integrations/storage/minio_storage.py`
- Create: `backend/integrations/storage/memory_storage.py`
- Test: `backend/apps/assets/tests/test_asset_upload.py`
- Test: `backend/apps/assets/tests/test_asset_immutability.py`

**Interfaces:**
- Produces: `MaterialAsset`, `AssetProductLink`, tag metadata and checksum deduplication.
- Produces: `ObjectStorage.put(stream, key)`, `open(key)`, `delete(key)`.
- Produces: `POST /api/v1/assets`, `GET /api/v1/assets`, `POST /api/v1/assets/{id}/link-product`.

- [ ] **Step 1: Write failing storage and immutability tests**

```python
def test_duplicate_upload_reuses_asset_within_organization(asset_service, org, file):
    first = asset_service.upload(org=org, file=file)
    second = asset_service.upload(org=org, file=file)
    assert first.id == second.id


def test_original_storage_key_cannot_be_replaced(asset_service, asset):
    with pytest.raises(OriginalAssetImmutable):
        asset_service.replace_original(asset, b"new bytes")
```

- [ ] **Step 2: Run tests and verify failure**

```powershell
python -m pytest apps/assets/tests -v
```

- [ ] **Step 3: Implement storage adapters and upload transaction**

Stream uploads while hashing, validate MIME type and maximum size on the server, store under `organizations/{organization_id}/assets/{asset_id}/original`, and delete a newly written object if the database transaction fails.

- [ ] **Step 4: Implement asset APIs and signed download**

Return metadata from list/detail endpoints. Signed download URLs expire after five minutes and are created only after organization permission checks.

- [ ] **Step 5: Run tests and commit**

```powershell
python manage.py migrate
python -m pytest apps/assets/tests -v
git add backend/apps/assets backend/integrations/storage
git commit -m "feat: add immutable product asset storage"
```

---

### Task 7: Add Campaign and ContentBrief Models

**Files:**
- Create: `backend/apps/campaigns/models.py`
- Create: `backend/apps/campaigns/serializers.py`
- Create: `backend/apps/campaigns/services.py`
- Create: `backend/apps/campaigns/views.py`
- Create: `backend/apps/campaigns/urls.py`
- Create: `backend/apps/campaigns/migrations/0001_initial.py`
- Test: `backend/apps/campaigns/tests/test_campaign_api.py`
- Test: `backend/apps/campaigns/tests/test_content_brief_validation.py`

**Interfaces:**
- Produces: `Campaign`, `CampaignProduct`, `ContentBrief`, `ContentBriefProduct`, `ContentBriefAsset`.
- Produces: `build_content_generation_input(brief_id: UUID) -> ContentGenerationInput`.
- Produces: `/api/v1/campaigns` and `/api/v1/content-briefs` CRUD endpoints.

- [ ] **Step 1: Write failing brief validation tests**

Require target country, customer type, content objective, CTA, landing page, language, at least one product and at least one target platform. Reject prohibited claims that duplicate an approved selling point.

```python
def test_generation_input_is_a_versioned_snapshot(content_brief):
    result = build_content_generation_input(content_brief.id)
    assert result.brief_version == content_brief.version
    assert result.products
    assert result.target_platforms
```

- [ ] **Step 2: Run tests and verify failure**

```powershell
python -m pytest apps/campaigns/tests -v
```

- [ ] **Step 3: Implement models, relationships, and versioned snapshot**

The snapshot must contain product facts, selected assets, target market, keywords, CTA, landing page, prohibited claims, selling points and advantages. It must not query live mutable data after the AI Job starts.

- [ ] **Step 4: Implement APIs and permissions**

Operators create and edit; Reviewers and Administrators can mark a brief `READY`. READ_ONLY can only view.

- [ ] **Step 5: Run tests and commit**

```powershell
python manage.py migrate
python -m pytest apps/campaigns/tests -v
git add backend/apps/campaigns
git commit -m "feat: add campaigns and content briefs"
```

---

### Task 8: Implement Unified Jobs, Prompt Versions, and Fake AI

**Files:**
- Create: `backend/apps/jobs/models.py`
- Create: `backend/apps/jobs/services.py`
- Create: `backend/apps/jobs/tasks.py`
- Create: `backend/apps/jobs/views.py`
- Create: `backend/apps/jobs/urls.py`
- Create: `backend/apps/ai/models.py`
- Create: `backend/apps/ai/orchestrator.py`
- Create: `backend/integrations/ai/base.py`
- Create: `backend/integrations/ai/fake.py`
- Test: `backend/apps/jobs/tests/test_job_lifecycle.py`
- Test: `backend/apps/ai/tests/test_fake_content_workflow.py`
- Test: `backend/apps/ai/tests/test_prompt_audit.py`

**Interfaces:**
- Produces: `Job`, `PromptVersion`, `AIRun`.
- Produces: `JobService.create`, `claim`, `progress`, `succeed`, `fail`, `retry`, `cancel`.
- Produces: `AIProvider.generate(*, prompt, schema) -> dict`.
- Produces: `GET /api/v1/jobs`, `GET /api/v1/jobs/{id}`, retry and cancel actions.

- [ ] **Step 1: Write failing Job transition tests**

```python
def test_failed_job_can_be_retried_with_same_input(job_service, failed_job):
    retried = job_service.retry(failed_job.id)
    assert retried.status == "RETRY_QUEUED"
    assert retried.input_reference == failed_job.input_reference
```

Also test invalid transitions, progress bounds, organization isolation and cancellation rules.

- [ ] **Step 2: Write failing AI audit tests**

Assert every successful AIRun records provider, model, PromptVersion, immutable input snapshot, validated output JSON, confidence and timestamps; assert secrets are removed from snapshots.

- [ ] **Step 3: Run tests and verify failure**

```powershell
python -m pytest apps/jobs/tests apps/ai/tests -v
```

- [ ] **Step 4: Implement Job service with atomic transitions**

Use `select_for_update(skip_locked=True)` when claiming queued work. Define status transition tables in one module; do not duplicate status logic in Celery tasks or views.

- [ ] **Step 5: Implement PromptVersion and deterministic Fake AI**

Fake AI output must derive from product name, target market, platform and CTA so tests can assert exact content. Validate all output against the PromptVersion JSON Schema before marking AIRun successful.

- [ ] **Step 6: Implement Job APIs**

Return:

```json
{
  "job_id": "uuid",
  "type": "CONTENT_GENERATE",
  "status": "RUNNING",
  "progress": 65,
  "created_at": "2026-08-08T10:00:00Z",
  "finished_at": null,
  "error": null,
  "result_reference": null
}
```

- [ ] **Step 7: Run tests and commit**

```powershell
python manage.py migrate
python -m pytest apps/jobs/tests apps/ai/tests -v
git add backend/apps/jobs backend/apps/ai backend/integrations/ai backend/config/celery.py
git commit -m "feat: add unified jobs and auditable AI orchestration"
```

---

### Task 9: Generate, Review, and Version Content

**Files:**
- Create: `backend/apps/content/models.py`
- Create: `backend/apps/content/services.py`
- Create: `backend/apps/content/tasks.py`
- Create: `backend/apps/content/serializers.py`
- Create: `backend/apps/content/views.py`
- Create: `backend/apps/content/urls.py`
- Create: `backend/apps/audit/models.py`
- Create: `backend/apps/audit/services.py`
- Test: `backend/apps/content/tests/test_generation_flow.py`
- Test: `backend/apps/content/tests/test_approval_rules.py`
- Test: `backend/apps/content/tests/test_version_history.py`
- Test: `backend/apps/audit/tests/test_approval_audit.py`

**Interfaces:**
- Produces: `MasterContent`, `PlatformContent`, `ApprovalRecord`.
- Produces: `POST /content-briefs/{id}/generate-master-content` returning `202 + job_id`.
- Produces: submit-review, approve, reject and archive actions.
- Produces: state machines from the approved V1.0 design.

- [ ] **Step 1: Write failing generation and approval tests**

```python
def test_unapproved_master_content_cannot_generate_platform_content(content_service, draft):
    with pytest.raises(ContentStateError):
        content_service.generate_platform_content(draft.id)


def test_approval_records_actor_and_version(content_service, reviewer, in_review):
    approved = content_service.approve(in_review.id, actor=reviewer)
    assert approved.status == "APPROVED"
    assert approved.approval_records.latest().object_version == approved.version
```

- [ ] **Step 2: Run tests and verify failure**

```powershell
python -m pytest apps/content/tests -v
```

- [ ] **Step 3: Implement models and transition services**

Keep transition maps in `services.py`. Human edits create a new version and never overwrite AIRun output. MasterContent does not use `PUBLISHED`; PlatformContent supports `PUBLISHED` and `ARCHIVED`.

- [ ] **Step 4: Implement async generation actions**

The API creates a Job and returns 202. The worker reads the frozen ContentGenerationInput, creates AIRun, validates Fake AI output, writes MasterContent or PlatformContent as `IN_REVIEW`, and attaches `result_reference`.

- [ ] **Step 5: Implement approval APIs and audit records**

Only Reviewer and Administrator approve. Reject actions require a non-empty comment. Archive retains all links and versions.

- [ ] **Step 6: Run tests and commit**

```powershell
python manage.py migrate
python -m pytest apps/content/tests apps/audit/tests -v
git add backend/apps/content backend/apps/audit
git commit -m "feat: add traceable content generation and approval"
```

---

### Task 10: Implement Mock Publishing and the Calendar API

**Files:**
- Create: `backend/apps/publishing/models.py`
- Create: `backend/apps/publishing/services.py`
- Create: `backend/apps/publishing/tasks.py`
- Create: `backend/apps/publishing/serializers.py`
- Create: `backend/apps/publishing/views.py`
- Create: `backend/apps/publishing/urls.py`
- Create: `backend/integrations/platforms/base.py`
- Create: `backend/integrations/platforms/mock.py`
- Test: `backend/apps/publishing/tests/test_publish_state_machine.py`
- Test: `backend/apps/publishing/tests/test_idempotent_publish.py`
- Test: `backend/apps/publishing/tests/test_partial_platform_failure.py`

**Interfaces:**
- Produces: `PublishTask`, `PublishedPost`.
- Produces: `PlatformConnector.publish(request) -> PublishResult`.
- Produces: `/api/v1/publish-tasks`, schedule/cancel actions, and `/api/v1/publish-calendar`.

- [ ] **Step 1: Write failing publish tests**

Test that unapproved content cannot schedule, duplicate Idempotency-Key returns the original task, cancelled tasks never call the connector, successful mock publish creates PublishedPost, and one failed platform does not change another task.

```python
def test_idempotent_publish_returns_same_task(publish_service, approved_content, account):
    first = publish_service.create(approved_content, account, key="same-key")
    second = publish_service.create(approved_content, account, key="same-key")
    assert first.id == second.id
```

- [ ] **Step 2: Run tests and verify failure**

```powershell
python -m pytest apps/publishing/tests -v
```

- [ ] **Step 3: Implement connector contract and deterministic mock**

The mock returns external IDs derived from PublishTask UUIDs. A test-only account flag can force rate-limit, token-expired or provider-error results.

- [ ] **Step 4: Implement state machine and Celery task**

Validate PlatformCapability, account status, approval status and schedule time before queueing. Persist each external attempt; do not retry token expiry automatically.

- [ ] **Step 5: Implement calendar and task APIs**

Calendar responses group tasks by local display date but retain UTC timestamps. Filters: platform, account, product, country, campaign and status.

- [ ] **Step 6: Run tests and commit**

```powershell
python manage.py migrate
python -m pytest apps/publishing/tests -v
git add backend/apps/publishing backend/integrations/platforms
git commit -m "feat: add safe mock publishing and calendar"
```

---

### Task 11: Implement UTM, Short Links, Click Events, and Analytics

**Files:**
- Create: `backend/apps/tracking/models.py`
- Create: `backend/apps/tracking/services.py`
- Create: `backend/apps/tracking/views.py`
- Create: `backend/apps/tracking/urls.py`
- Create: `backend/apps/tracking/privacy.py`
- Test: `backend/apps/tracking/tests/test_utm_generation.py`
- Test: `backend/apps/tracking/tests/test_short_redirect.py`
- Test: `backend/apps/tracking/tests/test_click_privacy.py`
- Test: `backend/apps/tracking/tests/test_analytics_api.py`

**Interfaces:**
- Produces: `TrackingLink`, `ShortLink`, `ClickEvent`.
- Produces: `/api/v1/tracking-links`, `/api/v1/short-links`, `/api/v1/analytics/channel-summary`.
- Produces: public `GET /r/{code}` redirect endpoint.

- [ ] **Step 1: Write failing UTM and redirect tests**

```python
def test_redirect_records_event_then_returns_302(client, short_link):
    response = client.get(f"/r/{short_link.code}", HTTP_USER_AGENT="Test Browser")
    assert response.status_code == 302
    assert response["Location"] == short_link.tracking_link.full_url
    assert ClickEvent.objects.filter(short_link=short_link).count() == 1
```

Test that raw IP and full user-agent are not stored.

- [ ] **Step 2: Run tests and verify failure**

```powershell
python -m pytest apps/tracking/tests -v
```

- [ ] **Step 3: Implement UTM and short-code services**

Normalize UTM values to lowercase slug form, preserve an immutable UTM snapshot, generate collision-resistant codes, and support an Idempotency-Key on creation.

- [ ] **Step 4: Implement privacy-safe click recording**

Store country from trusted edge headers when present, device class from coarse parsing, referrer host only, and a daily salted network hash. Never store raw IP or browser fingerprint.

- [ ] **Step 5: Implement aggregate analytics**

Return counts grouped by campaign, platform, country, product and date. Use database aggregation; do not send raw ClickEvent rows to the dashboard.

- [ ] **Step 6: Run tests and commit**

```powershell
python manage.py migrate
python -m pytest apps/tracking/tests -v
git add backend/apps/tracking
git commit -m "feat: add privacy-safe campaign attribution"
```

---

### Task 12: Create the Vue Application Shell and Authentication Flow

**Files:**
- Create: `frontend/src/main.ts`
- Create: `frontend/src/app/router.ts`
- Create: `frontend/src/app/queryClient.ts`
- Create: `frontend/src/app/AppShell.vue`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/modules/auth/LoginPage.vue`
- Create: `frontend/src/modules/dashboard/DashboardPage.vue`
- Create: `frontend/src/shared/components/NextStepPanel.vue`
- Create: `frontend/src/styles/tokens.css`
- Test: `frontend/src/app/AppShell.test.ts`
- Test: `frontend/src/modules/auth/LoginPage.test.ts`

**Interfaces:**
- Produces: authenticated module navigation matching the approved page map.
- Produces: API client that sends CSRF/session credentials and maps business errors to user messages.
- Produces: design token `--sg-brand: #005BA8`.

- [ ] **Step 1: Write failing shell tests**

```typescript
it('shows module navigation and the next-step panel', async () => {
  render(AppShell, { global: { plugins: [router] } })
  expect(screen.getByText('产品库')).toBeVisible()
  expect(screen.getByText('AI 内容工厂')).toBeVisible()
  expect(screen.getByText('下一步建议')).toBeVisible()
})
```

- [ ] **Step 2: Run tests and verify failure**

```powershell
pnpm --dir frontend test --run
```

- [ ] **Step 3: Implement tokens, shell, routes, and API client**

Use grouped left navigation, one primary action per page, white surfaces on a light gray background, and brand blue for active and primary states. API errors render `message` and `recovery_action` without exposing server stacks.

- [ ] **Step 4: Implement login and protected routing**

Load `/api/v1/auth/me` before protected routes. Redirect unauthenticated users to login and return them to the original route after success.

- [ ] **Step 5: Run tests and commit**

```powershell
pnpm --dir frontend test --run
pnpm --dir frontend lint
git add frontend
git commit -m "feat: add branded workbench shell and authentication"
```

---

### Task 13: Build Product, Asset, Campaign, and Brief Screens

**Files:**
- Create: `frontend/src/modules/products/ProductListPage.vue`
- Create: `frontend/src/modules/products/ProductEditorPage.vue`
- Create: `frontend/src/modules/assets/AssetLibraryPage.vue`
- Create: `frontend/src/modules/campaigns/CampaignListPage.vue`
- Create: `frontend/src/modules/campaigns/ContentBriefWizard.vue`
- Create: `frontend/src/modules/campaigns/api.ts`
- Test: `frontend/src/modules/campaigns/ContentBriefWizard.test.ts`
- Test: `frontend/src/modules/assets/AssetLibraryPage.test.ts`

**Interfaces:**
- Consumes: product, asset, campaign and brief APIs from Tasks 5–7.
- Produces: four-step wizard `市场与目标 → 产品与素材 → 内容策略 → 确认`.
- Produces: reusable product and asset selectors for content generation.

- [ ] **Step 1: Write failing wizard tests**

Test required-field guidance, back/forward retention, prohibited-claim display, product and asset selection, final confirmation, and server validation mapping.

- [ ] **Step 2: Run tests and verify failure**

```powershell
pnpm --dir frontend test --run ContentBriefWizard
```

- [ ] **Step 3: Implement list and editor screens**

Use tables for dense lists, drawers only for small edits, full pages for product and brief forms, explicit empty states, and visible completeness indicators.

- [ ] **Step 4: Implement asset upload and product linking**

Show checksum duplicates as an existing asset, preserve originals, and surface upload size/type failures with recovery guidance.

- [ ] **Step 5: Run tests and commit**

```powershell
pnpm --dir frontend test --run
pnpm --dir frontend lint
git add frontend/src/modules/products frontend/src/modules/assets frontend/src/modules/campaigns
git commit -m "feat: add product asset and campaign workflows"
```

---

### Task 14: Build Content Generation and Review Screens

**Files:**
- Create: `frontend/src/modules/content/ContentFactoryPage.vue`
- Create: `frontend/src/modules/content/MasterContentReviewPage.vue`
- Create: `frontend/src/modules/content/PlatformContentReviewPage.vue`
- Create: `frontend/src/shared/components/JobProgress.vue`
- Create: `frontend/src/shared/components/ApprovalTimeline.vue`
- Test: `frontend/src/modules/content/ContentFactoryPage.test.ts`
- Test: `frontend/src/shared/components/JobProgress.test.ts`

**Interfaces:**
- Consumes: generation actions, content APIs, approval APIs and `/jobs`.
- Produces: job polling with terminal states and safe retry.
- Produces: side-by-side AI original, human version and approval history.

- [ ] **Step 1: Write failing job and approval tests**

Test 202 handling, progress polling, failed job recovery copy, approval role restrictions, rejection comments and version history.

- [ ] **Step 2: Run tests and verify failure**

```powershell
pnpm --dir frontend test --run ContentFactoryPage JobProgress
```

- [ ] **Step 3: Implement content factory and job progress**

The primary flow is `选择 Brief → 生成母内容 → 审核 → 生成平台内容 → 逐平台审核`. Do not hide which Product, Asset, PromptVersion and AIRun produced the content.

- [ ] **Step 4: Implement review screens**

Reviewer actions require confirmation; reject requires a reason. Archive is available only after approval or publication and is visually distinct from delete.

- [ ] **Step 5: Run tests and commit**

```powershell
pnpm --dir frontend test --run
pnpm --dir frontend lint
git add frontend/src/modules/content frontend/src/shared/components
git commit -m "feat: add content generation and review workbench"
```

---

### Task 15: Build Publishing, Calendar, Tracking, and Dashboard Screens

**Files:**
- Create: `frontend/src/modules/publishing/PublishQueuePage.vue`
- Create: `frontend/src/modules/publishing/PublishCalendarPage.vue`
- Create: `frontend/src/modules/tracking/CampaignLinksPage.vue`
- Create: `frontend/src/modules/tracking/ChannelAnalyticsPage.vue`
- Modify: `frontend/src/modules/dashboard/DashboardPage.vue`
- Test: `frontend/src/modules/publishing/PublishQueuePage.test.ts`
- Test: `frontend/src/modules/tracking/ChannelAnalyticsPage.test.ts`

**Interfaces:**
- Consumes: PublishTask, PublishedPost, TrackingLink, ShortLink and aggregate analytics APIs.
- Produces: week/month calendar, queue filters, safe retry, UTM link builder and channel summary.

- [ ] **Step 1: Write failing queue and analytics tests**

Test partial-platform failure display, token-expired recovery, scheduled time conversion, disabled actions for insufficient capability, UTM preview and analytics empty states.

- [ ] **Step 2: Run tests and verify failure**

```powershell
pnpm --dir frontend test --run PublishQueuePage ChannelAnalyticsPage
```

- [ ] **Step 3: Implement publishing queue and calendar**

Show platform/account/content/campaign/scheduled time/status. Failed tasks display what was preserved and whether retry or reauthorization is allowed.

- [ ] **Step 4: Implement tracking and dashboard summaries**

Dashboard cards: pending reviews, this-week posts, independent-site visits, failed jobs. Next-step panel links directly to actionable filtered pages.

- [ ] **Step 5: Run tests and commit**

```powershell
pnpm --dir frontend test --run
pnpm --dir frontend lint
git add frontend/src/modules/publishing frontend/src/modules/tracking frontend/src/modules/dashboard
git commit -m "feat: add publishing calendar and attribution dashboard"
```

---

### Task 16: Complete OpenAPI Contracts and Cross-Layer Contract Tests

**Files:**
- Create: `backend/tests/test_openapi_contract.py`
- Create: `frontend/src/api/generated/.gitkeep`
- Create: `frontend/scripts/generate-api.ts`
- Modify: `frontend/package.json`
- Create: `docs/architecture.md`
- Test: `frontend/src/api/client.contract.test.ts`

**Interfaces:**
- Produces: checked-in generated TypeScript API types from `/api/v1/schema`.
- Produces: one command `pnpm api:generate` and one drift check `pnpm api:check`.

- [ ] **Step 1: Write failing schema coverage test**

Assert OpenAPI includes Products, Assets, Campaigns, ContentBriefs, MasterContents, PlatformContents, PublishTasks, TrackingLinks, ShortLinks, Jobs and Auth tags; assert all mutation errors share `code`, `message`, and `recovery_action`.

- [ ] **Step 2: Run test and verify failure**

```powershell
python -m pytest tests/test_openapi_contract.py -v
```

- [ ] **Step 3: Add schema annotations and generation script**

Generate types using a pinned OpenAPI TypeScript generator. The script fetches the local schema, writes deterministic output and fails drift checks when generated files change.

- [ ] **Step 4: Run backend and frontend contract checks**

```powershell
python -m pytest tests/test_openapi_contract.py -v
pnpm --dir frontend api:generate
pnpm --dir frontend api:check
pnpm --dir frontend test --run client.contract
```

Expected: all PASS and no generated diff after `api:check`.

- [ ] **Step 5: Commit**

```powershell
git add backend/tests frontend/src/api frontend/scripts frontend/package.json docs/architecture.md
git commit -m "test: enforce API contracts across backend and frontend"
```

---

### Task 17: Add Phase A End-to-End Acceptance

**Files:**
- Create: `frontend/e2e/phase-a-active-growth.spec.ts`
- Create: `backend/apps/identity/management/commands/seed_phase_a.py`
- Create: `backend/tests/test_phase_a_seed.py`
- Create: `docs/phase-a-acceptance.md`
- Modify: `README.md`
- Modify: `frontend/playwright.config.ts`

**Interfaces:**
- Produces: deterministic seed with one organization, four roles, gear product, factory video, campaign, ContentBrief, mock accounts and prompt versions.
- Produces: `pnpm test:e2e` that starts isolated services and never uses normal development data.

- [ ] **Step 1: Write the failing seed test**

```python
@pytest.mark.django_db
def test_phase_a_seed_is_idempotent(call_command):
    call_command("seed_phase_a")
    call_command("seed_phase_a")
    assert Organization.objects.count() == 1
    assert Product.objects.filter(name_en="Custom Helical Gear").count() == 1
```

- [ ] **Step 2: Write the failing Playwright scenario**

The test must:

1. Log in as Operator.
2. Open the seeded product and original video.
3. Create a Campaign and ContentBrief for Germany packaging machinery.
4. Generate MasterContent and wait through `/jobs`.
5. Log in as Reviewer and approve it.
6. Generate and approve five PlatformContent records.
7. Schedule and run Mock Platform publishing.
8. Create a TrackingLink and ShortLink.
9. Visit the short URL and verify 302.
10. Open analytics and verify the visit is attributed to the Campaign and platform.

- [ ] **Step 3: Run tests and verify failure**

```powershell
python -m pytest tests/test_phase_a_seed.py -v
pnpm --dir frontend test:e2e
```

- [ ] **Step 4: Implement deterministic seed and isolated E2E environment**

Use a dedicated database and object-storage bucket. The E2E cleanup may delete only paths and databases explicitly named for E2E; it must never delete the normal development database or bucket.

- [ ] **Step 5: Document operator acceptance steps**

`docs/phase-a-acceptance.md` must describe the same closed loop, expected statuses, recovery checks for one forced publishing failure, and the evidence needed for sign-off.

- [ ] **Step 6: Run the complete verification suite**

```powershell
cd backend
python -m pytest -v
python -m ruff check .
python manage.py spectacular --validate --file schema.yml
cd ..\frontend
pnpm test --run
pnpm lint
pnpm build
pnpm test:e2e
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

```powershell
git add backend frontend docs README.md
git commit -m "test: verify Phase A active growth closed loop"
```

---

## Phase A Completion Gate

Phase A is complete only when all conditions are true:

- The new project is independent from `app/platform` and has its own Git history.
- Organization-scoped API tests prove cross-organization isolation.
- Products, original assets, Campaigns and ContentBriefs are usable through API and UI.
- Fake AI creates traceable MasterContent and PlatformContent with PromptVersion and AIRun.
- Reviewer approval is required before scheduling or publishing.
- Mock Platform publishing is idempotent and handles partial failure.
- UTM, short redirect, ClickEvent and aggregate analytics are linked correctly.
- `/jobs` is the only frontend-facing async status resource.
- OpenAPI and generated frontend types have no drift.
- Backend tests, frontend tests, lint, build and Playwright E2E all pass.
- A new operator can complete the active-growth closed loop using the documented acceptance guide.

After this gate, write and review the separate Phase B implementation plan for the passive-growth lead radar before changing Phase B code.
