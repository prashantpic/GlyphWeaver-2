/**
 * @file Provides the IAuditLogRepository interface, defining the persistence contract for creating audit log entries. This decouples the auditing logic from the database.
 * @namespace GlyphWeaver.Backend.System.Domain.Repositories
 */

/**
 * @interface AuditLogData
 * @description The structure of data required to create an audit log.
 */
export interface AuditLogData {
  eventType: string;
  actorId: string;
  details: any;
  status: 'success' | 'failure';
  ipAddress?: string;
}

/**
 * @interface IAuditLogRepository
 * @description Defines the contract for creating audit log entries.
 * @pattern RepositoryPattern, DDD-Repository
 */
export interface IAuditLogRepository {
  /**
   * Creates and persists a new audit log entry.
   * @param {AuditLogData} logData - The data for the audit log entry.
   * @returns {Promise<void>} A promise that resolves when the creation is complete.
   */
  create(logData: AuditLogData): Promise<void>;
}