import { AuditConfig, AuditLogSinkType } from '../config/audit.config';
import { logger } from '../common/utils/logger.util';
import { AUDIT_OUTCOME_SUCCESS, AUDIT_OUTCOME_FAILURE } from '../common/constants/audit.constants';

// Define AuditEventType enum here as its file is not in the generation list
export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
  TOKEN_REFRESH_SUCCESS = 'TOKEN_REFRESH_SUCCESS',
  TOKEN_REFRESH_FAILURE = 'TOKEN_REFRESH_FAILURE',
  OAUTH_CALLBACK_SUCCESS = 'OAUTH_CALLBACK_SUCCESS',
  OAUTH_CALLBACK_FAILURE = 'OAUTH_CALLBACK_FAILURE',
  API_KEY_VALIDATION_SUCCESS = 'API_KEY_VALIDATION_SUCCESS',
  API_KEY_VALIDATION_FAILURE = 'API_KEY_VALIDATION_FAILURE',

  // Authorization Events
  AUTHORIZATION_SUCCESS = 'AUTHORIZATION_SUCCESS',
  AUTHORIZATION_FAILURE = 'AUTHORIZATION_FAILURE',

  // IAP Events
  IAP_VALIDATION_ATTEMPT = 'IAP_VALIDATION_ATTEMPT',
  IAP_VALIDATION_SUCCESS = 'IAP_VALIDATION_SUCCESS',
  IAP_VALIDATION_FAILURE = 'IAP_VALIDATION_FAILURE',

  // User Management Events
  USER_CREATE_SUCCESS = 'USER_CREATE_SUCCESS',
  USER_CREATE_FAILURE = 'USER_CREATE_FAILURE',
  USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS',
  USER_UPDATE_FAILURE = 'USER_UPDATE_FAILURE',
  USER_DELETE_SUCCESS = 'USER_DELETE_SUCCESS',
  USER_DELETE_FAILURE = 'USER_DELETE_FAILURE',
  PASSWORD_CHANGE_SUCCESS = 'PASSWORD_CHANGE_SUCCESS',
  PASSWORD_CHANGE_FAILURE = 'PASSWORD_CHANGE_FAILURE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILURE = 'PASSWORD_RESET_FAILURE',

  // Cryptography Events
  ENCRYPTION_SUCCESS = 'ENCRYPTION_SUCCESS',
  ENCRYPTION_FAILURE = 'ENCRYPTION_FAILURE',
  DECRYPTION_SUCCESS = 'DECRYPTION_SUCCESS',
  DECRYPTION_FAILURE = 'DECRYPTION_FAILURE',

  // Secret Management
  SECRET_ACCESS_SUCCESS = 'SECRET_ACCESS_SUCCESS',
  SECRET_ACCESS_FAILURE = 'SECRET_ACCESS_FAILURE',
  
  // Admin Actions
  ADMIN_ACTION = 'ADMIN_ACTION',

  // System Events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  CONFIG_CHANGE_SUCCESS = 'CONFIG_CHANGE_SUCCESS',
  CONFIG_CHANGE_FAILURE = 'CONFIG_CHANGE_FAILURE',

  // Generic Security Event
  SECURITY_ALERT = 'SECURITY_ALERT',
}

// Define AuditEventDto here as its file is not in the generation list
export interface AuditEventDto {
  eventId?: string; // Optional: auto-generated if not provided
  timestamp?: Date; // Optional: auto-generated if not provided
  eventType: AuditEventType | string; // Allow custom string event types
  userId?: string; // ID of the user who performed the action
  actor?: { type: string, id: string }; // More generic actor (e.g. system, serviceApiKey)
  target?: { type: string, id: string, details?: any }; // e.g. resource being acted upon
  outcome: typeof AUDIT_OUTCOME_SUCCESS | typeof AUDIT_OUTCOME_FAILURE | string; // 'SUCCESS', 'FAILURE', or other
  sourceIp?: string;
  userAgent?: string;
  details?: any; // Additional context-specific information
  correlationId?: string; // For tracking related events
}

