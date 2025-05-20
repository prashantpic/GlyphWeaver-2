import mongoose, { Document, Model, Schema } from 'mongoose';

const schemaOptions = {
  timestamps: true,
  versionKey: 'schemaVersion',
};

export interface IAPTransaction {
  transactionId: string;
  platform: 'apple' | 'google';
  productId: string;
  userId: string;
  purchaseDate: Date;
  receiptData?: string | any; // string or mongoose.Schema.Types.Mixed
  validationStatus: 'pending' | 'validated' | 'failed';
  processed: boolean;
  createdAt?: Date; // from timestamps
  updatedAt?: Date; // from timestamps
  schemaVersion?: number; // from versionKey
}

export interface IAPTransactionDocument extends IAPTransaction, Document {}

export interface IAPTransactionModel extends Model<IAPTransactionDocument> {}

const IAPTransactionSchema = new Schema<IAPTransactionDocument, IAPTransactionModel>({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  platform: {
    type: String,
    enum: ['apple', 'google'],
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  receiptData: {
    type: Schema.Types.Mixed, // Can be String or structured JSON
    required: false,
  },
  validationStatus: {
    type: String,
    enum: ['pending', 'validated', 'failed'],
    default: 'pending',
  },
  processed: {
    type: Boolean,
    default: false,
  },
}, schemaOptions);

export default mongoose.model<IAPTransactionDocument, IAPTransactionModel>('IAPTransaction', IAPTransactionSchema);