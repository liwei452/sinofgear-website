import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { apiRequest } from '../api/client'
import type { ProjectSummary } from './ProjectListPage'

interface ProjectDetails extends ProjectSummary {
  legalName: string
  primaryContactName: string
  primaryContactEmail: string
  exportStage: string
  existingAcquisitionChannels: string[]
  fileCount: number
  failedTaskCount: number
  extractionPendingCount: number
  pendingCapabilities: number
  insufficientEvidenceCount: number
  primaryMarketCount: number
  selectedDirection: string | null
}

export function ProjectOverviewPage() {
  const { projectId = '' } = useParams()
  const project = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiRequest<ProjectDetails>(`/projects/${projectId}`),
    enabled: Boolean(projectId),
  })
  const audit = useQuery({
    queryKey: ['audit', projectId],
    queryFn: () => apiRequest<{ items: Array<{ id: string; action: string; entityType: string; actorName: string; createdAt: string }> }>(`/projects/${projectId}/audit`),
    enabled: project.data?.membershipRole !== 'VIEWER' && Boolean(project.data),
  })

  if (project.isPending) return <div className="center-state" role="status">正在加载项目…</div>
  if (project.isError) return <div className="error-panel" role="alert">项目加载失败。</div>

  return (
    <main>
      <div className="page-heading">
        <div>
          <span className="eyebrow">FACTORY PROJECT</span>
          <h1>{project.data.name}</h1>
          <p>{project.data.legalName}</p>
        </div>
        <div className="completion-badge"><strong>{project.data.completeness}%</strong><span>阶段完成度</span></div>
      </div>
      <section className="overview-grid">
        <article className="panel">
          <span className="panel-label">当前重点</span>
          <h2>{project.data.nextAction}</h2>
          <Link className="primary-button inline" to={`/projects/${projectId}/files`}>资料与能力画像</Link>
          {' '}<Link className="secondary-button" to={`/projects/${projectId}/capabilities`}>审核能力画像</Link>
          {' '}<Link className="secondary-button" to={`/projects/${projectId}/markets`}>选品与市场</Link>
        </article>
        <article className="panel facts-panel">
          <span className="panel-label">项目档案</span>
          <dl>
            <div><dt>联系人</dt><dd>{project.data.primaryContactName}</dd></div>
            <div><dt>邮箱</dt><dd>{project.data.primaryContactEmail}</dd></div>
            <div><dt>外贸阶段</dt><dd>{project.data.exportStage}</dd></div>
          </dl>
        </article>
      </section>
      <section className="metric-grid project-metrics">
        <article><strong>{project.data.fileCount ?? 0}</strong><span>资料版本</span></article>
        <article><strong>{project.data.pendingCapabilities ?? 0}</strong><span>待审核能力</span></article>
        <article><strong>{project.data.insufficientEvidenceCount ?? 0}</strong><span>待补证据方向</span></article>
        <article><strong>{project.data.failedTaskCount ?? 0}</strong><span>失败任务</span></article>
      </section>
      {project.data.selectedDirection && <section className="decision-banner"><strong>主验证方向</strong><span>{project.data.selectedDirection}</span></section>}
      {project.data.membershipRole !== 'VIEWER' && <section className="audit-section"><div className="section-title-row"><div><span className="panel-label">AUDIT TRAIL</span><h2>项目操作记录</h2></div></div>{audit.isPending?<p>正在加载…</p>:audit.data?.items.length?<div className="audit-list">{audit.data.items.slice(0,8).map(event=><div key={event.id}><span>{event.actorName}</span><strong>{event.action} · {event.entityType}</strong><time>{new Date(event.createdAt).toLocaleString('zh-CN')}</time></div>)}</div>:<div className="empty-panel">暂无关键操作记录。</div>}</section>}
    </main>
  )
}
