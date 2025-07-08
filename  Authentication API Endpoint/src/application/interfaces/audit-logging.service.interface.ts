import { AuditEvent } from '../../domain/audit-event.model';

/**
 * @file Defines the contract for the Audit Logging Service.
 */

/**
 * Specifies the interface for a service responsible for persisting security audit events.
 * This abstraction allows the Authentication Service to log events without being coupled
 * to a specific logging implementation (e.g., console, file, database, external service).
 */
export interface IAuditLoggingService {
  /**
   * Logs a security-relevant event.
   * The service implementation is responsible for adding the timestamp.
   * @param event - A partial AuditEvent object, without the timestamp.
   * @returns A promise that resolves when the event has been logged.
   */
  logEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void>;
}