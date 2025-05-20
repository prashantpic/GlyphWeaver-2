import { GenerationParameters } from '../core/GenerationParameters';
import { LevelSeed } from '../core/LevelSeed';
import { GeneratedLevelData } from '../core/GeneratedLevelData';
import { ILevelTemplate, InitialGridState } from '../templates/ILevelTemplate';
import { IRandomProvider } from '../interfaces/IRandomProvider';
import { SolutionPath } from '../core/SolutionPath';

/**
 * Backend domain service for generating levels. Mirrors C# logic.
 * Implements REQ-CGLE-008, REQ-CGLE-013.
 */
export class LevelGeneratorService {
    /**
     * Orchestrates the procedural generation of game levels on the backend.
     * @param parameters The parameters guiding generation.
     * @param seed The seed for the random number generator.
     * @param template The level template to use.
     * @param randomProvider The random number provider.
     * @returns GeneratedLevelData containing the level structure, seed, and parameters. VerifiedSolutionPaths will be empty at this stage.
     */
    public generate(
        parameters: GenerationParameters,
        seed: LevelSeed,
        template: ILevelTemplate,
        randomProvider: IRandomProvider
    ): GeneratedLevelData {
        if (!parameters) throw new Error("GenerationParameters are required.");
        if (seed === null || seed === undefined) throw new Error("LevelSeed is required."); // Assuming seed cannot be empty
        if (!template) throw new Error("ILevelTemplate is required.");
        if (!randomProvider) throw new Error("IRandomProvider is required.");

        randomProvider.initialize(seed);

        const initialGridState: InitialGridState = template.initializeGrid(
            parameters.gridSize,
            parameters,
            randomProvider
        );

        // At this stage, VerifiedSolutionPaths are not yet determined.
        // They will be populated by the SolvabilityValidatorService.
        const generatedLevel: GeneratedLevelData = {
            grid: parameters.gridSize,
            glyphPlacements: initialGridState.glyphPlacements,
            obstaclePlacements: initialGridState.obstaclePlacements,
            verifiedSolutionPaths: [] as SolutionPath[], // Empty array for solutions initially
            seedUsed: seed,
            parametersApplied: parameters,
        };

        return generatedLevel;
    }
}