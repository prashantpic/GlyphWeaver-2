import { Schema, model, Document } from 'mongoose';

/**
 * @interface IZone
 * @description Represents a game zone, a collection of levels with shared complexity parameters.
 */
export interface IZone extends Document {
  name: string;
  description: string;
  unlockCondition: string; // e.g., 'complete_zone:zone_id' or 'player_level:10'
  gridMinSize: number;
  gridMaxSize: number;
  maxGlyphTypes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Zone name is required.'], 
    unique: true,
    trim: true,
  },
  description: { 
    type: String, 
    required: [true, 'Zone description is required.']
  },
  unlockCondition: { 
    type: String, 
    required: [true, 'Unlock condition is required.'] 
  },
  gridMinSize: { 
    type: Number, 
    required: [true, 'Grid minimum size is required.'],
    min: [3, 'Grid size must be at least 3.'],
  },
  gridMaxSize: { 
    type: Number, 
    required: [true, 'Grid maximum size is required.'],
    min: [3, 'Grid size must be at least 3.'],
  },
  maxGlyphTypes: { 
    type: Number, 
    required: [true, 'Maximum glyph types count is required.'],
    min: [1, 'Must have at least one glyph type.'],
  },
}, { 
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  versionKey: false, // Disables the __v versioning field
});

/**
 * @model Zone
 * @description Mongoose model for the Zone collection.
 */
export default model<IZone>('Zone', ZoneSchema);