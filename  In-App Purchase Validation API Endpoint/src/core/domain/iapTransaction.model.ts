import { model, Schema, Document } from 'mongoose';

/**
 * @interface IIapTransaction
 * @description Defines the structure for an In-App Purchase transaction document in MongoDB.
 * It serves as a permanent record for every transaction for auditing and fraud prevention.
 */
export interface IIapTransaction extends Document {
  userId: Schema.Types.ObjectId;
  sku: string;
  platform: 'ios' | 'android';
  platformTransactionId: string;
  purchaseDate: Date;
  validationStatus: 'pending' | 'validated' | 'failed' | 'refunded';
  validationResponse: any;
  itemsGranted: any;
}

/**
 * @const iapTransactionSchema
 * @description Mongoose schema for the `iaptransactions` collection.
 */
const iapTransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'PlayerProfile',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android'],
      required: true,
    },
    platformTransactionId: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    validationStatus: {
      type: String,
      enum: ['pending', 'validated', 'failed', 'refunded'],
      default: 'pending',
      required: true,
    },
    validationResponse: {
      type: Schema.Types.Mixed,
    },
    itemsGranted: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

/**
 * @description Compound unique index on platform and platformTransactionId.
 * This is a critical security measure to prevent replay attacks by ensuring
 * that the same transaction from a given platform can never be processed more than once.
 */
iapTransactionSchema.index({ platform: 1, platformTransactionId: 1 }, { unique: true });

/**
 * @const IapTransactionModel
 * @description Mongoose model for interacting with the `iaptransactions` collection.
 */
export const IapTransactionModel = model<IIapTransaction>('IAPTransaction', iapTransactionSchema);