// Minimal IAuditSink interface (not in generation list)
interface IAuditSink {
  log(event: AuditEventDto): Promise<void>;
  initialize?(): Promise<void>; // Optional initialization
  flush?(): Promise<void>; // Optional flush mechanism
}

class ConsoleAuditSink implements IAuditSink {
  async log(event: AuditEventDto): Promise<void> {
    // Basic console logging, can be enhanced with formatting from audit.config.ts
    console.log(`AUDIT | ${event.timestamp?.toISOString()} | ${event.eventType} | User: ${event.userId || 'N/A'} | Outcome: ${event.outcome} | Details: ${JSON.stringify(event.details || {})}`);
  }
}

// Placeholder for other sinks like FileAuditSink or HttpAuditSink
// class FileAuditSink implements IAuditSink { /* ... */ }
// class HttpAuditSink implements IAuditSink { /* ... */ }


export class AuditService {
  private sink: IAuditSink;
  private eventBuffer: AuditEventDto[] = [];
  private flushIntervalId?: NodeJS.Timeout;


  constructor(private auditConfig: AuditConfig) {
    // Initialize the sink based on configuration
    // For now, only console sink is implemented as a basic example
    switch (this.auditConfig.sinkType) {
      case AuditLogSinkType.CONSOLE:
        this.sink = new ConsoleAuditSink();
        break;
      // case AuditLogSinkType.FILE:
      //   this.sink = new FileAuditSink(this.auditConfig.filePath);
      //   break;
      // case AuditLogSinkType.HTTP:
      //   this.sink = new HttpAuditSink(this.auditConfig.httpEndpoint, this.auditConfig.bufferSize, this.auditConfig.flushInterval);
      //   break;
      case AuditLogSinkType.NONE:
        this.sink = { async log() { /* no-op */ } }; // No-op sink
        break;
      default:
        logger.warn(`AuditService: Unsupported sink type '${this.auditConfig.sinkType}'. Defaulting to console.`);
        this.sink = new ConsoleAuditSink();
    }
    logger.info(`AuditService initialized with sink type: ${this.auditConfig.sinkType}`);
    
    if (this.sink.initialize) {
        this.sink.initialize().catch(err => logger.error('Error initializing audit sink:', err));
    }

    if (this.auditConfig.sinkType === AuditLogSinkType.HTTP && this.auditConfig.flushInterval && this.sink.flush) {
        this.flushIntervalId = setInterval(async () => {
            if (this.eventBuffer.length > 0 && this.sink.flush) {
                await this.sink.flush(); // Assuming flush handles the buffer
            }
        }, this.auditConfig.flushInterval);
    }
  }

  public async logEvent(eventData: AuditEventDto): Promise<void> {
    const completeEvent: AuditEventDto = {
      eventId: eventData.eventId || crypto.randomUUID(),
      timestamp: eventData.timestamp || new Date(),
      ...eventData,
    };

    // Basic filtering based on log level could be added here if needed
    // e.g., if (this.shouldLog(completeEvent.level || 'INFO')) { ... }
    
    try {
      // If buffering is implemented (e.g., for HTTP sink)
      // if (this.auditConfig.sinkType === AuditLogSinkType.HTTP && this.auditConfig.bufferSize) {
      //   this.eventBuffer.push(completeEvent);
      //   if (this.eventBuffer.length >= this.auditConfig.bufferSize && this.sink.flush) {
      //     await this.sink.flush(); // Assuming flush handles the buffer
      //   }
      // } else {
        await this.sink.log(completeEvent);
      // }
    } catch (error) {
      logger.error('AuditService: Failed to dispatch audit event:', error, completeEvent);
      // Potentially implement a fallback mechanism (e.g., log to console if primary sink fails)
    }
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    if (this.flushIntervalId) {
        clearInterval(this.flushIntervalId);
    }
    if (this.eventBuffer.length > 0 && this.sink.flush) {
        logger.info('Flushing remaining audit events before shutdown...');
        await this.sink.flush();
    }
    logger.info('AuditService shut down.');
  }
}