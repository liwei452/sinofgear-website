import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError, apiRequest } from '../api/client'

interface FileItem {
  id: string
  filename: string
  version: number
  size: number
  uploadedAt: string
  uploaderName: string
  extractionStatus: string
  aiExtractionEligible: boolean
}

interface FileListResponse {
  items: FileItem[]
  membershipRole?: 'ADMIN' | 'MEMBER' | 'VIEWER'
}

const maximumUploadFileSize = 200 * 1024 * 1024

function formatSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function uploadErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return ({
      UNSUPPORTED_FILE_TYPE: '不支持这种文件格式，请上传 PDF、Word、Excel、文本或常见图片。',
      FILE_TOO_LARGE: '文件超过 200 MB，请压缩或拆分后重试。',
      DUPLICATE_FILE: '这份资料已经上传过，无需重复提交。',
    } as Record<string, string>)[error.body.code] ?? error.body.message
  }
  return '网络连接失败，文件尚未上传，请稍后重试。'
}

export function ProjectFilesPage() {
  const { projectId = '' } = useParams()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState('')
  const files = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: () => apiRequest<FileListResponse>(`/projects/${projectId}/files`),
    enabled: Boolean(projectId),
    refetchInterval: (query) => query.state.data?.items.some(
      (item) => item.extractionStatus === '等待提取' || item.extractionStatus === '正在提取',
    ) ? 1500 : false,
  })
  const upload = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return apiRequest<FileItem>(`/projects/${projectId}/files`, { method: 'POST', body: form })
    },
    onSuccess: async () => {
      setLocalError('')
      if (inputRef.current) inputRef.current.value = ''
      await queryClient.invalidateQueries({ queryKey: ['project-files', projectId] })
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
  const extract = useMutation({
    mutationFn: (fileId: string) => apiRequest<{ taskId: string; status: string }>(
      `/projects/${projectId}/files/${fileId}/extractions`,
      { method: 'POST' },
    ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-files', projectId] })
    },
  })

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')
    const file = inputRef.current?.files?.[0]
    if (!file) return setLocalError('请先选择一份工厂资料。')
    if (file.size > maximumUploadFileSize) return setLocalError('文件超过 200 MB，请压缩或拆分后重试。')
    upload.mutate(file)
  }

  async function download(fileId: string) {
    const result = await apiRequest<{ url: string }>(`/projects/${projectId}/files/${fileId}/download`)
    window.location.assign(result.url)
  }

  if (files.isPending) return <div className="center-state" role="status">正在加载资料库…</div>
  if (files.isError) return <div className="error-panel" role="alert">资料库加载失败，请刷新重试。</div>

  const canUpload = files.data.membershipRole !== 'VIEWER'
  const errorMessage = localError || (upload.isError ? uploadErrorMessage(upload.error) : '')

  return (
    <main>
      <div className="page-heading">
        <div>
          <span className="eyebrow">FACTORY SOURCE LIBRARY</span>
          <h1>资料与能力画像</h1>
          <p>原始资料按项目隔离保存，每次更新都会形成不可覆盖的新版本。</p>
        </div>
        <div className="heading-actions"><Link className="text-link" to={`/projects/${projectId}`}>项目概览</Link><Link className="text-link" to={`/projects/${projectId}/capabilities`}>审核能力画像</Link><Link className="text-link" to={`/projects/${projectId}/markets`}>选品与市场</Link></div>
      </div>

      {canUpload && (
        <section className="panel upload-panel" aria-labelledby="upload-heading">
          <div>
            <span className="panel-label">SOURCE INTAKE</span>
            <h2 id="upload-heading">上传工厂资料</h2>
            <p>支持 PDF、Word、Excel、CSV、文本和常见图片。单个文件最多 200 MB；小于 50 MB 可直接 AI 提取，较大的文件请先拆分或压缩。</p>
          </div>
          <form onSubmit={submitUpload}>
            <label htmlFor="factory-file">选择文件</label>
            <input
              ref={inputRef}
              id="factory-file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.csv,.xls,.xlsx,.txt,.md,.jpg,.jpeg,.png,.webp"
            />
            <button className="primary-button inline" type="submit" disabled={upload.isPending}>
              {upload.isPending ? '正在上传…' : '上传资料'}
            </button>
          </form>
          {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
          {extract.isError && <p className="form-error" role="alert">AI 提取任务启动失败，请稍后重试。</p>}
        </section>
      )}

      <section className="file-library" aria-labelledby="file-library-heading">
        <div className="section-title-row">
          <div>
            <span className="panel-label">VERSION HISTORY</span>
            <h2 id="file-library-heading">资料版本</h2>
          </div>
          <span>{files.data.items.length} 个版本</span>
        </div>
        {files.data.items.length === 0 ? (
          <div className="empty-panel">还没有资料。上传第一份产品目录、参数表或工厂介绍开始建立能力画像。</div>
        ) : (
          <div className="file-table-wrap">
            <table className="file-table">
              <thead><tr><th>文件</th><th>版本</th><th>大小</th><th>上传人</th><th>上传时间</th><th>AI 状态</th><th><span className="visually-hidden">操作</span></th></tr></thead>
              <tbody>
                {files.data.items.map((file) => (
                  <tr key={file.id}>
                    <td><strong>{file.filename}</strong></td>
                    <td>版本 {file.version}</td>
                    <td>{formatSize(file.size)}</td>
                    <td>{file.uploaderName}</td>
                    <td>{new Date(file.uploadedAt).toLocaleString('zh-CN')}</td>
                    <td><span className="status-pill">{file.aiExtractionEligible ? file.extractionStatus : '需拆分后提取'}</span></td>
                    <td className="table-actions">
                      {canUpload && file.aiExtractionEligible && (file.extractionStatus === '待提取' || file.extractionStatus === '提取失败') && (
                        <button
                          className="table-action"
                          type="button"
                          disabled={extract.isPending && extract.variables === file.id}
                          onClick={() => extract.mutate(file.id)}
                        >
                          {file.extractionStatus === '提取失败' ? '重新提取' : '开始 AI 提取'}
                        </button>
                      )}
                      <button className="table-action" type="button" onClick={() => void download(file.id)}>下载</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
