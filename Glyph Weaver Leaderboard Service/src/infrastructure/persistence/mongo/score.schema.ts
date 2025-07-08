import { Schema, model, Document } from 'mongoose';

/**
 * Mongoose Document interface for a Score, tying it to the database representation.
 */
export interface IScoreDocument extends Document {
  leaderboardId: string;
  playerId: string;
  scoreValue: number;
  tieBreakerValue: number; // For sorting when scores are equal. Lower is better.
  metadata: Record<string, any>;
  submittedAt: Date;
  isSuspicious: boolean;
  suspicionReason?: string;
}

/**
 * Mongoose Schema for the 'scores' collection.
 */
const scoreSchema = new Schema<IScoreDocument>({
  leaderboardId: { type: String, required: true, index: true },
  playerId: { type: String, required: true },
  scoreValue: { type: Number, required: true },
  tieBreakerValue: { type: Number, required: true },
  metadata: { type: Schema.Types.Mixed, required: false },
  submittedAt: { type: Date, default: Date.now, required: true },
  isSuspicious: { type: Boolean, default: false },
  suspicionReason: { type: String, required: false },
}, { 
  timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index for efficient ranking queries (REQ-SCF-012, REQ-SCF-007)
// Sorts by score descending, then tie-breaker ascending, then submission time ascending.
scoreSchema.index({ leaderboardId: 1, scoreValue: -1, tieBreakerValue: 1, submittedAt: 1 });

// Index for efficiently fetching a player's best score on a specific leaderboard.
scoreSchema.index({ leaderboardId: 1, playerId: 1 });

/**
 * The compiled Mongoose model for the 'Score' collection.
 */
export const ScoreModel = model<IScoreDocument>('Score', scoreSchema);