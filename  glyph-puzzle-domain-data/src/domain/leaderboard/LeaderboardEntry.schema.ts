import mongoose, { Document, Model, Schema } from 'mongoose';

const schemaOptions = {
  timestamps: true,
  versionKey: 'schemaVersion',
};

export interface LeaderboardEntry {
  playerId: mongoose.Types.ObjectId;
  levelId: string;
  zoneId: string;
  score: number;
  timestamp: Date;
  moves?: number;
  timeTakenMs?: number;
  createdAt?: Date; // from timestamps
  updatedAt?: Date; // from timestamps
  schemaVersion?: number; // from versionKey
}

export interface LeaderboardEntryDocument extends LeaderboardEntry, Document {}

export interface LeaderboardEntryModel extends Model<LeaderboardEntryDocument> {}

const LeaderboardEntrySchema = new Schema<LeaderboardEntryDocument, LeaderboardEntryModel>({
  playerId: {
    type: Schema.Types.ObjectId,
    ref: 'PlayerProfile', // Assumes PlayerProfile model exists
    required: true,
  },
  levelId: {
    type: String,
    required: true,
  },
  zoneId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  moves: {
    type: Number,
    required: false,
  },
  timeTakenMs: {
    type: Number,
    required: false,
  },
}, schemaOptions);

LeaderboardEntrySchema.index({ levelId: 1, score: -1, timestamp: 1 });
LeaderboardEntrySchema.index({ zoneId: 1, score: -1, timestamp: 1 });

export default mongoose.model<LeaderboardEntryDocument, LeaderboardEntryModel>('LeaderboardEntry', LeaderboardEntrySchema);