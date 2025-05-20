import { LevelIdentifier } from '../../domain/core/LevelIdentifier';
import { LevelSeed } from '../../domain/core/LevelSeed';
import { GenerationParameters } from '../../domain/core/GenerationParameters';
import { SolutionPath } from '../../domain/core/SolutionPath';

/**
 * @interface LevelReproductionDataDto
 * @description Data Transfer Object for transferring level reproduction information.
 * Used for REQ-CGLE-011.
 * @pattern DTO
 */
export interface LevelReproductionDataDto {
    /**
     * The unique identifier of the level.
     */
    levelId: LevelIdentifier;

    /**
     * The seed used to generate the level.
     */
    seed: LevelSeed;

    /**
     * The parameters used for generating the level.
     */
    parameters: GenerationParameters;

    /**
     * The verified solution paths for the level, if available or needed for reproduction/verification.
     */
    solutions: SolutionPath[];
}