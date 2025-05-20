export enum AuditLogSinkType {
  CONSOLE = 'console',
  FILE = 'file',
  HTTP = 'http',
  NONE = 'none',
}

export interface AuditConfig {
  logLevel: string; // e.g., 'INFO', 'WARN', 'ERROR' (specific to audit events)
  sinkType: AuditLogSinkType;
  filePath?: string; // if sinkType is FILE
  httpEndpoint?: string; // if sinkType is HTTP
  bufferSize?: number; // Optional: For batching events before sending to HTTP sink
  flushInterval?: number; // Optional: Interval in ms to flush buffer for HTTP sink
}

// This function will be called by the main config index, potentially passing SecretService
export const auditConfig = (
  getSecret: (key: string, defaultValue?: string) => string | undefined,
): AuditConfig => {
  const sinkType = (getSecret('AUDIT_LOG_SINK_TYPE', AuditLogSinkType.CONSOLE) as AuditLogSinkType)
                    || AuditLogSinkType.CONSOLE;
  return {
    logLevel: getSecret('AUDIT_LOG_LEVEL', 'INFO') as string,
    sinkType,
    filePath: sinkType === AuditLogSinkType.FILE ? getSecret('AUDIT_LOG_FILE_PATH', './audit.log') : undefined,
    httpEndpoint: sinkType === AuditLogSinkType.HTTP ? getSecret('AUDIT_LOG_HTTP_ENDPOINT') : undefined,
    bufferSize: parseInt(getSecret('AUDIT_LOG_HTTP_BUFFER_SIZE', '10') || '10', 10),
    flushInterval: parseInt(getSecret('AUDIT_LOG_HTTP_FLUSH_INTERVAL', '5000') || '5000', 10),
  };
};