import { render, screen } from '@testing-library/react'
import { QueryClient,QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { afterEach,describe, expect, it,vi } from 'vitest'
import { DashboardPage } from './DashboardPage'

afterEach(()=>vi.unstubAllGlobals())

describe('DashboardPage', () => {
  it('names the internal workbench', async () => {
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({items:[{id:'p1',name:'SINOFORM 齿轮工厂',nextAction:'上传首份产品资料',completeness:25,pendingCapabilities:0,failedTaskCount:0}]}),{status:200,headers:{'Content-Type':'application/json'}})))
    render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter><DashboardPage /></MemoryRouter></QueryClientProvider>)
    expect(screen.getByRole('heading', { name: 'AI 外贸精准获客工作台' })).toBeInTheDocument()
    expect(await screen.findByText('1 个工厂项目')).toBeInTheDocument()
  })
})
