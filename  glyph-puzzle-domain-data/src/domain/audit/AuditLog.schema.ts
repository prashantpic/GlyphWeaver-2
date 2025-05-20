import mongoose, { Document, Model, Schema } from 'mongoose';

const schemaOptions = {
  timestamps: true,
  versionKey: 'schemaVersion',
};

export interface AuditLog {
  timestamp: Date;
  eventCategory: string;
  eventType: string;
  actorId?: string;
  targetId?: string;
  details?: any; // mongoose.Schema.Types.Mixed
  ipAddress?: string;
  createdAt?: Date; // from timestamps
  updatedAt?: Date; // from timestamps
  schemaVersion?: number; // from versionKey
}

export interface AuditLogDocument extends AuditLog, Document {}

export interface AuditLogModel extends Model<AuditLogDocument> {}

const AuditLogSchema = new Schema<AuditLogDocument, AuditLogModel>({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  eventCategory: {
    type: String,
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  actorId: {
    type: String,
    required: false,
    index: true,
  },
  targetId: {
    type: String,
    required: false,
    index: true,
  },
  details: {
    type: Schema.Types.Mixed,
    required: false,
  },
  ipAddress: {
    type: String,
    required: false,
  },
}, schemaOptions);

export default mongoose.model<AuditLogDocument, AuditLogModel>('AuditLog', AuditLogSchema);