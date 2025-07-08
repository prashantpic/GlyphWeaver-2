import { Schema, model, Document, Types } from 'mongoose';
import { IZone } from './Zone.model';
// These imports are placeholders for models that will exist in other files/repositories
// Mongoose's `ref` property works with string names, so direct imports are not strictly necessary here.
// import { IGlyph } from './Glyph.model';
// import { IObstacle } from './Obstacle.model';
// import { IPuzzleType } from './PuzzleType.model';

/**
 * @interface ILevel
 * @description Represents a single game level, either hand-crafted or a procedural template.
 */
export interface ILevel extends Document {
    zoneId: Types.ObjectId | IZone;
    levelNumber: number;
    type: 'handcrafted' | 'procedural_template';
    gridSize: number;
    timeLimit?: number;
    moveLimit?: number;
    solutionPath?: object; // For handcrafted levels
    glyphs: Array<{ glyphId: Types.ObjectId; position: { x: number; y: number }; properties?: object }>;
    obstacles: Array<{ obstacleId: Types.ObjectId; position: { x: number; y: number }; }>;
    puzzleTypes: Array<Types.ObjectId>; // Ref to PuzzleType model
    createdAt: Date;
    updatedAt: Date;
}

const LevelSchema: Schema = new Schema({
    zoneId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Zone', 
        required: true, 
        index: true 
    },
    levelNumber: { 
        type: Number, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['handcrafted', 'procedural_template'], 
        required: true, 
        index: true 
    },
    gridSize: { 
        type: Number, 
        required: true 
    },
    timeLimit: { 
        type: Number,
        min: 0,
    },
    moveLimit: { 
        type: Number,
        min: 0,
    },
    solutionPath: { 
        type: Object 
    },
    glyphs: [{
        _id: false, // Do not create a separate _id for subdocuments
        glyphId: { type: Schema.Types.ObjectId, ref: 'Glyph', required: true },
        position: { 
            x: { type: Number, required: true },
            y: { type: Number, required: true },
        },
        properties: { type: Object }
    }],
    obstacles: [{
        _id: false,
        obstacleId: { type: Schema.Types.ObjectId, ref: 'Obstacle', required: true },
        position: { 
            x: { type: Number, required: true },
            y: { type: Number, required: true },
        }
    }],
    puzzleTypes: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'PuzzleType' 
    }]
}, { 
    timestamps: true,
    versionKey: false,
});

// Ensures that there's only one level with a given number within a specific zone.
LevelSchema.index({ zoneId: 1, levelNumber: 1 }, { unique: true });

/**
 * @model Level
 * @description Mongoose model for the Level collection.
 */
export default model<ILevel>('Level', LevelSchema);