import { GenerationParameters } from '../core/GenerationParameters';

/**
 * Backend domain service for difficulty scaling.
 * Mirrors C# logic for REQ-CGLE-013.
 * To manage the difficulty curve of procedurally generated levels on the backend.
 */
export class DifficultyScalerService {
  /**
   * Adjusts level generation parameters based on player progression.
   * @param baseParameters The base parameters to scale from.
   * @param progressionContext Player's current progression data: { currentZone: number, proceduralLevelsCompleted: number }.
   * @returns A new GenerationParameters object with scaled values.
   */
  public scaleParameters(
    baseParameters: GenerationParameters,
    progressionContext: { currentZone: number; proceduralLevelsCompleted: number }
  ): GenerationParameters {
    // Example scaling logic:
    // This is a placeholder. Actual scaling logic would be more sophisticated.

    let newNumberOfGlyphTypes = baseParameters.numberOfGlyphTypes;
    let newMinGlyphPairs = baseParameters.minGlyphPairs;
    let newMaxGlyphPairs = baseParameters.maxGlyphPairs;
    let newMaxObstacles = baseParameters.maxObstacles;
    let newDifficultyTier = baseParameters.difficultyTier;

    // Scale based on CurrentZone
    if (progressionContext.currentZone > 1) {
      newNumberOfGlyphTypes = Math.min(
        baseParameters.numberOfGlyphTypes + Math.floor(progressionContext.currentZone / 2),
        10 // Max 10 types
      );
      newMinGlyphPairs = Math.min(
        baseParameters.minGlyphPairs + Math.floor(progressionContext.currentZone / 2),
        8 // Max 8 min pairs
      );
      newMaxGlyphPairs = Math.min(
        baseParameters.maxGlyphPairs + progressionContext.currentZone,
        12 // Max 12 max pairs
      );
    }

    // Scale based on ProceduralLevelsCompleted
    if (progressionContext.proceduralLevelsCompleted > 0) {
      newMaxObstacles = Math.min(
        baseParameters.maxObstacles + Math.floor(progressionContext.proceduralLevelsCompleted / 5),
        15 // Max 15 obstacles
      );
      newDifficultyTier = Math.min(
        baseParameters.difficultyTier + Math.floor(progressionContext.proceduralLevelsCompleted / 10),
        5 // Max tier 5
      );
    }
    
    // Ensure MinGlyphPairs is not greater than MaxGlyphPairs
    if (newMinGlyphPairs > newMaxGlyphPairs) {
        newMinGlyphPairs = newMaxGlyphPairs;
    }
    
    return {
      ...baseParameters, // Spread to copy other properties like gridSize and allowedPuzzleTypes
      numberOfGlyphTypes: newNumberOfGlyphTypes,
      minGlyphPairs: newMinGlyphPairs,
      maxGlyphPairs: newMaxGlyphPairs,
      maxObstacles: newMaxObstacles,
      difficultyTier: newDifficultyTier,
    };
  }
}