import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config';
import { LogScoreSubmissionAuditInput } from '../../interfaces/score.interfaces'; // AuditLogEntry is also defined there
import { AuditLogEntry } from '../../interfaces/common.interfaces'; // General AuditLogEntry
import { ServiceUnavailableError, ActivityOperationFailedError } from '../../error_handling/custom_errors';

export class AuditLoggerClient {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: `${config.services.backendApi.endpoint}/audit`, // Assuming an /audit path prefix
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.services.backendApi.authToken}`, // Audit logs are sensitive
      },
      timeout: 10000, // 10 seconds timeout
    });
  }

  public async logEvent(logEntry: AuditLogEntry | LogScoreSubmissionAuditInput): Promise<void> {
    try {
      await this.httpClient.post('/log', logEntry);
    } catch (error) {
      // Audit logging failures are critical and should be retried robustly.
      // The activity calling this client will set a CriticalActivityRetryPolicy.
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        if (axiosError.response) {
          // For audit, any failure to log might be treated as retryable unless it's a clear client error (e.g. 400 Bad Request)
          throw ActivityOperationFailedError(
            `AuditLoggerClient.logEvent failed: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.message}`,
            axiosError.response.status === 400, // Only 400 Bad Request is non-retryable, others might be server issues
            axiosError.response.data?.details
          );
        } else if (axiosError.request) {
          throw ServiceUnavailableError('AuditLoggerService (no response)', axiosError);
        }
      }
      throw ServiceUnavailableError('AuditLoggerService (unknown error)', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

export const auditLoggerClient = new AuditLoggerClient();