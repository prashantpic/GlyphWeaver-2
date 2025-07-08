import { AuditLogModel } from '../data/models/auditLog.model.ts';
import { Types } from 'mongoose';

/**
 * A cross-cutting service for creating and storing audit trail records
 * for security and compliance purposes.
 */
export class AuditService {
    
    /**
     * Logs a data privacy related action, such as a data access or deletion request.
     * @param userId - The ID of the user the action pertains to.
     * @param eventType - The type of the audit event.
     * @param details - An object containing relevant details about the event.
     * @param ipAddress - The IP address from which the request originated.
     * @returns A promise that resolves when the log has been created.
     */
    public async logDataPrivacyAction(
        userId: string,
        eventType: 'DATA_ACCESS_REQUEST' | 'DATA_DELETION_REQUEST',
        details: object,
        ipAddress?: string
    ): Promise<void> {
        
        const auditLog = new AuditLogModel({
            userId: new Types.ObjectId(userId),
            eventType,
            details,
            ipAddress,
            timestamp: new Date(),
        });

        await auditLog.save();
    }
}