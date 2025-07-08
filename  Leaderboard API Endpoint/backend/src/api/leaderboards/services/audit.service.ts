/**
 * @file Handles the logging of critical and auditable events related to the leaderboard system.
 * @description A centralized service for logging all auditable actions within the leaderboard domain,
 * ensuring a consistent and secure audit trail.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Services
 */

import { IAuditLog, IAuditLogRepository, IAuditService } from '../interfaces/leaderboard.interfaces';
import { Model, Schema, model } from 'mongoose';


// Placeholder Repository until it's defined in its own domain
class AuditLogRepository implements IAuditLogRepository {
    private readonly auditLogModel: Model<IAuditLog>;
    constructor() {
        const auditLogSchema = new Schema<IAuditLog>({
            eventType: { type: String, required: true, index: true },
            userId: { type: Schema.Types.ObjectId, ref: 'PlayerProfile', index: true },
            details: { type: Schema.Types.Mixed, required: true },
        }, { timestamps: { createdAt: 'timestamp' }, collection: 'auditlogs', versionKey: false });
        this.auditLogModel = model<IAuditLog>('AuditLog', auditLogSchema);
    }
    async create(logData: Partial<IAuditLog>): Promise<IAuditLog> {
        const log = new this.auditLogModel(logData);
        return await log.save();
    }
}


export class AuditService implements IAuditService {
  private readonly auditLogRepository: IAuditLogRepository;

  constructor(auditLogRepository?: IAuditLogRepository) {
    // In a real DI container, this would be injected.
    this.auditLogRepository = auditLogRepository || new AuditLogRepository();
  }

  /**
   * Logs a score submission attempt.
   * @param details - Contextual details about the submission.
   */
  public async logScoreSubmission(details: { userId: string; leaderboardKey: string; score: number; isValid: boolean; }): Promise<void> {
    try {
        await this.auditLogRepository.create({
            eventType: 'SCORE_SUBMISSION',
            userId: details.userId,
            details,
        });
    } catch (error) {
        console.error('Failed to log score submission:', error);
    }
  }

  /**
   * Logs an activity that was flagged as suspicious by the cheat detection service.
   * @param details - Contextual details about the suspicious activity.
   */
  public async logSuspiciousActivity(details: { userId: string; reason: string; submissionData: object; }): Promise<void> {
    try {
        await this.auditLogRepository.create({
            eventType: 'SUSPICIOUS_ACTIVITY',
            userId: details.userId,
            details,
        });
    } catch(error) {
        console.error('Failed to log suspicious activity:', error);
    }
  }
  
  /**
   * Logs an administrative action, such as banning a player.
   * @param details - Contextual details about the admin action.
   */
  public async logAdminAction(details: { adminId: string; action: string; targetUserId: string; }): Promise<void> {
      try {
          await this.auditLogRepository.create({
              eventType: 'ADMIN_ACTION',
              // `userId` here could represent the admin performing the action
              userId: details.adminId, 
              details,
          });
      } catch (error) {
          console.error('Failed to log admin action:', error);
      }
  }
}