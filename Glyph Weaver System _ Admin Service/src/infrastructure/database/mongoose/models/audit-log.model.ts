import { Schema, model, Document } from 'mongoose';

/**
 * @file Contains the Mongoose schema definition for the `audit_logs` collection, which stores records of all significant administrative actions.
 * @namespace GlyphWeaver.Backend.System.Infrastructure.Database.Mongoose.Models
 */

/**
 * @interface AuditLogDocument
 * @description Extends Mongoose's Document, representing an audit log entry in MongoDB.
 */
export interface AuditLogDocument extends Document {
  eventType: string;
  actorId: string;
  details: any;
  status: 'success' | 'failure';
  ipAddress?: string;
  timestamp: Date;
}

// Note: For high-volume logging, this collection could be configured as a MongoDB Time Series collection.
// This would optimize storage and query performance for time-based data.
// Configuration for Time Series collections is typically done at the database level:
// db.createCollection("audit_logs", { timeseries: { timeField: "timestamp", metaField: "eventType" } })
const AuditLogSchema = new Schema<AuditLogDocument>({
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  actorId: {
    type: String,
    required: true,
    index: true,
  },
  details: {
    type: Schema.Types.Mixed,
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failure'],
  },
  ipAddress: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  // To prevent Mongoose from pluralizing the collection name
  collection: 'audit_logs',
  // Disable automatic `_id` and `versionKey` if using time-series native ID.
  // For standard collections, Mongoose defaults are fine.
  versionKey: false,
});

export const AuditLogModel = model<AuditLogDocument>('AuditLog', AuditLogSchema);