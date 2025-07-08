/**
 * @file Defines the data structure for an audit log event.
 */

/**
 * Provides a consistent, typed structure for all audit log entries created by the system.
 * This interface defines the non-negotiable fields for any audit event.
 */
export interface AuditEvent {
  /**
   * The type of event that occurred (e.g., 'LOGIN_SUCCESS', 'REGISTER_SUCCESS').
   */
  readonly eventType: string;

  /**
   * The ID of the user associated with the event, if applicable.
   */
  readonly userId: string | null;

  /**
   * The IP address from which the event originated.
   */
  readonly ipAddress: string;

  /**
   * A flexible object to hold event-specific context or details.
   */
  readonly details: Record<string, any>;

  /**
   * The timestamp when the event occurred.
   */
  readonly timestamp: Date;
}