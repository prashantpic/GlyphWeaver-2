import mongoose, { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a Procedural Level document in MongoDB.
 * It extends Mongoose's Document interface and includes all fields
 * from the procedural level schema.
 */
export interface IProceduralLevel extends Document {
  playerId: mongoose.Schema.Types.ObjectId;
  baseLevelId: string;
  generationSeed: string;
  generationParameters: Record<string, any>;
  solutionPath: Record<string, any>;
  complexityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for the `procedurallevels` collection.
 * Defines the structure, data types, and constraints for procedural level documents.
 */
const proceduralLevelSchema = new Schema<IProceduralLevel>(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'PlayerProfile', // As per the database design
      required: true,
    },
    baseLevelId: {
      type: String,
      required: true,
    },
    generationSeed: {
      type: String,
      required: true,
    },
    generationParameters: {
      type: Object,
      required: true,
    },
    solutionPath: {
      type: Object,
      required: true,
    },
    complexityScore: {
      type: Number,
      required: true,
    },
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` fields.
     */
    timestamps: true,
    collection: 'procedurallevels',
  }
);

// Define indexes for efficient querying as per the SDS.
proceduralLevelSchema.index({ playerId: 1 });
proceduralLevelSchema.index({ baseLevelId: 1 });

/**
 * The compiled Mongoose model for ProceduralLevel documents.
 */
const ProceduralLevel = model<IProceduralLevel>('ProceduralLevel', proceduralLevelSchema);

export default ProceduralLevel;