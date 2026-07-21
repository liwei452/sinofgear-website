import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { apiRequest } from '../api/client'
import { EvidenceLink } from '../components/EvidenceLink'

type ReviewStatus = 'CONFIRMED' | 'NEEDS_EVIDENCE' | 'INTERNAL_ONLY' | 'REJECTED'
interface CapabilityItem {
  id: string; name: string; value: string; confidence: number; reviewStatus: string
  evidenceQuote: string; sourceLocator: string; sourceFilename: string
  history: Array<{ id: string; status: string; reason: string; reviewerName: string; reviewedAt: string }>
}
interface CapabilityResponse { groups: Array<{ category: string; items: CapabilityItem[] }>; membershipRole: 'ADMIN' | 'MEMBER' | 'VIEWER' }

const categoryNames: Record<string, string> = { PRODUCT: '产品', MATERIAL: '材料', PROCESS: '工艺', DIMENSION: '尺寸', PRECISION: '精度', APPLICATION: '应用', DELIVERY: '交付', QUALITY: '质量', OTHER: '其他' }
const statusNames: Record<string, string> = { PENDING_REVIEW: '待审核', CONFIRMED: '已确认', NEEDS_EVIDENCE: '待补证据', INTERNAL_ONLY: '仅内部', REJECTED: '已驳回' }

export function CapabilityReviewPage() {
  const { projectId = '' } = useParams()
  const client = useQueryClient()
  const [reviewing, setReviewing] = useState<{ id: string; status: ReviewStatus } | null>(null)
  const [reason, setReason] = useState('')
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const capabilities = useQuery({ queryKey: ['capabilities', projectId], queryFn: () => apiRequest<CapabilityResponse>(`/projects/${projectId}/capabilities`) })
  const questions = useQuery({ queryKey: ['interview-questions', projectId], queryFn: () => apiRequest<{ items: string[] }>(`/projects/${projectId}/interview-questions`) })
  const review = useMutation({
    mutationFn: (input: { id: string; status: ReviewStatus; reason: string }) => apiRequest(`/projects/${projectId}/capabilities/${input.id}/review`, { method: 'PATCH', body: JSON.stringify({ status: input.status, reason: input.reason }) }),
    onSuccess: async (_, input) => {
      setReviewing(null); setReason('')
      await client.invalidateQueries({ queryKey: ['capabilities', projectId] })
      const pending = capabilities.data?.groups.flatMap((group) => group.items).find((item) => item.reviewStatus === 'PENDING_REVIEW' && item.id !== input.id)
      if (pending) requestAnimationFrame(() => buttons.current.get(pending.id)?.focus())
    },
  })
  function submit(event: FormEvent) {
    event.preventDefault(); if (reviewing) review.mutate({ ...reviewing, reason })
  }
  if (capabilities.isPending) return <div className="center-state" role="status">正在加载能力画像…</div>
  if (capabilities.isError) return <div className="error-panel" role="alert">能力画像加载失败。</div>
  const canReview = capabilities.data.membershipRole !== 'VIEWER'
  return <main>
    <div className="page-heading"><div><span className="eyebrow">HUMAN REVIEW GATE</span><h1>能力画像审核</h1><p>逐条核实 AI 提取结果。只有“已确认”能力可用于后续选品与市场分析。</p></div><Link className="text-link" to={`/projects/${projectId}/files`}>返回资料库</Link></div>
    {questions.data?.items?.length ? <section className="panel interview-panel"><span className="panel-label">FACTORY INTERVIEW</span><h2>待访谈问题</h2><ol>{questions.data.items.map((question) => <li key={question}>{question}</li>)}</ol></section> : null}
    {capabilities.data.groups.length === 0 ? <div className="empty-panel">还没有待审核能力，请先在资料库启动 AI 提取。</div> : capabilities.data.groups.map((group) => <section className="capability-group" key={group.category}><div className="section-title-row"><h2>{categoryNames[group.category] ?? group.category}</h2><span>{group.items.length} 条</span></div><div className="capability-list">{group.items.map((item) => <article className="panel capability-card" key={item.id}><div className="capability-summary"><div><span className="status-pill">{statusNames[item.reviewStatus] ?? item.reviewStatus}</span><h3>{item.name}</h3><p>{item.value}</p></div><strong className="confidence">{Math.round(item.confidence * 100)}%<small>AI 置信度</small></strong></div><EvidenceLink filename={item.sourceFilename} locator={item.sourceLocator} quote={item.evidenceQuote} />{item.history.length > 0 && <details className="review-history"><summary>审核记录（{item.history.length}）</summary>{item.history.map((entry) => <p key={entry.id}><strong>{entry.reviewerName}</strong> · {statusNames[entry.status] ?? entry.status}<br />{entry.reason}</p>)}</details>}{canReview && item.reviewStatus === 'PENDING_REVIEW' && <div className="review-actions"><button ref={(element) => { if (element) buttons.current.set(item.id, element) }} className="primary-button inline" type="button" onClick={() => setReviewing({ id: item.id, status: 'CONFIRMED' })}>确认能力</button><button className="secondary-button" type="button" onClick={() => setReviewing({ id: item.id, status: 'NEEDS_EVIDENCE' })}>需要补证据</button><button className="secondary-button" type="button" onClick={() => setReviewing({ id: item.id, status: 'INTERNAL_ONLY' })}>仅内部使用</button><button className="secondary-button danger" type="button" onClick={() => setReviewing({ id: item.id, status: 'REJECTED' })}>驳回</button></div>}{reviewing?.id === item.id && <form className="review-form" onSubmit={submit}><label htmlFor={`reason-${item.id}`}>{reviewing.status === 'CONFIRMED' ? '确认依据' : '审核依据'}</label><textarea id={`reason-${item.id}`} required value={reason} onChange={(event) => setReason(event.target.value)} /><div><button className="primary-button inline" disabled={review.isPending}>保存审核</button><button className="secondary-button" type="button" onClick={() => setReviewing(null)}>取消</button></div></form>}</article>)}</div></section>)}
  </main>
}
