import { Model } from 'mongoose';
import { IAuditLogRepository, AuditLogData } from '../../../../domain/repositories/audit-log.repository';
import { AuditLogDocument } from '../models/audit-log.model';

/**
 * @file This class provides the concrete implementation for persisting audit log entries using Mongoose and MongoDB.
 * @namespace GlyphWeaver.Backend.System.Infrastructure.Database.Mongoose.Repositories
 */

/**
 * @class MongoAuditLogRepository
 * @description Implements the IAuditLogRepository interface for creating audit log entries.
 * @implements {IAuditLogRepository}
 * @pattern RepositoryPattern, DependencyInjection
 */
export class MongoAuditLogRepository implements IAuditLogRepository {

  constructor(private readonly auditLogModel: Model<AuditLogDocument>) {}

  /**
   * @inheritdoc
   */
  async create(logData: AuditLogData): Promise<void> {
    const newLog = new this.auditLogModel(logData);
    await newLog.save();
  }
}