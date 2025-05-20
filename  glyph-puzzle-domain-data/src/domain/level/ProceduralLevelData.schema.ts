import mongoose, { Document, Model, Schema } from 'mongoose';
// SolutionPath and GridDimensions would ideally be imported from a CustomTypes file
// For now, we use Mixed as specified in the SDS for flexibility

const schemaOptions = {
  timestamps: true,
  versionKey: 'schemaVersion',
};

export interface ProceduralLevelData {
  levelId: string;
  seed: string;
  generationParams: any; // mongoose.Schema.Types.Mixed
  solutionPaths: any[]; // Array of SolutionPath (mongoose.Schema.Types.Mixed)
  gridDimensions: any; // GridDimensions (mongoose.Schema.Types.Mixed)
  glyphData?: any; // mongoose.Schema.Types.Mixed
  obstacleData?: any; // mongoose.Schema.Types.Mixed
  createdAt?: Date; // from timestamps
  updatedAt?: Date; // from timestamps
  schemaVersion?: number; // from versionKey
}

export interface ProceduralLevelDataDocument extends ProceduralLevelData, Document {}

export interface ProceduralLevelDataModel extends Model<ProceduralLevelDataDocument> {}

const ProceduralLevelDataSchema = new Schema<ProceduralLevelDataDocument, ProceduralLevelDataModel>({
  levelId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  seed: {
    type: String,
    required: true,
    index: true,
  },
  generationParams: {
    type: Schema.Types.Mixed,
    required: true,
  },
  solutionPaths: {
    type: [Schema.Types.Mixed], // Array of SolutionPath
    required: true,
  },
  gridDimensions: { // GridDimensions type
    type: Schema.Types.Mixed,
    required: true,
  },
  glyphData: {
    type: Schema.Types.Mixed,
    required: false,
  },
  obstacleData: {
    type: Schema.Types.Mixed,
    required: false,
  },
}, schemaOptions);

export default mongoose.model<ProceduralLevelDataDocument, ProceduralLevelDataModel>('ProceduralLevelData', ProceduralLevelDataSchema);