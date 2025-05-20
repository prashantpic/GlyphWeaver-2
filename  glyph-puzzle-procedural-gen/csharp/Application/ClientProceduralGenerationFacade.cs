using System;
using System.Collections.Generic;
using System.Linq;
using GlyphPuzzle.Procedural.Client.Domain.Core;
using GlyphPuzzle.Procedural.Client.Domain.Services;
using GlyphPuzzle.Procedural.Client.Domain.Interfaces;
using GlyphPuzzle.Procedural.Client.Domain.Templates; // Assuming ILevelTemplate might be here or in .Interfaces
using GlyphPuzzle.Procedural.Client.Application.DTOs;

namespace GlyphPuzzle.Procedural.Client.Application
{
    /// <summary>
    /// Facade class providing a simple interface for the Unity client to access procedural level generation functionalities.
    /// Orchestrates domain services.
    /// Implements REQ-CGLE-008 (Procedural Generation), REQ-CGLE-011 (Solvability, Seeds), REQ-CGLE-013 (Difficulty Scaling).
    /// </summary>
    public class ClientProceduralGenerationFacade
    {
        private readonly DifficultyScaler _difficultyScaler;
        private readonly LevelGenerator _levelGenerator;
        private readonly SolvabilityValidator _solvabilityValidator;
        private readonly ILevelTemplate _levelTemplate; // Assuming a specific template strategy is injected
        private readonly IRandomProvider _randomProvider;
        private readonly IPathfindingService _pathfindingService;
        private readonly GenerationParameters _baseGenerationParameters;

        private const int MaxGenerationRetries = 10;

        public ClientProceduralGenerationFacade(
            DifficultyScaler difficultyScaler,
            LevelGenerator levelGenerator,
            SolvabilityValidator solvabilityValidator,
            ILevelTemplate levelTemplate,
            IRandomProvider randomProvider,
            IPathfindingService pathfindingService,
            GenerationParameters baseGenerationParameters)
        {
            _difficultyScaler = difficultyScaler ?? throw new ArgumentNullException(nameof(difficultyScaler));
            _levelGenerator = levelGenerator ?? throw new ArgumentNullException(nameof(levelGenerator));
            _solvabilityValidator = solvabilityValidator ?? throw new ArgumentNullException(nameof(solvabilityValidator));
            _levelTemplate = levelTemplate ?? throw new ArgumentNullException(nameof(levelTemplate));
            _randomProvider = randomProvider ?? throw new ArgumentNullException(nameof(randomProvider));
            _pathfindingService = pathfindingService ?? throw new ArgumentNullException(nameof(pathfindingService));
            _baseGenerationParameters = baseGenerationParameters ?? throw new ArgumentNullException(nameof(baseGenerationParameters));
        }

        /// <summary>
        /// Generates a new procedural level based on player progression and an optional seed.
        /// Ensures the generated level is solvable.
        /// </summary>
        /// <param name="progressionContext">Player's current progression data.</param>
        /// <param name="optionalSeed">An optional seed to reproduce a level. If null or empty, a new seed is generated.</param>
        /// <returns>A GeneratedLevelData object representing the solvable level.</returns>
        /// <exception cref="InvalidOperationException">Thrown if a solvable level cannot be generated after maximum retries.</exception>
        public GeneratedLevelData GenerateNewLevel(PlayerProgressionContextDto progressionContext, string optionalSeed = null)
        {
            // REQ-CGLE-013: Scale difficulty
            GenerationParameters scaledParameters = _difficultyScaler.ScaleParameters(_baseGenerationParameters, progressionContext);

            LevelSeed currentSeed;
            if (!string.IsNullOrEmpty(optionalSeed))
            {
                currentSeed = new LevelSeed(optionalSeed);
            }
            else
            {
                currentSeed = new LevelSeed(Guid.NewGuid().ToString());
            }
            _randomProvider.Initialize(currentSeed); // REQ-CGLE-011: Use seed

            GeneratedLevelData initialLevelData;
            bool isSolvable = false;
            int retries = 0;

            do
            {
                // REQ-CGLE-008: Implement procedural generation
                // Generate initial layout (glyphs, obstacles). VerifiedSolutionPaths will be empty initially.
                initialLevelData = _levelGenerator.Generate(scaledParameters, currentSeed, _levelTemplate, _randomProvider);

                // REQ-CGLE-011: Ensure solvability
                isSolvable = _solvabilityValidator.IsSolvable(initialLevelData, _pathfindingService);

                if (isSolvable)
                {
                    break;
                }

                retries++;
                if (retries >= MaxGenerationRetries)
                {
                    // Optionally log: Console.WriteLine($"Warning: Failed to generate a solvable level with seed {currentSeed.Value}. Retrying ({retries}/{MaxGenerationRetries})...");
                    // Or throw immediately if optionalSeed was provided and failed.
                    // For now, we throw after all retries regardless of initial seed.
                    throw new InvalidOperationException($"Failed to generate a solvable level after {MaxGenerationRetries} attempts. Last seed tried: {currentSeed.Value}.");
                }

                // Prepare for retry: generate new seed and re-initialize
                currentSeed = new LevelSeed(Guid.NewGuid().ToString());
                _randomProvider.Initialize(currentSeed);

            } while (retries < MaxGenerationRetries);

            // If we reach here, isSolvable must be true.
            // REQ-CGLE-011: Find solution paths
            IReadOnlyList<SolutionPath> verifiedSolutionPaths = _solvabilityValidator.FindSolutionPaths(initialLevelData, _pathfindingService);

            // Create the final GeneratedLevelData with all information including solutions
            GeneratedLevelData finalLevelData = new GeneratedLevelData(
                initialLevelData.Grid,
                initialLevelData.GlyphPlacements,
                initialLevelData.ObstaclePlacements,
                verifiedSolutionPaths,
                currentSeed, // The seed that resulted in a solvable level
                scaledParameters
            );

            return finalLevelData;
        }
    }
}