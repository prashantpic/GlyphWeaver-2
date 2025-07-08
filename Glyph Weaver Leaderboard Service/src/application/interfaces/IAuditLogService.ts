/**
 * Defines the contract for an audit logging service.
 * This service is responsible for logging critical security-relevant events
 * to a separate, secure log stream or collection as per REQ-SEC-007.
 */
export interface IAuditLogService {
  /**
   * Logs a successful, security-relevant event.
   * @param details - An object containing event-specific data.
   */
  logSuccess(details: object): Promise<void>;

  /**
   * Logs a suspicious event that may indicate malicious activity.
   * @param details - An object containing event-specific data, including the reason for suspicion.
   */
  logSuspicious(details: object): Promise<void>;
}