import { Schema, model, Document, Types } from 'mongoose';

/**
 * Interface for the LevelProgress document.
 */
export interface ILevelProgress extends Document {
    userId: Types.ObjectId;
    levelId: string;
    isProcedural: boolean;
    starsEarned: number;
    completionTime?: number; // in seconds
    bestScore: number;
    lastAttempt: Date;
}

const LevelProgressSchema = new Schema<ILevelProgress>({
    userId: { type: Schema.Types.ObjectId, ref: 'PlayerProfile', required: true, index: true },
    levelId: { type: String, required: true },
    isProcedural: { type: Boolean, required: true, default: false },
    starsEarned: { type: Number, required: true, min: 0, max: 3, default: 0 },
    completionTime: { type: Number, min: 0 },
    bestScore: { type: Number, required: true, default: 0, min: 0 },
    lastAttempt: { type: Date, required: true },
}, { timestamps: true });

// Ensure a player has only one progress record per level
LevelProgressSchema.index({ userId: 1, levelId: 1 }, { unique: true });

export const LevelProgressModel = model<ILevelProgress>('LevelProgress', LevelProgressSchema);