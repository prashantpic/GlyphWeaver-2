import mongoose, { FilterQuery } from 'mongoose';
import { AuditLogDocument, AuditLogModel } from '../../domain/audit/AuditLog.schema';
import { IAuditLogRepository } from '../interfaces/IAuditLogRepository';
import { BaseRepository } from './BaseRepository';

export class AuditLogRepository
  extends BaseRepository<AuditLogDocument, typeof AuditLogModel>
  implements IAuditLogRepository
{
  constructor() {
    super(AuditLogModel);
  }

  async findByEventCategory(category: string, limit: number = 50, skip: number = 0): Promise<AuditLogDocument[]> {
    return this.model
      .find({ eventCategory: category })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findByActorId(actorId: string, limit: number = 50, skip: number = 0): Promise<AuditLogDocument[]> {
    return this.model
      .find({ actorId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
}