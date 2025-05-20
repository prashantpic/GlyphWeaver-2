import { AuditEventType } from '../enums/audit-event-type.enum';

export type AuditEventOutcome = 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'INFO';

export class AuditEventDto {
    eventType: AuditEventType;
    userId?: string; // ID of the user performing the action
    actorType?: 'User' | 'System' | 'Anonymous' | string; // Type of the actor
    targetId?: string; // ID of the entity being acted upon
    targetType?: string; // Type of the entity being acted upon (e.g., 'User', 'IAPProduct')
    sourceIp?: string; // IP address of the request origin
    outcome: AuditEventOutcome;
    details?: Record<string, any>; // Any additional context or data related to the event
    message?: string; // A human-readable summary of the event
    
    constructor(
        eventType: AuditEventType,
        outcome: AuditEventOutcome,
        options?: Partial<Omit<AuditEventDto, 'eventType' | 'outcome'>>
    ) {
        this.eventType = eventType;
        this.outcome = outcome;
        if (options) {
            Object.assign(this, options);
        }
    }
}