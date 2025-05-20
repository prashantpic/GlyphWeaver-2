import { LevelSeed } from '../../domain/core/LevelSeed';
import { GenerationParameters } from '../../domain/core/GenerationParameters';
import { SolutionPath } from '../../domain/core/SolutionPath';
import { LevelIdentifier } from '../../domain/core/LevelIdentifier';

/**
 * @interface RecordGeneratedLevelDto
 * @description Data Transfer Object for transferring information needed to record a generated level.
 * Used for REQ-CGLE-011.
 * @pattern DTO
 */
export interface RecordGeneratedLevelDto {
    /**
     * The unique identifier for the level.
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
     * The verified solution paths for the level.
     */
    solutions: SolutionPath[];
}