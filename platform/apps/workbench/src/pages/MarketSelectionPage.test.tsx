import { QueryClient,QueryClientProvider } from '@tanstack/react-query'
import { render,screen } from '@testing-library/react'
import { MemoryRouter,Route,Routes } from 'react-router'
import { afterEach,describe,expect,it,vi } from 'vitest'
import { MarketSelectionPage } from './MarketSelectionPage'
afterEach(()=>vi.unstubAllGlobals())
describe('MarketSelectionPage',()=>{it('labels unsupported market claims and blocks premature selection',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({items:[{id:'c1',productFocus:'工业齿轮',region:'德国',customerType:'包装设备制造商',rationale:'能力匹配',capabilities:[{id:'cap1',name:'斜齿轮'}],uncertainties:['采购频率未知'],interviewQuestions:['常用模数？'],scores:{capabilityFit:4,evidenceStrength:2,discoverability:3,deliveryConfidence:3,technicalRisk:2},verificationStatus:'UNVERIFIED',evidence:[]}],membershipRole:'MEMBER',decision:null}),{status:200,headers:{'Content-Type':'application/json'}})));render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter initialEntries={['/projects/project-1/markets']}><Routes><Route path="/projects/:projectId/markets" element={<MarketSelectionPage/>}/></Routes></MemoryRouter></QueryClientProvider>);expect(await screen.findByText('市场需求：尚未验证')).toBeInTheDocument();expect(screen.getByRole('button',{name:'设为主验证方向'})).toBeDisabled()})})
