using System.Collections.Generic;
using GlyphPuzzle.Procedural.Client.Domain.Core;
using GlyphPuzzle.Procedural.Client.Domain.Templates;
using GlyphPuzzle.Procedural.Client.Domain.Interfaces;

namespace GlyphPuzzle.Procedural.Client.Domain.Services
{
    /// <summary>
    /// Core domain service responsible for generating levels based on templates, parameters, and a seed.
    /// Orchestrates the generation process.
    /// Implements REQ-CGLE-008, REQ-CGLE-013.
    /// </summary>
    public class LevelGenerator
    {
        /// <summary>
        /// Orchestrates the generation process using the selected template and randomness.
        /// </summary>
        /// <param name="parameters">The parameters guiding generation.</param>
        /// <param name="seed">The seed for the random number generator.</param>
        /// <param name="template">The level template to use.</param>
        /// <param name="randomProvider">The random number provider.</param>
        /// <returns>GeneratedLevelData containing the level structure, seed, and parameters. VerifiedSolutionPaths will be empty at this stage.</returns>
        public GeneratedLevelData Generate(
            GenerationParameters parameters,
            LevelSeed seed,
            ILevelTemplate template,
            IRandomProvider randomProvider)
        {
            if (parameters == null) throw new System.ArgumentNullException(nameof(parameters));
            if (template == null) throw new System.ArgumentNullException(nameof(template));
            if (randomProvider == null) throw new System.ArgumentNullException(nameof(randomProvider));
            // Seed can be null if LevelSeed allows it, but typical usage implies it's provided.
            // Assuming LevelSeed constructor handles validation if seed.Value cannot be null/empty.

            randomProvider.Initialize(seed);

            InitialGridState initialGridState = template.InitializeGrid(parameters.GridSize, parameters, randomProvider);

            // At this stage, VerifiedSolutionPaths are not yet determined.
            // They will be populated by the SolvabilityValidator.
            var generatedLevel = new GeneratedLevelData(
                parameters.GridSize,
                initialGridState.GlyphPlacements,
                initialGridState.ObstaclePlacements,
                new List<SolutionPath>(), // Empty list for solutions initially
                seed,
                parameters
            );

            return generatedLevel;
        }
    }
}