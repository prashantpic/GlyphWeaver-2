import { Schema, model, Document, models } from 'mongoose';

/**
 * Interface representing a refresh token document in MongoDB.
 */
export interface IToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt
  }
);

// TTL index to automatically delete expired tokens from the database.
// MongoDB will check this index periodically and remove documents where
// `expiresAt` is in the past.
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Mongoose model for the Token collection.
 * This pattern prevents model recompilation in hot-reloading environments.
 */
export const TokenModel = models.Token || model<IToken>('Token', TokenSchema);