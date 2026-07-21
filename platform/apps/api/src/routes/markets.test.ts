import { describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import { openDatabase } from '../db/database.js'
import { runMigrations } from '../db/migrations.js'
import { SqliteProjectRepository } from './projects.js'
import { SqliteMarketRepository, generateMarkets } from './markets.js'
import type { AuthService } from './auth.js'
import type { MarketGenerator, MarketGeneratorInput } from '../ai/marketGenerator.js'

class FakeMarketGenerator implements MarketGenerator {
  lastInput: MarketGeneratorInput | null = null
  async generate(input: MarketGeneratorInput) { this.lastInput = input; return { candidates: [1,2,3].map((n) => ({ productFocus: `工业齿轮 ${n}`, region: '德国', customerType: '包装设备制造商', rationale: '与已确认能力匹配，市场需求仍需验证', capabilityIds: [input.capabilities[0]!.id], uncertainties: ['采购频率未知'], interviewQuestions: ['常用模数？'], scores: { capabilityFit: 4, evidenceStrength: 2, discoverability: 3, deliveryConfidence: 3, technicalRisk: 2 } })) } }
}

function fixture() {
  const db=openDatabase(':memory:'); runMigrations(db); const now='2026-07-21T00:00:00.000Z'
  db.prepare(`INSERT INTO users VALUES ('member','member@example.com','项目成员','hash','MEMBER',?,?)`).run(now,now)
  db.prepare(`INSERT INTO factory_projects VALUES ('project-1','SINOFORM','SINOFORM','联系人','c@example.com','STARTING','[]','PROFILE',?,?)`).run(now,now)
  db.prepare(`INSERT INTO project_memberships VALUES ('m1','project-1','member','MEMBER',?)`).run(now)
  db.prepare(`INSERT INTO file_assets VALUES ('file-1','project-1','c.pdf','c.pdf',1,'key','application/pdf',1,'sum','UPLOADED','member',?)`).run(now)
  for(const [id,status] of [['confirmed','CONFIRMED'],['pending','PENDING_REVIEW']]) db.prepare(`INSERT INTO capabilities (id,project_id,source_file_id,revision,category,name,value,evidence_quote,source_locator,confidence,review_status,created_at,updated_at) VALUES (?,'project-1','file-1',1,'PRODUCT',?,'按图加工','quote','p1',.9,?,?,?)`).run(id,id,status,now,now)
  const auth:AuthService={async login(){return null},async getUserByRawToken(t){return t==='member'?{id:'member',email:'member@example.com',displayName:'项目成员',systemRole:'MEMBER'}:null},async logout(){}}
  return {db,now,auth}
}

describe('market selection',()=>{
  it('sends only confirmed capabilities to the generator',async()=>{const {db}=fixture();const generator=new FakeMarketGenerator();const repo=new SqliteMarketRepository(db);await generateMarkets('project-1',{repository:repo,generator,model:'fake'});expect(generator.lastInput?.capabilities.map(x=>x.id)).toEqual(['confirmed']);expect((await repo.list('project-1')).items).toHaveLength(3);db.close()})
  it('rejects a primary decision without evidence',async()=>{const {db,auth}=fixture();const repo=new SqliteMarketRepository(db);const generator=new FakeMarketGenerator();await generateMarkets('project-1',{repository:repo,generator,model:'fake'});const candidate=(await repo.list('project-1')).items[0]!;const app=await buildApp({authService:auth,projectRepository:new SqliteProjectRepository(db),marketRepository:repo,marketGenerator:generator});const response=await app.inject({method:'POST',url:'/projects/project-1/market-decisions',headers:{cookie:'workbench_session=member'},payload:{primaryCandidateId:candidate.id,backupCandidateId:null,reason:'优先测试'}});expect(response.statusCode).toBe(422);expect(response.json().code).toBe('MARKET_EVIDENCE_REQUIRED');await app.close();db.close()})
})
