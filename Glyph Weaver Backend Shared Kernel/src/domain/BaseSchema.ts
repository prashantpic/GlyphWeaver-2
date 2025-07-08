// src/domain/BaseSchema.ts
import { SchemaDefinition } from 'mongoose';

/**
 * A base Mongoose schema definition object that includes a schemaVersion.
 * Timestamps (createdAt, updatedAt) should be enabled in the SchemaOptions
 * of the consuming schema (`{ timestamps: true }`).
 */
export const baseSchemaDefinition: SchemaDefinition = {
  schemaVersion: {
    type: Number,
    required: true,
    default: 1,
  },
};