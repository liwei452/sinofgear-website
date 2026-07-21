import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { ProjectFilesPage, uploadErrorMessage } from './ProjectFilesPage'

afterEach(() => vi.unstubAllGlobals())

describe('ProjectFilesPage', () => {
  it('shows file versions, uploader and extraction status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      items: [{
        id: 'file-1', filename: 'gear-catalog.pdf', version: 2, size: 2048,
        uploadedAt: '2026-07-21T00:00:00.000Z', uploaderName: '项目成员',
        extractionStatus: '待提取',
      }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/projects/project-1/files']}>
          <Routes><Route path="/projects/:projectId/files" element={<ProjectFilesPage />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByText('gear-catalog.pdf')).toBeInTheDocument()
    expect(screen.getByText('版本 2')).toBeInTheDocument()
    expect(screen.getByText('项目成员')).toBeInTheDocument()
    expect(screen.getByText('待提取')).toBeInTheDocument()
  })

  it.each([
    ['UNSUPPORTED_FILE_TYPE', '不支持这种文件格式'],
    ['FILE_TOO_LARGE', '文件超过 50 MB'],
    ['DUPLICATE_FILE', '这份资料已经上传过'],
  ])('explains the %s upload failure in Chinese', (code, message) => {
    expect(uploadErrorMessage(new ApiError(400, { code, message: 'fallback' }))).toContain(message)
  })

  it('keeps a network failure retryable', () => {
    expect(uploadErrorMessage(new TypeError('offline'))).toContain('文件尚未上传')
  })
})
