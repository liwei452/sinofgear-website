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
}

export function ProjectOverviewPage() {
  const { projectId = '' } = useParams()
  const project = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiRequest<ProjectDetails>(`/projects/${projectId}`),
    enabled: Boolean(projectId),
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
          <Link className="primary-button inline" to={`/projects/${projectId}/files`}>进入资料采集</Link>
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
    </main>
  )
}
