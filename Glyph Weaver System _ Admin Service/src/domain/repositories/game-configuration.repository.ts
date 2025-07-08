import { GameConfiguration } from '../entities/game-configuration.entity';

/**
 * @file Provides the IGameConfigurationRepository interface, which defines the persistence contract for the GameConfiguration aggregate. The Application layer will depend on this interface, not the concrete implementation.
 * @namespace GlyphWeaver.Backend.System.Domain.Repositories
 */

/**
 * @interface IGameConfigurationRepository
 * @description Defines the contract for data persistence of GameConfiguration entities.
 * @pattern RepositoryPattern, DDD-Repository
 */
export interface IGameConfigurationRepository {
  /**
   * Retrieves a configuration entity by its unique key.
   * @param {string} key - The unique key of the configuration.
   * @returns {Promise<GameConfiguration | null>} A promise that resolves to the configuration entity or null if not found.
   */
  findByKey(key: string): Promise<GameConfiguration | null>;

  /**
   * Retrieves all configuration entities.
   * @returns {Promise<GameConfiguration[]>} A promise that resolves to an array of all configuration entities.
   */
  findAll(): Promise<GameConfiguration[]>;

  /**
   * Persists a GameConfiguration entity. This method handles both creation and updates.
   * @param {GameConfiguration} config - The configuration entity to save.
   * @returns {Promise<void>} A promise that resolves when the save operation is complete.
   */
  save(config: GameConfiguration): Promise<void>;
}