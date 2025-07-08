import { Schema, model, Document, Types } from 'mongoose';
import { ILevel } from './Level.model';

/**
 * @interface IProceduralInstance
 * @description Stores a snapshot of a procedurally generated level for reproducibility.
 */
export interface IProceduralInstance extends Document {
  baseLevelId: Types.ObjectId | ILevel; // Ref to the template Level
  generationSeed: string;
  generationParameters: object;
  gridConfig: object; // Full generated level layout
  solutionPath: object;
  createdAt: Date;
  updatedAt: Date;
}

const ProceduralInstanceSchema: Schema = new Schema({
  baseLevelId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Level', 
    required: true 
  },
  generationSeed: { 
    type: String, 
    required: true,
    trim: true,
  },
  generationParameters: { 
    type: Object, 
    required: true 
  },
  gridConfig: { 
    type: Object, 
    required: true 
  },
  solutionPath: { 
    type: Object, 
    required: true 
  },
}, { 
  timestamps: true,
  versionKey: false,
});

/**
 * @model ProceduralInstance
 * @description Mongoose model for the ProceduralInstance collection.
 */
export default model<IProceduralInstance>('ProceduralInstance', ProceduralInstanceSchema);