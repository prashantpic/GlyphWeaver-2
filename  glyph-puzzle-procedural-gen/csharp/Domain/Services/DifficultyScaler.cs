using System;
using GlyphPuzzle.Procedural.Client.Domain.Core;
using GlyphPuzzle.Procedural.Client.Application.DTOs; // Assuming DTO is in Application layer

namespace GlyphPuzzle.Procedural.Client.Domain.Services
{
    /// <summary>
    /// Domain service to adjust level generation parameters to provide a gradual increase in difficulty.
    /// Implements REQ-CGLE-013.
    /// To manage the difficulty curve of procedurally generated levels by adjusting generation parameters.
    /// </summary>
    public class DifficultyScaler
    {
        /// <summary>
        /// Adjusts level generation parameters based on player progression.
        /// </summary>
        /// <param name="baseParameters">The base parameters to scale from.</param>
        /// <param name="progressionContext">Player's current progression data.</param>
        /// <returns>A new GenerationParameters object with scaled values.</returns>
        public GenerationParameters ScaleParameters(
            GenerationParameters baseParameters,
            PlayerProgressionContextDto progressionContext)
        {
            // Example scaling logic:
            // This is a placeholder. Actual scaling logic would be more sophisticated,
            // potentially using curves, zone-specific rules, etc.

            int newNumberOfGlyphTypes = baseParameters.NumberOfGlyphTypes;
            int newMinGlyphPairs = baseParameters.MinGlyphPairs;
            int newMaxGlyphPairs = baseParameters.MaxGlyphPairs;
            int newMaxObstacles = baseParameters.MaxObstacles;
            int newDifficultyTier = baseParameters.DifficultyTier;

            // Scale based on CurrentZone
            if (progressionContext.CurrentZone > 1)
            {
                newNumberOfGlyphTypes = Math.Min(baseParameters.NumberOfGlyphTypes + progressionContext.CurrentZone / 2, 10); // Max 10 types
                newMinGlyphPairs = Math.Min(baseParameters.MinGlyphPairs + progressionContext.CurrentZone / 2, 8); // Max 8 min pairs
                newMaxGlyphPairs = Math.Min(baseParameters.MaxGlyphPairs + progressionContext.CurrentZone, 12); // Max 12 max pairs
            }

            // Scale based on ProceduralLevelsCompleted
            if (progressionContext.ProceduralLevelsCompleted > 0)
            {
                newMaxObstacles = Math.Min(baseParameters.MaxObstacles + progressionContext.ProceduralLevelsCompleted / 5, 15); // Max 15 obstacles
                newDifficultyTier = Math.Min(baseParameters.DifficultyTier + progressionContext.ProceduralLevelsCompleted / 10, 5); // Max tier 5
            }
            
            // Ensure MinGlyphPairs is not greater than MaxGlyphPairs
            if (newMinGlyphPairs > newMaxGlyphPairs)
            {
                newMinGlyphPairs = newMaxGlyphPairs;
            }

            return new GenerationParameters(
                baseParameters.GridSize, // Grid size could also be scaled
                newNumberOfGlyphTypes,
                newMinGlyphPairs,
                newMaxGlyphPairs,
                newMaxObstacles,
                baseParameters.AllowedPuzzleTypes, // Allowed puzzle types could be filtered
                newDifficultyTier
            );
        }
    }
}