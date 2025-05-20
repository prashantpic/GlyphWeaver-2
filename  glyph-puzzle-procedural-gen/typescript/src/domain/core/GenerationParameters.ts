import type { GridDimensions } from './GridDimensions';

/**
 * Defines parameters used for procedural level generation, such as grid size,
 * glyph types, difficulty, etc. Mirrored from C#.
 * REQ-CGLE-008, REQ-CGLE-011, REQ-CGLE-013
 */
export interface GenerationParameters {
  /**
   * The dimensions of the grid.
   */
  gridSize: GridDimensions;
  /**
   * The number of distinct glyph types to use. Must be positive.
   */
  numberOfGlyphTypes: number;
  /**
   * The minimum number of glyph pairs to generate. Must be positive.
   */
  minGlyphPairs: number;
  /**
   * The maximum number of glyph pairs to generate. Must be greater than or equal to minGlyphPairs.
   */
  maxGlyphPairs: number;
  /**
   * The maximum number of obstacles to place. Must be non-negative.
   */
  maxObstacles: number;
  /**
   * A list of allowed puzzle type identifiers. Cannot be empty.
   */
  allowedPuzzleTypes: string[];
  /**
   * The difficulty tier for generation. Must be non-negative.
   */
  difficultyTier: number;
}