import { z } from 'zod';
// Assuming these types are imported from their respective /domain/core files
// For this standalone snippet, we'll define minimal versions or use z.any() if full def is complex.
// However, the prompt asks for Zod schemas for specific DTOs/core structures,
// so we'll assume the imported types are available.

// Import domain core types to ensure Zod types match them.
// These paths are illustrative and should match your project structure.
import { Point } from '../../domain/core/Point';
import { GridDimensions } from '../../domain/core/GridDimensions';
import { GlyphPlacement } from '../../domain/core/GlyphPlacement';
import { ObstaclePlacement } from '../../domain/core/ObstaclePlacement';
import { SolutionPath } from '../../domain/core/SolutionPath';
import { LevelSeed } from '../../domain/core/LevelSeed'; // type LevelSeed = string;
import { GenerationParameters } from '../../domain/core/GenerationParameters';
import { GeneratedLevelData } from '../../domain/core/GeneratedLevelData';
import { RecordGeneratedLevelDto } from '../dtos/RecordGeneratedLevelDto';
import { LevelIdentifier } from '../../domain/core/LevelIdentifier'; // type LevelIdentifier = string;


// Helper Schemas (could be in their respective domain/core Zod definition files if preferred)
const PointSchema = z.object({
    x: z.number().int({ message: "Point.x must be an integer." }),
    y: z.number().int({ message: "Point.y must be an integer." }),
});

const GridDimensionsSchema = z.object({
    rows: z.number().int().positive({ message: "GridDimensions.rows must be a positive integer." }),
    columns: z.number().int().positive({ message: "GridDimensions.columns must be a positive integer." }),
});

const GlyphPlacementSchema = z.object({
    glyphType: z.string().min(1, { message: "GlyphPlacement.glyphType cannot be empty." }),
    position: PointSchema,
    pairId: z.number().int().nonnegative({ message: "GlyphPlacement.pairId must be a non-negative integer." }),
});

const ObstaclePlacementSchema = z.object({
    obstacleType: z.string().min(1, { message: "ObstaclePlacement.obstacleType cannot be empty." }),
    position: PointSchema,
});

const SolutionPathSchema = z.object({
    pathPoints: z.array(PointSchema).min(2, { message: "SolutionPath.pathPoints must contain at least two points." }), // A path needs at least a start and an end
    glyphPairId: z.number().int().nonnegative({ message: "SolutionPath.glyphPairId must be a non-negative integer." }),
});

const LevelSeedSchema = z.string().min(1, { message: "LevelSeed cannot be empty." });
const LevelIdentifierSchema = z.string().uuid({ message: "LevelIdentifier must be a valid UUID." });


// Exported Schemas as per CodeFileDefinition
export const GenerationParametersSchema: z.ZodType<GenerationParameters> = z.object({
    gridSize: GridDimensionsSchema,
    numberOfGlyphTypes: z.number().int().positive({ message: "GenerationParameters.numberOfGlyphTypes must be a positive integer." }),
    minGlyphPairs: z.number().int().positive({ message: "GenerationParameters.minGlyphPairs must be a positive integer." }),
    maxGlyphPairs: z.number().int().positive({ message: "GenerationParameters.maxGlyphPairs must be a positive integer." }),
    maxObstacles: z.number().int().nonnegative({ message: "GenerationParameters.maxObstacles must be a non-negative integer." }),
    allowedPuzzleTypes: z.array(z.string().min(1, { message: "Allowed puzzle type cannot be empty." })).min(1, { message: "GenerationParameters.allowedPuzzleTypes must contain at least one type." }),
    difficultyTier: z.number().int().nonnegative({ message: "GenerationParameters.difficultyTier must be a non-negative integer." }),
}).refine(data => data.maxGlyphPairs >= data.minGlyphPairs, {
    message: "MaxGlyphPairs must be greater than or equal to MinGlyphPairs.",
    path: ["maxGlyphPairs"], // Path of the error
});

export const GeneratedLevelDataSchema: z.ZodType<GeneratedLevelData> = z.object({
    grid: GridDimensionsSchema,
    glyphPlacements: z.array(GlyphPlacementSchema),
    obstaclePlacements: z.array(ObstaclePlacementSchema),
    verifiedSolutionPaths: z.array(SolutionPathSchema),
    seedUsed: LevelSeedSchema,
    parametersApplied: GenerationParametersSchema,
});

export const RecordGeneratedLevelDtoSchema: z.ZodType<RecordGeneratedLevelDto> = z.object({
    levelId: LevelIdentifierSchema,
    seed: LevelSeedSchema,
    parameters: GenerationParametersSchema,
    solutions: z.array(SolutionPathSchema),
});

// Example usage for other DTOs if needed in the future, not part of current request:
// import { LevelReproductionDataDto } from '../dtos/LevelReproductionDataDto';
// export const LevelReproductionDataDtoSchema: z.ZodType<LevelReproductionDataDto> = z.object({
//     levelId: LevelIdentifierSchema,
//     seed: LevelSeedSchema,
//     parameters: GenerationParametersSchema,
//     solutions: z.array(SolutionPathSchema),
// });