using System.Collections.Generic;
using GlyphPuzzle.Procedural.Client.Domain.Core;
using GlyphPuzzle.Procedural.Client.Domain.Interfaces;

namespace GlyphPuzzle.Procedural.Client.Domain.Templates
{
    /// <summary>
    /// Represents the initial state of a grid after template initialization,
    /// containing placed glyphs and obstacles before full solvability validation.
    /// </summary>
    public class InitialGridState
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
    /// Interface for level templates used in procedural generation,
    /// allowing for different generation strategies.
    /// REQ-CGLE-008
    /// </summary>
    public interface ILevelTemplate
    {
        /// <summary>
        /// Sets up initial glyphs, obstacles based on template rules.
        /// </summary>
        /// <param name="dimensions">The dimensions of the grid.</param>
        /// <param name="parameters">The generation parameters.</param>
        /// <param name="randomProvider">The random number provider.</param>
        /// <returns>The initial state of the grid with placed glyphs and obstacles.</returns>
        InitialGridState InitializeGrid(GridDimensions dimensions, GenerationParameters parameters, IRandomProvider randomProvider);
    }
}