import type { FastifyInstance,FastifyReply,FastifyRequest } from 'fastify'
import { sessionCookieName } from '../auth/session.js'
import type { AppDatabase } from '../db/database.js'
import type { AuthService } from './auth.js'
import type { ProjectRepository } from './projects.js'

export class SqliteAuditRepository{constructor(private readonly db:AppDatabase){}async list(projectId:string){return this.db.prepare(`SELECT e.id,e.action,e.entity_type AS entityType,e.entity_id AS entityId,e.changed_fields_json AS changedFieldsJson,e.created_at AS createdAt,u.display_name AS actorName FROM audit_events e JOIN users u ON u.id=e.actor_id WHERE e.project_id=? ORDER BY e.created_at DESC`).all(projectId).map(row=>{const r=row as Record<string,unknown>;return{...r,changedFields:JSON.parse(r.changedFieldsJson as string),changedFieldsJson:undefined}})}}
async function actor(req:FastifyRequest,reply:FastifyReply,auth:AuthService){const token=req.cookies[sessionCookieName];const user=token?await auth.getUserByRawToken(token):null;if(!user){reply.code(401).send({code:'UNAUTHENTICATED',message:'请先登录'});return null}return user}
export async function registerAuditRoutes(app:FastifyInstance,auth:AuthService,projects:ProjectRepository,audit:SqliteAuditRepository){app.get<{Params:{projectId:string}}>('/projects/:projectId/audit',async(req,reply)=>{const user=await actor(req,reply,auth);if(!user)return;const project=await projects.getForUser(req.params.projectId,user);if(!project)return reply.code(404).send({code:'PROJECT_NOT_FOUND',message:'项目不存在'});if(project.membershipRole==='VIEWER')return reply.code(403).send({code:'FORBIDDEN',message:'只读成员不能查看内部审计记录'});return{items:await audit.list(project.id)}})}
