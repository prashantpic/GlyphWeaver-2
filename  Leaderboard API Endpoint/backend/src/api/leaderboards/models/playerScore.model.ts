/**
 * @file Defines the Mongoose schema and model for the PlayerScore entity.
 * @description This file contains the Mongoose schema definition for storing and indexing
 * individual player scores for leaderboards, optimized for ranking queries.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Models
 */

import { Schema, model, Model } from 'mongoose';
import { IPlayerScore } from '../interfaces/leaderboard.interfaces';

/**
 * Mongoose schema for the 'playerScores' collection.
 * Defines the data structure, validation rules, and database indexes for
 * player score documents stored in MongoDB.
 */
const playerScoreSchema = new Schema<IPlayerScore>({
  leaderboardId: {
    type: Schema.Types.ObjectId,
    ref: 'Leaderboard',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'PlayerProfile',
    required: true,
    index: true,
  },
  scoreValue: {
    type: Number,
    required: true,
  },
  metadata: {
    completionTime: { type: Number, required: true },
    moves: { type: Number, required: true },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'playerScores',
  timestamps: false, // Manual timestamp for tie-breaking
});

/**
 * Primary ranking index to support fast, paginated leaderboard queries.
 * Sorts by leaderboard, then score (desc), then completion time (asc), then submission time (asc).
 */
playerScoreSchema.index({
  leaderboardId: 1,
  scoreValue: -1,
  'metadata.completionTime': 1,
  timestamp: 1
});

/**
 * Index to quickly find a user's score on a specific leaderboard.
 * This is useful for `getPlayerRank` and for preventing duplicate score entries if needed.
 */
playerScoreSchema.index({ userId: 1, leaderboardId: 1 });


/**
 * Mongoose model for the PlayerScore entity.
 */
export const PlayerScoreModel: Model<IPlayerScore> = model<IPlayerScore>('PlayerScore', playerScoreSchema);