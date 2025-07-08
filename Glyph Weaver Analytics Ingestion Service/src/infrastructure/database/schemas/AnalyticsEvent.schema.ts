import { Schema, model, Document } from 'mongoose';
import { AnalyticsEvent } from '../../../domain/models/AnalyticsEvent';

/**
 * Mongoose Document interface for an AnalyticsEvent.
 * It combines the domain model with Mongoose's Document class.
 */
export interface IAnalyticsEventDocument extends AnalyticsEvent, Document<string> {
  _id: string; // Ensure _id is a string matching the domain model's id
}

/**
 * Defines the Mongoose schema that maps the AnalyticsEvent domain model to a MongoDB collection.
 * This schema enforces data structure and types at the database level and defines indexes for query optimization.
 */
const analyticsEventSchema = new Schema<IAnalyticsEventDocument>({
  _id: { type: String, required: true }, // Using string UUIDs from the domain model as the primary key.
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true, sparse: true }, // Sparse index is efficient for fields that are often null.
  eventName: { type: String, required: true, index: true },
  clientTimestamp: { type: Date, required: true },
  serverTimestamp: { type: Date, required: true, index: true },
  clientVersion: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  geo: {
    country: String,
    region: String,
    city: String,
  },
}, {
  // Use the serverTimestamp for createdAt to avoid a redundant field. No `updatedAt`.
  timestamps: { createdAt: 'serverTimestamp', updatedAt: false },
  // Disable the default version key (__v) as it's not needed for this use case.
  versionKey: false,
  // Tell Mongoose we are providing our own _id.
  _id: false,
});

// A compound index to optimize common analytical queries, such as
// "find all 'level_complete' events in the last 24 hours".
analyticsEventSchema.index({ eventName: 1, serverTimestamp: -1 });

/**
 * The Mongoose model for the 'AnalyticsEvent' collection.
 * This model provides the interface for database operations.
 */
export const AnalyticsEventModel = model<IAnalyticsEventDocument>('AnalyticsEvent', analyticsEventSchema);