import { describe,expect,it } from 'vitest'
import { buildApp } from '../app.js'
import { openDatabase } from '../db/database.js'
import { runMigrations } from '../db/migrations.js'
import { SqliteProjectRepository } from './projects.js'
import { SqliteAuditRepository } from './audit.js'
import type { AuthService } from './auth.js'

describe('audit route',()=>{it('prevents viewers from reading internal audit history',async()=>{const db=openDatabase(':memory:');runMigrations(db);const now='2026-07-21T00:00:00.000Z';db.prepare(`INSERT INTO users VALUES ('viewer','v@example.com','只读','hash','MEMBER',?,?)`).run(now,now);db.prepare(`INSERT INTO factory_projects VALUES ('p1','工厂','工厂','联系人','c@example.com','STARTING','[]','PROFILE',?,?)`).run(now,now);db.prepare(`INSERT INTO project_memberships VALUES ('m1','p1','viewer','VIEWER',?)`).run(now);const auth:AuthService={async login(){return null},async getUserByRawToken(t){return t==='viewer'?{id:'viewer',email:'v@example.com',displayName:'只读',systemRole:'MEMBER'}:null},async logout(){}};const app=await buildApp({authService:auth,projectRepository:new SqliteProjectRepository(db),auditRepository:new SqliteAuditRepository(db)});const response=await app.inject({method:'GET',url:'/projects/p1/audit',headers:{cookie:'workbench_session=viewer'}});expect(response.statusCode).toBe(403);await app.close();db.close()})})
