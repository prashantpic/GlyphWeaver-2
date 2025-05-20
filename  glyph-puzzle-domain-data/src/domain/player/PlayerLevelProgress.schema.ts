import mongoose, { Schema } from 'mongoose';

export interface PlayerLevelProgress {
  levelId: string;
  stars: number;
  highScore: number;
  completed: boolean;
  unlockedAt: Date;
  lastPlayedAt?: Date | null;
}

export const PlayerLevelProgressSchema = new Schema<PlayerLevelProgress>({
  levelId: {
    type: String,
    required: true,
  },
  stars: {
    type: Number,
    min: 0,
    max: 3,
    default: 0,
  },
  highScore: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  lastPlayedAt: {
    type: Date,
    required: false,
  },
}, { _id: false }); // Embedded schemas typically don't have their own _id unless necessary