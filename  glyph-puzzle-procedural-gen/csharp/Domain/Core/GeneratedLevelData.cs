using System.Collections.Generic;
using System.Linq;

namespace GlyphPuzzle.Procedural.Client.Domain.Core
{
    /// <summary>
    /// Entity representing a fully generated level, including its structure, seed, parameters, and solutions.
    /// Core data structure representing a generated puzzle level on the client, ready for gameplay.
    /// Satisfies REQ-CGLE-008, REQ-CGLE-011, REQ-CGLE-013.
    /// </summary>
    public class GeneratedLevelData
    {
        public GridDimensions Grid { get; }
        public IReadOnlyList<GlyphPlacement> GlyphPlacements { get; }
        public IReadOnlyList<ObstaclePlacement> ObstaclePlacements { get; }
        public IReadOnlyList<SolutionPath> VerifiedSolutionPaths { get; }
        public LevelSeed SeedUsed { get; }
        public GenerationParameters ParametersApplied { get; }

        public GeneratedLevelData(
            GridDimensions grid,
            IReadOnlyList<GlyphPlacement> glyphPlacements,
            IReadOnlyList<ObstaclePlacement> obstaclePlacements,
            IReadOnlyList<SolutionPath> verifiedSolutionPaths,
            LevelSeed seedUsed,
            GenerationParameters parametersApplied)
        {
            Grid = grid;
            GlyphPlacements = glyphPlacements ?? new List<GlyphPlacement>().AsReadOnly();
            ObstaclePlacements = obstaclePlacements ?? new List<ObstaclePlacement>().AsReadOnly();
            VerifiedSolutionPaths = verifiedSolutionPaths ?? new List<SolutionPath>().AsReadOnly();
            SeedUsed = seedUsed;
            ParametersApplied = parametersApplied;
        }
        
        // Optional: Method to create a new instance with updated solution paths, promoting immutability
        public GeneratedLevelData WithSolutionPaths(IReadOnlyList<SolutionPath> newSolutionPaths)
        {
            return new GeneratedLevelData(
                this.Grid,
                this.GlyphPlacements,
                this.ObstaclePlacements,
                newSolutionPaths,
                this.SeedUsed,
                this.ParametersApplied
            );
        }
    }
}