import { GridDimensions } from './GridDimensions';
import { GlyphPlacement } from './GlyphPlacement';
import { ObstaclePlacement } from './ObstaclePlacement';
import { SolutionPath } from './SolutionPath';
import { LevelSeed } from './LevelSeed';
import { GenerationParameters } from './GenerationParameters';

/**
 * Core data structure representing a generated puzzle level for the backend.
 * Mirrored from C#.
 * Satisfies REQ-CGLE-008, REQ-CGLE-011, REQ-CGLE-013.
 */
export interface GeneratedLevelData {
  grid: GridDimensions;
  glyphPlacements: GlyphPlacement[];
  obstaclePlacements: ObstaclePlacement[];
  verifiedSolutionPaths: SolutionPath[];
  seedUsed: LevelSeed;
  parametersApplied: GenerationParameters;
}