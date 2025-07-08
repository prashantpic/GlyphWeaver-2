import { Schema, model, Document } from 'mongoose';
import { IAPTransactionStatus } from '../../../domain/iap-transaction/iap-transaction.aggregate';

/**
 * @interface IAPTransactionDocument
 * @description Extends Mongoose's Document to provide strong typing for IAPTransaction documents.
 */
export interface IAPTransactionDocument extends Document {
    _id: string; // Using string for UUIDs
    userId: string;
    sku: string;
    platform: 'ios' | 'android';
    platformTransactionId: string;
    purchaseDate: Date;
    status: IAPTransactionStatus;
    validationResponse?: any;
    fulfillmentDetails?: any;
}

/**
 * @const iapTransactionSchema
 * @description Defines the Mongoose schema for the `iap_transactions` collection.
 * This schema maps the IAPTransaction domain aggregate to a MongoDB document structure,
 * defining data types, required fields, and indexes.
 */
const iapTransactionSchema = new Schema<IAPTransactionDocument>(
    {
        _id: { type: String, required: true },
        userId: { type: String, required: true, index: true },
        sku: { type: String, required: true },
        platform: { type: String, required: true, enum: ['ios', 'android'] },
        platformTransactionId: { type: String, required: true },
        purchaseDate: { type: Date, required: true },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'validated', 'failed', 'fulfilled', 'error'],
            index: true
        },
        validationResponse: { type: Object },
        fulfillmentDetails: { type: Object },
    },
    {
        /**
         * Enables automatic `createdAt` and `updatedAt` timestamps.
         */
        timestamps: true,
        // Use `_id: false` if you want Mongoose to not create its own `_id`
        // and rely solely on the one provided from the domain.
        _id: false
    }
);

/**
 * @index
 * @description Creates a unique compound index on `platform` and `platformTransactionId`.
 * This is a critical database-level constraint to prevent duplicate transactions from
 * being processed, which is a key defense against replay attacks.
 */
iapTransactionSchema.index({ platform: 1, platformTransactionId: 1 }, { unique: true });


/**
 * @model IAPTransactionModel
 * @description The Mongoose model for interacting with the `iaptransactions` collection.
 */
export const IAPTransactionModel = model<IAPTransactionDocument>('IAPTransaction', iapTransactionSchema);