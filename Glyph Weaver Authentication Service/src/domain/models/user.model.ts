import { Schema, model, Document, models } from 'mongoose';

/**
 * Interface representing a single platform identity (e.g., Google, Apple).
 * This is a sub-document within the User model.
 */
export interface IPlatformIdentity extends Document {
  provider: string;
  providerUserId: string;
}

/**
 * Interface representing a User document in MongoDB.
 */
export interface IUser extends Document {
  email?: string;
  passwordHash?: string;
  platformIdentities: IPlatformIdentity[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformIdentitySchema = new Schema<IPlatformIdentity>({
  provider: { type: String, required: true },
  providerUserId: { type: String, required: true },
});

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents to have a null email, but unique for non-null values
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      select: false, // Exclude this field from query results by default
    },
    platformIdentities: {
      type: [PlatformIdentitySchema],
      default: [],
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Compound index to quickly find users by their platform identity
UserSchema.index({ 'platformIdentities.provider': 1, 'platformIdentities.providerUserId': 1 });

/**
 * Mongoose model for the User collection.
 * The `models.User || model(...)` pattern prevents Mongoose from recompiling
 * the model in hot-reloading environments.
 */
export const UserModel = models.User || model<IUser>('User', UserSchema);