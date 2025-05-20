import type { GridDimensions } from '../core/GridDimensions';
import type { GenerationParameters } from '../core/GenerationParameters';
import type { GlyphPlacement } from '../core/GlyphPlacement';
import type { ObstaclePlacement } from '../core/ObstaclePlacement';
import type { IRandomProvider } from '../interfaces/IRandomProvider';

/**
 * Represents the initial state of a grid after template initialization,
 * containing placed glyphs and obstacles before full solvability validation.
 */
export interface InitialGridState {
  glyphPlacements: GlyphPlacement[];
  obstaclePlacements: ObstaclePlacement[];
}

/**
 * Interface for level templates used in procedural generation,
 * allowing for different generation strategies on the backend.
 * REQ-CGLE-008
 */
export interface ILevelTemplate {
  /**
   * Sets up initial glyphs and obstacles based on template rules.
   * @param dimensions The dimensions of the grid.
   * @param parameters The generation parameters.
   * @param random The random number provider.
   * @returns The initial state of the grid with placed glyphs and obstacles.
   */
  initializeGrid(
    dimensions: GridDimensions,
    parameters: GenerationParameters,
    random: IRandomProvider
  ): InitialGridState;
}