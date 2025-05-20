import { v4 as uuidv4 } from 'uuid'; // Ensure 'uuid' and '@types/uuid' are in package.json
import { RecordGeneratedLevelDto } from '../dtos/RecordGeneratedLevelDto';
import { LevelReproductionDataDto } from '../dtos/LevelReproductionDataDto';
import { StoredGeneratedLevel } from '../../domain/aggregates/StoredGeneratedLevel';
import { ILevelGenerationDataStore } from '../../domain/interfaces/ILevelGenerationDataStore';
import { DifficultyScalerService } from '../../domain/services/DifficultyScalerService';
import { LevelGeneratorService } from '../../domain/services/LevelGeneratorService';
import { SolvabilityValidatorService } from '../../domain/services/SolvabilityValidatorService';
import { ILevelTemplate } from '../../domain/templates/ILevelTemplate';
import { IRandomProvider } from '../../domain/interfaces/IRandomProvider';
import { IPathfindingAdapter } from '../../domain/interfaces/IPathfindingAdapter';
import { LevelIdentifier } from '../../domain/core/LevelIdentifier';
import { GeneratedLevelData } from '../../domain/core/GeneratedLevelData';
import { LevelSeed } from '../../domain/core/LevelSeed';
import { SolutionPath } from '../../domain/core/SolutionPath';
import { GenerationParameters } from '../../domain/core/GenerationParameters';
import { RecordGeneratedLevelDtoSchema } from '../validation/schemas'; // Assuming GenerationParametersSchema is also used internally or by services

// REQ-CGLE-008, REQ-CGLE-011, REQ-CGLE-013

const MAX_GENERATION_RETRIES = 5;
const BASE_GENERATION_PARAMETERS: GenerationParameters = {
    gridSize: { rows: 8, columns: 8 },
    numberOfGlyphTypes: 3,
    minGlyphPairs: 2,
    maxGlyphPairs: 3,
    maxObstacles: 10,
    allowedPuzzleTypes: ['PathPuzzle'], // Example, should align with available ILevelTemplate
    difficultyTier: 0,
};

export class BackendProceduralLevelApplicationService {
    constructor(
        private readonly levelGenerationDataStore: ILevelGenerationDataStore,
        private readonly difficultyScalerService: DifficultyScalerService,
        private readonly levelGeneratorService: LevelGeneratorService,
        private readonly solvabilityValidatorService: SolvabilityValidatorService,
        private readonly randomProvider: IRandomProvider,
        private readonly pathfindingAdapter: IPathfindingAdapter,
        private readonly defaultLevelTemplate: ILevelTemplate // Assuming a default or mechanism to select
    ) {}

    /**
     * Records an already generated level's data.
     * REQ-CGLE-011
     */
    public async recordGeneratedLevel(dto: RecordGeneratedLevelDto): Promise<void> {
        const validationResult = RecordGeneratedLevelDtoSchema.safeParse(dto);
        if (!validationResult.success) {
            // Log error: validationResult.error.issues
            throw new Error(`Invalid RecordGeneratedLevelDto: ${validationResult.error.message}`);
        }

        const validatedDto = validationResult.data;

        const storedLevel = StoredGeneratedLevel.create(
            validatedDto.levelId,
            validatedDto.seed,
            validatedDto.parameters,
            validatedDto.solutions
        );

        await this.levelGenerationDataStore.save(storedLevel);
    }

    /**
     * Retrieves data required to reproduce a previously recorded level.
     * REQ-CGLE-011
     */
    public async retrieveLevelReproductionData(levelId: LevelIdentifier): Promise<LevelReproductionDataDto | null> {
        const storedLevel = await this.levelGenerationDataStore.findByLevelId(levelId);

        if (!storedLevel) {
            return null;
        }

        return {
            levelId: storedLevel.levelId,
            seed: storedLevel.seed,
            parameters: storedLevel.parameters,
            solutions: storedLevel.solutions,
        };
    }

