import { AuditEventDto } from './audit-event.dto';
import { AuditEntry } from '../domain/audit-entry.entity'; // Assuming AuditEntry entity is defined

/**
 * Interface for an Audit Log Sink.
 * Implementations of this interface are responsible for persisting or dispatching audit log entries
 * to their final destination (e.g., console, file, database, remote logging service).
 */
export interface IAuditSink {
    /**
     * Logs a fully formed audit entry.
     * @param entry The AuditEntry object to log.
     * @returns A promise that resolves when the logging operation is complete.
     */
    log(entry: AuditEntry): Promise<void>;
}

/**
 * Interface for the Audit Service.
 * This service is responsible for receiving audit event data, transforming it into
 * an AuditEntry, and then dispatching it via the configured IAuditSink(s).
 */
export interface IAuditService {
    /**
     * Logs a security or system event.
     * @param eventData The AuditEventDto containing details of the event to log.
     * @returns A promise that resolves when the event has been processed for logging.
     */
    logEvent(eventData: AuditEventDto): Promise<void>;
}