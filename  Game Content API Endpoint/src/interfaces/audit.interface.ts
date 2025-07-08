/**
 * Defines the contract for an audit logging service.
 * This interface promotes dependency inversion, allowing for different
 * implementations of the audit service (e.g., console, file, database)
 * to be used interchangeably.
 */
export interface IAuditService {
  /**
   * Logs a significant system event.
   * @param eventType A string identifying the type of event (e.g., 'LEVEL_INSTANCE_REGISTERED').
   * @param details An object containing relevant details about the event.
   * @returns A promise that resolves when the event has been logged.
   */
  logEvent(eventType: string, details: Record<string, any>): Promise<void>;
}