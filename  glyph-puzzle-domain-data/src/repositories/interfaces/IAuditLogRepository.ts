import { IBaseRepository } from './IBaseRepository';
import { AuditLogDocument, AuditLogModel } from '../../domain/audit/AuditLog.schema';

export interface IAuditLogRepository extends IBaseRepository<AuditLogDocument, AuditLogModel> {
  findByEventCategory(category: string, limit: number, skip: number): Promise<AuditLogDocument[]>;
  findByActorId(actorId: string, limit: number, skip?: number): Promise<AuditLogDocument[]>;
}