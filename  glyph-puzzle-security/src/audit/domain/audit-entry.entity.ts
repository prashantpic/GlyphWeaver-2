import { AuditEventType } from '../enums/audit-event-type.enum'; // Assuming this enum will be created

export enum AuditEventOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  ATTEMPT = 'ATTEMPT', // For events where outcome is not yet determined or is an attempt
  INFO = 'INFO',     // For informational events
}

export class AuditEntry {
  eventId: string; // Unique ID for this audit event, e.g., UUID
  timestamp: Date;
  eventType: AuditEventType; // Standardized event type
  userId?: string; // ID of the user who performed the action, if applicable
  username?: string; // Username, if available
  sourceIp?: string; // IP address of the request origin
  targetResource?: string; // e.g., User ID being modified, endpoint path
  action: string; // Specific action performed, e.g., 'USER_LOGIN', 'IAP_VALIDATE_APPLE'
  outcome: AuditEventOutcome; // Success, Failure, Attempt
  details?: Record<string, any>; // Additional context-specific information (JSON)
  correlationId?: string; // For tracking related events across services or requests

  constructor(
    eventId: string,
    eventType: AuditEventType,
    action: string,
    outcome: AuditEventOutcome,
    timestamp: Date = new Date(),
    userId?: string,
    username?: string,
    sourceIp?: string,
    targetResource?: string,
    details?: Record<string, any>,
    correlationId?: string,
  ) {
    this.eventId = eventId;
    this.timestamp = timestamp;
    this.eventType = eventType;
    this.userId = userId;
    this.username = username;
    this.sourceIp = sourceIp;
    this.targetResource = targetResource;
    this.action = action;
    this.outcome = outcome;
    this.details = details;
    this.correlationId = correlationId;
  }
}