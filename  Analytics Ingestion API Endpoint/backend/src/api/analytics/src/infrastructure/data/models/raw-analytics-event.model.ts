import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * Defines the TypeScript interface for a raw analytics event document in MongoDB.
 */
export interface IRawAnalyticsEvent extends Document {
  sessionId: string;
  playerId?: string;
  eventName: string;
  eventTimestamp: Date;
  payload: Record<string, any>;
  createdAt: Date;
}

/**
 * Mongoose schema for the RawAnalyticsEvent collection.
 */
const rawAnalyticsEventSchema = new Schema<IRawAnalyticsEvent>({
  sessionId: {
    type: String,
    required: true,
  },
  playerId: {
    type: String,
    required: false, // Optional for anonymous/pre-login events
  },
  eventName: {
    type: String,
    required: true,
    index: true,
  },
  eventTimestamp: {
    type: Date,
    required: true,
    index: true,
  },
  payload: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, {
  // Automatically add `createdAt` but not `updatedAt`
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'rawanalyticsevents',
});

// Compound index for efficient time-based queries, often filtered by eventName.
rawAnalyticsEventSchema.index({ eventTimestamp: -1, eventName: 1 });

/**
 * Mongoose model for interacting with the 'rawanalyticsevents' collection.
 */
const RawAnalyticsEventModel: Model<IRawAnalyticsEvent> = mongoose.model<IRawAnalyticsEvent>('RawAnalyticsEvent', rawAnalyticsEventSchema);

export default RawAnalyticsEventModel;