using System;
using System.Collections.Generic;
using System.Linq;
using GlyphPuzzle.Procedural.Client.Domain.Core;
using GlyphPuzzle.Procedural.Client.Domain.Interfaces; // For IRandomProvider

namespace GlyphPuzzle.Procedural.Client.Domain.Templates.Concrete
{
    // This struct would typically be defined alongside ILevelTemplate or in Domain.Core
    // For REQ-CGLE-008
    public struct InitialGridState
    {
        public IReadOnlyList<GlyphPlacement> GlyphPlacements { get; }
        public IReadOnlyList<ObstaclePlacement> ObstaclePlacements { get; }

        public InitialGridState(IReadOnlyList<GlyphPlacement> glyphPlacements, IReadOnlyList<ObstaclePlacement> obstaclePlacements)
        {
            GlyphPlacements = glyphPlacements ?? new List<GlyphPlacement>().AsReadOnly();
            ObstaclePlacements = obstaclePlacements ?? new List<ObstaclePlacement>().AsReadOnly();
        }
    }

    /// <summary>
    /// Example concrete implementation of ILevelTemplate for generating path-based puzzles.
    /// Provides a specific strategy for generating path puzzle levels.
    /// Implements REQ-CGLE-008.
    /// </summary>
    public class PathPuzzleTemplate : ILevelTemplate
    {
        public InitialGridState InitializeGrid(
            GridDimensions dimensions,
            GenerationParameters parameters,
            IRandomProvider randomProvider)
        {
            var placedGlyphs = new List<GlyphPlacement>();
            var placedObstacles = new List<ObstaclePlacement>();
            var occupiedPositions = new HashSet<Point>();

            // 1. Place Obstacles
            int numberOfObstaclesToPlace = randomProvider.Next(0, parameters.MaxObstacles + 1);
            for (int i = 0; i < numberOfObstaclesToPlace; i++)
            {
                Point obstaclePos;
                int attempts = 0;
                do
                {
                    obstaclePos = new Point(
                        randomProvider.Next(0, dimensions.Columns),
                        randomProvider.Next(0, dimensions.Rows)
                    );
                    attempts++;
                } while (occupiedPositions.Contains(obstaclePos) && attempts < 50); // Avoid infinite loop

                if (!occupiedPositions.Contains(obstaclePos))
                {
                    // For simplicity, using a generic "Wall" obstacle type.
                    // This could be configurable via GenerationParameters.
                    placedObstacles.Add(new ObstaclePlacement("Wall", obstaclePos));
                    occupiedPositions.Add(obstaclePos);
                }
            }

            // 2. Place Glyph Pairs
            int numberOfGlyphPairsToPlace = randomProvider.Next(parameters.MinGlyphPairs, parameters.MaxGlyphPairs + 1);
            int glyphTypeCount = parameters.NumberOfGlyphTypes; // Max distinct glyph types to use.

            for (int pairId = 1; pairId <= numberOfGlyphPairsToPlace; pairId++)
            {
                // Select a glyph type. For simplicity, cycle through types or pick randomly.
                string glyphType = $"Type{(pairId % glyphTypeCount) + 1}";

                Point startGlyphPos;
                Point endGlyphPos;
                int attempts = 0;

                // Find position for the first glyph in the pair
                do
                {
                    startGlyphPos = new Point(
                        randomProvider.Next(0, dimensions.Columns),
                        randomProvider.Next(0, dimensions.Rows)
                    );
                    attempts++;
                } while (occupiedPositions.Contains(startGlyphPos) && attempts < 50);

                if (occupiedPositions.Contains(startGlyphPos)) continue; // Failed to place first glyph

                placedGlyphs.Add(new GlyphPlacement(glyphType, startGlyphPos, pairId));
                occupiedPositions.Add(startGlyphPos);

                attempts = 0; // Reset attempts for the second glyph

                // Find position for the second glyph in the pair
                // This basic placement doesn't guarantee connectivity, which is
                // the job of the SolvabilityValidator. Templates can be smarter.
                do
                {
                    endGlyphPos = new Point(
                        randomProvider.Next(0, dimensions.Columns),
                        randomProvider.Next(0, dimensions.Rows)
                    );
                    attempts++;
                } while (occupiedPositions.Contains(endGlyphPos) && attempts < 50);

                if (occupiedPositions.Contains(endGlyphPos))
                {
                    // Could not place the second glyph, might lead to an unsolvable pair.
                    // A more robust template might try to remove the first glyph of this pair
                    // or implement more sophisticated placement ensuring separation or potential path.
                    // For now, we rely on the SolvabilityValidator to catch this.
                    // To be safe, remove the first glyph if the second cannot be placed.
                    occupiedPositions.Remove(startGlyphPos);
                    placedGlyphs.RemoveAt(placedGlyphs.Count - 1); // remove the last added (startGlyphPos)
                    continue;
                }

                placedGlyphs.Add(new GlyphPlacement(glyphType, endGlyphPos, pairId));
                occupiedPositions.Add(endGlyphPos);
            }

            return new InitialGridState(placedGlyphs.AsReadOnly(), placedObstacles.AsReadOnly());
        }
    }
}