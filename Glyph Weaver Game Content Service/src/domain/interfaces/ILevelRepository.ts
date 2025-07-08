import { ILevel } from '../models/Level.model';

/**
 * @interface ILevelRepository
 * @description Defines the contract for data access operations related to Levels.
 * This decouples the application layer from the specific database implementation.
 */
export interface ILevelRepository {
    /**
     * Finds a single level by its unique ID.
     * @param id The unique identifier of the level.
     * @returns A promise that resolves to the level document or null if not found.
     */
    findById(id: string): Promise<ILevel | null>;

    /**
     * Finds all levels belonging to a specific zone, ordered by level number.
     * @param zoneId The unique identifier of the zone.
     * @returns A promise that resolves to an array of level documents.
     */
    findByZoneId(zoneId: string): Promise<ILevel[]>;

    /**
     * Finds all levels that are marked as procedural templates.
     * @returns A promise that resolves to an array of procedural template level documents.
     */
    findAllTemplates(): Promise<ILevel[]>;
}