    private generateNewSeed(): LevelSeed {
        return `seed-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }

    /**
     * Generates a new procedural level, ensures its solvability, records it, and returns the data.
     * REQ-CGLE-008: Implement procedural generation
     * REQ-CGLE-011: Ensure solvability, store seeds/params/solutions
     * REQ-CGLE-013: Scale difficulty
     */
    public async generateAndRecordLevel(
        progressionContext: { currentZone: number, proceduralLevelsCompleted: number },
        optionalLevelId?: LevelIdentifier
    ): Promise<GeneratedLevelData> {
        const levelIdToUse: LevelIdentifier = optionalLevelId || uuidv4();
        
        let currentSeed = this.generateNewSeed();
        let attempt = 0;
        let generatedLayout: Omit<GeneratedLevelData, 'verifiedSolutionPaths' | 'parametersApplied' | 'seedUsed'> & { parametersApplied: GenerationParameters, seedUsed: LevelSeed };
        let solutionPaths: SolutionPath[] = [];
        let finalGeneratedLevelData: GeneratedLevelData | null = null;

        const scaledParameters = this.difficultyScalerService.scaleParameters(
            BASE_GENERATION_PARAMETERS, // Or fetch from a config
            progressionContext
        );

        while (attempt < MAX_GENERATION_RETRIES) {
            attempt++;
            this.randomProvider.initialize(currentSeed);

            // LevelGeneratorService.generate should return the grid, placements, seed, and params
            // It should NOT include verifiedSolutionPaths yet or an empty array for it.
            // For simplicity, assuming LevelGeneratorService.generate returns GeneratedLevelData
            // with empty verifiedSolutionPaths.
            const initialLevelData = this.levelGeneratorService.generate(
                scaledParameters,
                currentSeed,
                this.defaultLevelTemplate, // Or select template based on scaledParameters.allowedPuzzleTypes
                this.randomProvider
            );

            solutionPaths = this.solvabilityValidatorService.findSolutionPaths(
                initialLevelData, // Pass initial data which includes grid, glyphs, obstacles
                this.pathfindingAdapter
            );
            
            // Solvability Check:
            // Ensure all necessary glyph pairs have a solution path.
            const requiredPairIds = new Set<number>();
            initialLevelData.glyphPlacements.forEach(gp => {
                if (gp.pairId > 0) { // Assuming pairId 0 or less means no pair / not part of a path puzzle pair
                    requiredPairIds.add(gp.pairId);
                }
            });

            const solvedPairIds = new Set<number>();
            solutionPaths.forEach(sp => {
                if (sp.pathPoints && sp.pathPoints.length > 0) {
                    solvedPairIds.add(sp.glyphPairId);
                }
            });
            
            if (requiredPairIds.size > 0 && requiredPairIds.size === solvedPairIds.size &&
                Array.from(requiredPairIds).every(id => solvedPairIds.has(id))) {
                
                finalGeneratedLevelData = {
                    ...initialLevelData,
                    verifiedSolutionPaths: solutionPaths,
                };
                break; // Solvable level found
            }

            // If not solvable, generate a new seed for the next attempt
            currentSeed = this.generateNewSeed();
        }

        if (!finalGeneratedLevelData) {
            // Log error: Failed to generate a solvable level after MAX_GENERATION_RETRIES attempts
            throw new Error(`Failed to generate a solvable level for parameters: ${JSON.stringify(scaledParameters)}`);
        }

        // Record the successfully generated level
        const recordDto: RecordGeneratedLevelDto = {
            levelId: levelIdToUse,
            seed: finalGeneratedLevelData.seedUsed,
            parameters: finalGeneratedLevelData.parametersApplied,
            solutions: finalGeneratedLevelData.verifiedSolutionPaths,
        };
        await this.recordGeneratedLevel(recordDto);

        return finalGeneratedLevelData;
    }
}