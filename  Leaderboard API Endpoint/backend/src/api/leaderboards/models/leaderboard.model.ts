/**
 * @file Defines the Mongoose schema and model for the Leaderboard entity.
 * @description This file contains the Mongoose schema for leaderboard definitions,
 * specifying how each leaderboard should behave and be identified.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Models
 */

import { Schema, model, Model } from 'mongoose';
import { ILeaderboard } from '../interfaces/leaderboard.interfaces';

/**
 * Mongoose schema for the 'leaderboards' collection.
 * Defines the data structure for leaderboard configuration documents, including their
 * unique key, display name, scope, and ranking rules.
 */
const leaderboardSchema = new Schema<ILeaderboard>({
  keyName: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  scope: {
    type: String,
    enum: ['global', 'event'],
    required: true,
  },
  tieBreakingFields: [{
    field: { type: String, required: true },
    order: { type: Number, enum: [1, -1], required: true }, // 1 for asc, -1 for desc
    _id: false
  }],
  associatedLevelId: {
    type: Schema.Types.ObjectId,
    ref: 'Level',
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
  collection: 'leaderboards',
});

/**
 * Mongoose model for the Leaderboard entity.
 */
export const LeaderboardModel: Model<ILeaderboard> = model<ILeaderboard>('Leaderboard', leaderboardSchema);