import mongoose, { Document, Model, Schema } from 'mongoose';

const schemaOptions = {
  timestamps: true,
  versionKey: 'schemaVersion',
};

export interface GameConfiguration {
  configKey: string;
  configValue: any; // mongoose.Schema.Types.Mixed
  description?: string;
  isActive: boolean;
  lastUpdatedBy?: string;
  createdAt?: Date; // from timestamps
  updatedAt?: Date; // from timestamps
  schemaVersion?: number; // from versionKey
}

export interface GameConfigurationDocument extends GameConfiguration, Document {}

export interface GameConfigurationModel extends Model<GameConfigurationDocument> {}

const GameConfigurationSchema = new Schema<GameConfigurationDocument, GameConfigurationModel>({
  configKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  configValue: {
    type: Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUpdatedBy: {
    type: String,
    required: false,
  },
}, schemaOptions);

export default mongoose.model<GameConfigurationDocument, GameConfigurationModel>('GameConfiguration', GameConfigurationSchema);