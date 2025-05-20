using System.Collections.Generic;
using System.Linq;
using GlyphPuzzle.Procedural.Client.Domain.Core;
using GlyphPuzzle.Procedural.Client.Domain.Interfaces;

namespace GlyphPuzzle.Procedural.Client.Domain.Services
{
    // Placeholder for C# Pathfinding parameters if not defined globally
    // These would typically be defined in a shared location or near IPathfindingService
    public class GridSetup
    {
        public GridDimensions Dimensions { get; }
        public IReadOnlyList<ObstaclePlacement> Obstacles { get; }
        public IReadOnlyList<GlyphPlacement> Glyphs { get; } // Pathfinding might need to know about glyphs if they are also obstacles or have special properties

        public GridSetup(GridDimensions dimensions, IReadOnlyList<ObstaclePlacement> obstacles, IReadOnlyList<GlyphPlacement> glyphs)
        {
            Dimensions = dimensions;
            Obstacles = obstacles ?? new List<ObstaclePlacement>();
            Glyphs = glyphs ?? new List<GlyphPlacement>();
        }
    }

    public class PathfindingConstraints
    {
        // Example: public bool AllowDiagonal { get; }
        // public PathfindingConstraints(bool allowDiagonal) { AllowDiagonal = allowDiagonal; }
        // Add other constraints as needed by the pathfinding algorithm
    }

    /// <summary>
    /// Domain service to validate if a generated level is solvable using pathfinding algorithms
    /// and to find solution paths.
    /// Implements parts of REQ-CGLE-008, REQ-CGLE-011.
    /// </summary>
    public class SolvabilityValidator
    {
        /// <summary>
        /// Checks if a level is solvable by finding paths for all glyph pairs.
        /// </summary>
        /// <param name="levelData">The generated level data to validate.</param>
        /// <param name="pathfinder">The pathfinding service implementation.</param>
        /// <returns>True if all glyph pairs are solvable, false otherwise.</returns>
        public bool IsSolvable(GeneratedLevelData levelData, IPathfindingService pathfinder)
        {
            if (levelData == null) throw new System.ArgumentNullException(nameof(levelData));
            if (pathfinder == null) throw new System.ArgumentNullException(nameof(pathfinder));

            var glyphPairs = GetGlyphPairs(levelData.GlyphPlacements);
            if (!glyphPairs.Any() && levelData.GlyphPlacements.Any(gp => gp.PairId > 0))
            {
                 // If there are glyphs intended to be pairs but no valid pairs were formed (e.g. orphaned glyphs)
                 return false;
            }
            if (!glyphPairs.Any()) // No pairs to solve, technically solvable if that's allowed by game rules.
            {
                return true;
            }

            GridSetup gridSetup = new GridSetup(levelData.Grid, levelData.ObstaclePlacements, levelData.GlyphPlacements);
            PathfindingConstraints constraints = new PathfindingConstraints(); // Default constraints

            foreach (var pair in glyphPairs)
            {
                var path = pathfinder.FindPath(pair.Item1.Position, pair.Item2.Position, gridSetup, constraints);
                if (path == null || !path.Any())
                {
                    return false; // A pair is unsolvable
                }
            }
            return true;
        }

        /// <summary>
        /// Finds solution paths for all glyph pairs in a level.
        /// </summary>
        /// <param name="levelData">The generated level data.</param>
        /// <param name="pathfinder">The pathfinding service implementation.</param>
        /// <returns>A list of SolutionPath objects for each solvable pair. Returns an empty list if no paths are found or no pairs exist.</returns>
        public IReadOnlyList<SolutionPath> FindSolutionPaths(GeneratedLevelData levelData, IPathfindingService pathfinder)
        {
            if (levelData == null) throw new System.ArgumentNullException(nameof(levelData));
            if (pathfinder == null) throw new System.ArgumentNullException(nameof(pathfinder));

            var solutions = new List<SolutionPath>();
            var glyphPairs = GetGlyphPairs(levelData.GlyphPlacements);

            if (!glyphPairs.Any())
            {
                return solutions; // No pairs to find paths for
            }

            GridSetup gridSetup = new GridSetup(levelData.Grid, levelData.ObstaclePlacements, levelData.GlyphPlacements);
            PathfindingConstraints constraints = new PathfindingConstraints(); // Default constraints

            foreach (var pair in glyphPairs)
            {
                var pathPoints = pathfinder.FindPath(pair.Item1.Position, pair.Item2.Position, gridSetup, constraints);
                if (pathPoints != null && pathPoints.Any())
                {
                    solutions.Add(new SolutionPath(pathPoints, pair.Item1.PairId));
                }
                // If a path is not found for a pair, it's up to the caller (e.g., Facade)
                // to decide if this makes the level invalid. This method just returns paths it *can* find.
                // For strict solvability where all pairs *must* have a path, the IsSolvable check should be primary.
            }
            return solutions;
        }

        private IEnumerable<(GlyphPlacement, GlyphPlacement)> GetGlyphPairs(IReadOnlyList<GlyphPlacement> glyphPlacements)
        {
            if (glyphPlacements == null || !glyphPlacements.Any())
            {
                return Enumerable.Empty<(GlyphPlacement, GlyphPlacement)>();
            }

            return glyphPlacements
                .Where(g => g.PairId > 0) // Consider only glyphs that are part of a pair
                .GroupBy(g => g.PairId)
                .Where(group => group.Count() == 2) // Ensure they are actual pairs
                .Select(group => (group.First(), group.Last()));
        }
    }
}