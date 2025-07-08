import { model, Schema, Document } from 'mongoose';

// Placeholder for the actual AuditLog model.
interface IAuditLog extends Document {
  eventType: string;
  details: object;
  userId?: string;
  timestamp: Date;
}
const AuditLogSchema = new Schema({
  eventType: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  details: { type: Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now, required: true, index: true },
});
const AuditLogModel = model<IAuditLog>('AuditLog', AuditLogSchema);


/**
 * @interface IAuditLogService
 * @description Defines the contract for a service that logs critical system events.
 */
export interface IAuditLogService {
  /**
   * Logs a significant event to a persistent store for security and auditing purposes.
   * @param {string} eventType - A string identifier for the type of event (e.g., 'IAP_VALIDATION_SUCCESS').
   * @param {object} details - A JSON object containing event-specific data.
   * @param {string} [userId] - The ID of the user associated with the event, if applicable.
   * @returns {Promise<void>}
   */
  logEvent(eventType: string, details: object, userId?: string): Promise<void>;
}

/**
 * @class AuditLogService
 * @description Provides a centralized, reusable service for creating audit trail entries.
 * It is used by the IAP service to record all validation attempts, successes, failures,
 * and potential security incidents like replay attacks.
 */
export class AuditLogService implements IAuditLogService {
  /**
   * Creates a new audit log document and saves it to the database.
   * This is a fire-and-forget operation from the perspective of the calling service.
   * @param {string} eventType - A string identifier for the type of event.
   * @param {object} details - A JSON object containing event-specific data.
   * @param {string} [userId] - The ID of the user associated with the event.
   * @returns {Promise<void>}
   */
  public async logEvent(eventType: string, details: object, userId?: string): Promise<void> {
    try {
      const auditLogEntry = new AuditLogModel({
        eventType,
        details,
        userId,
        timestamp: new Date(),
      });
      await auditLogEntry.save();
    } catch (error) {
      // In a production environment, this should log to a separate, highly-available logging service (e.g., Sentry, DataDog).
      // We don't want failure to write an audit log to break the primary application flow.
      console.error('Failed to write to audit log:', error);
    }
  }
}