import { IAuditService } from '../interfaces/audit.interface';

/**
 * A service responsible for handling audit logging.
 * This implementation provides a centralized point for recording important system events.
 * The current implementation logs to the console in a structured JSON format,
 * but can be extended to log to a file, database, or external service.
 */
export class AuditService implements IAuditService {
  /**
   * Logs a significant system event to the console.
   * @param eventType A string identifying the type of event (e.g., 'LEVEL_INSTANCE_REGISTERED').
   * @param details An object containing relevant details about the event.
   * @returns A promise that resolves immediately.
   */
  public async logEvent(eventType: string, details: Record<string, any>): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      details,
    };

    // In a real application, this could write to a dedicated logging service,
    // a database collection, or a log file. For now, we log to the console.
    console.log(JSON.stringify(logEntry));

    return Promise.resolve();
  }
}