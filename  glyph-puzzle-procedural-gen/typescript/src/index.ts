// Application Services
export { BackendProceduralLevelApplicationService } from './application/services/BackendProceduralLevelApplicationService';

// Application DTOs
export type { RecordGeneratedLevelDto } from './application/dtos/RecordGeneratedLevelDto';
export type { LevelReproductionDataDto } from './application/dtos/LevelReproductionDataDto';

// Domain Aggregates
export { StoredGeneratedLevel } from './domain/aggregates/StoredGeneratedLevel';

// Domain Core Types & Interfaces
export type { GenerationParameters } from './domain/core/GenerationParameters';
export type { GeneratedLevelData } from './domain/core/GeneratedLevelData';
export type { LevelSeed } from './domain/core/LevelSeed';
export type { LevelIdentifier } from './domain/core/LevelIdentifier';
export type { Point } from './domain/core/Point';
export type { GridDimensions } from './domain/core/GridDimensions';
export type { GlyphPlacement } from './domain/core/GlyphPlacement';
export type { ObstaclePlacement } from './domain/core/ObstaclePlacement';
export type { SolutionPath } from './domain/core/SolutionPath';

// Domain Interfaces (Ports)
export type { ILevelGenerationDataStore } from './domain/interfaces/ILevelGenerationDataStore';
export type { IRandomProvider } from './domain/interfaces/IRandomProvider';
export type { IPathfindingAdapter } from './domain/interfaces/IPathfindingAdapter';

// Domain Templates
export type { ILevelTemplate, InitialGridState } from './domain/templates/ILevelTemplate';

// Domain Services (if they need to be directly accessed, though typically used via Application Services)
// export { LevelGeneratorService } from './domain/services/LevelGeneratorService';
// export { SolvabilityValidatorService } from './domain/services/SolvabilityValidatorService';
// export { DifficultyScalerService } from './domain/services/DifficultyScalerService';

// Adapters (typically not exported directly from the library's main index, but used internally or for DI setup)
// export { SeedRandomAdapter } from './adapters/SeedRandomAdapter';
// export { PathfindingJsAdapter } from './adapters/PathfindingJsAdapter';

// Validation Schemas (can be useful for consumers if they need to validate data structures)
export * from './application/validation/schemas';