import { Schema, model, Document, Types } from 'mongoose';

type EventType = 'DATA_ACCESS_REQUEST' | 'DATA_DELETION_REQUEST';

/**
 * Interface for the AuditLog document.
 */
export interface IAuditLog extends Document {
    timestamp: Date;
    userId?: Types.ObjectId;
    ipAddress?: string;
    eventType: EventType;
    details: Types.Mixed;
}

const AuditLogSchema = new Schema<IAuditLog>({
    timestamp: { type: Date, required: true, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'PlayerProfile' },
    ipAddress: { type: String },
    eventType: { 
        type: String, 
        required: true, 
        enum: ['DATA_ACCESS_REQUEST', 'DATA_DELETION_REQUEST'] 
    },
    details: { type: Schema.Types.Mixed, required: true },
}, { timestamps: false }); // Using custom timestamp field

// Indexes for efficient querying
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });

export const AuditLogModel = model<IAuditLog>('AuditLog', AuditLogSchema);