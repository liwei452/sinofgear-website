import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { apiRequest } from '../api/client'

interface ProjectSummary {
  id: string
  name: string
  stage: string
  completeness: number
  nextAction: string
  updatedAt: string
  membershipRole: 'ADMIN' | 'MEMBER' | 'VIEWER'
}

const stageLabels: Record<string, string> = {
  PROFILE: '资料采集',
  CAPABILITY_REVIEW: '能力审核',
  MARKET_SELECTION: '市场选择',
  COMPLETE: '阶段完成',
}

export function ProjectListPage() {
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiRequest<{ items: ProjectSummary[] }>('/projects'),
  })

  return (
    <main>
      <div className="page-heading">
        <div>
          <span className="eyebrow">FACTORY PORTFOLIO</span>
          <h1>工厂项目</h1>
          <p>集中查看每个共创项目的资料完整度、当前阶段和下一步动作。</p>
        </div>
      </div>

      {projects.isPending && <div className="center-state" role="status">正在加载工厂项目…</div>}
      {projects.isError && <div className="error-panel" role="alert">项目加载失败，请刷新重试。</div>}
      {projects.data?.items.length === 0 && <div className="empty-panel">还没有工厂项目。</div>}

      <div className="project-grid">
        {projects.data?.items.map((project) => (
          <article className="project-card" key={project.id}>
            <div className="project-card-topline">
              <span className="status-pill">{stageLabels[project.stage] ?? project.stage}</span>
              <span className="role-label">{project.membershipRole}</span>
            </div>
            <h2><Link to={`/projects/${project.id}`}>{project.name}</Link></h2>
            <div className="progress-row">
              <div className="progress-track" aria-label={`资料完整度 ${project.completeness}%`}>
                <span style={{ width: `${project.completeness}%` }} />
              </div>
              <strong>{project.completeness}%</strong>
            </div>
            <div className="next-action">
              <span>下一步</span>
              <p>{project.nextAction}</p>
            </div>
            <Link className="text-link" to={`/projects/${project.id}`}>进入项目 →</Link>
          </article>
        ))}
      </div>
    </main>
  )
}

export type { ProjectSummary }
