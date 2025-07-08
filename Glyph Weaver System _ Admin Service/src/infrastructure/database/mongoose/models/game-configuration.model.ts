import { Schema, model, Document } from 'mongoose';

/**
 * @file Contains the Mongoose schema definition for the `game_configurations` collection in MongoDB, enabling structured data access through the Mongoose ODM.
 * @namespace GlyphWeaver.Backend.System.Infrastructure.Database.Mongoose.Models
 */

/**
 * @interface GameConfigurationDocument
 * @description Extends Mongoose's Document, representing a game configuration document in MongoDB.
 */
export interface GameConfigurationDocument extends Document {
  key: string;
  value: any;
  version: number;
  description?: string;
  lastUpdatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const GameConfigurationSchema = new Schema<GameConfigurationDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    description: {
      type: String,
      required: false,
    },
    lastUpdatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export const GameConfigurationModel = model<GameConfigurationDocument>(
  'GameConfiguration',
  GameConfigurationSchema
);