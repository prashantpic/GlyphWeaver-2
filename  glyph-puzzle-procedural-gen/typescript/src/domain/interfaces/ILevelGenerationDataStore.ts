import { StoredGeneratedLevel } from '../aggregates/StoredGeneratedLevel';
import { LevelIdentifier } from '../core/LevelIdentifier';

/**
 * @interface ILevelGenerationDataStore
 * @description Interface (Port) for persisting and retrieving StoredGeneratedLevel data.
 * Implements REQ-CGLE-011 contract for data storage.
 * The concrete implementation of this interface (e.g., using Mongoose for MongoDB)
 * is expected to be provided by the REPO-DOMAIN-DATA repository.
 * @pattern Port, RepositoryPattern
 */
export interface ILevelGenerationDataStore {
    /**
     * Saves the generated level data.
     * @param {StoredGeneratedLevel} data - The StoredGeneratedLevel entity to save.
     * @returns {Promise<void>} A promise that resolves when the save operation is complete.
     */
    save(data: StoredGeneratedLevel): Promise<void>;

    /**
     * Finds a stored generated level by its unique identifier.
     * @param {LevelIdentifier} levelId - The unique identifier of the level.
     * @returns {Promise<StoredGeneratedLevel | null>} A promise that resolves with the found StoredGeneratedLevel or null if not found.
     */
    findByLevelId(levelId: LevelIdentifier): Promise<StoredGeneratedLevel | null>;
}