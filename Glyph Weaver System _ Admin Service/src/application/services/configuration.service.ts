import { GameConfiguration } from '../../domain/entities/game-configuration.entity';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { IGameConfigurationRepository } from '../../domain/repositories/game-configuration.repository';
import { NotFoundError } from '../errors/not-found.error';

/**
 * @file This service layer component orchestrates all operations related to game configurations. It acts as the primary entry point for the controllers to execute configuration-related business logic.
 * @namespace GlyphWeaver.Backend.System.Application.Services
 */

/**
 * @class ConfigurationService
 * @description Handles all business logic related to managing game configurations.
 * @pattern ServiceLayerPattern, DependencyInjection
 */
export class ConfigurationService {
  /**
   * @param {IGameConfigurationRepository} configRepo - The repository for game configuration data.
   * @param {IAuditLogRepository} auditRepo - The repository for audit log data.
   */
  constructor(
    private readonly configRepo: IGameConfigurationRepository,
    private readonly auditRepo: IAuditLogRepository
  ) {}

  /**
   * Fetches a single configuration value by its key.
   * @param {string} key - The unique key of the configuration.
   * @returns {Promise<any>} The value of the configuration.
   * @throws {NotFoundError} If the configuration with the given key does not exist.
   */
  public async getConfigurationByKey(key: string): Promise<any> {
    const config = await this.configRepo.findByKey(key);
    if (!config) {
      throw new NotFoundError(`Configuration with key '${key}' not found.`);
    }
    return config.getValue();
  }

  /**
   * Fetches all game configurations.
   * @returns {Promise<GameConfiguration[]>} A list of all game configurations.
   */
  public async getAllConfigurations(): Promise<GameConfiguration[]> {
    return this.configRepo.findAll();
  }

  /**
   * Updates a game configuration setting and creates an audit log.
   * @param {string} key - The key of the configuration to update.
   * @param {any} newValue - The new value for the configuration.
   * @param {string} actorId - The ID of the user performing the update.
   * @param {string} ipAddress - The IP address of the user.
   * @throws {NotFoundError} If the configuration with the given key does not exist.
   */
  public async updateConfiguration(
    key: string,
    newValue: any,
    actorId: string,
    ipAddress: string
  ): Promise<void> {
    const config = await this.configRepo.findByKey(key);

    if (!config) {
      await this.auditRepo.create({
        eventType: 'CONFIG_UPDATE_ATTEMPT',
        actorId,
        ipAddress,
        status: 'failure',
        details: {
          key,
          newValue,
          reason: 'Configuration key not found.',
        },
      });
      throw new NotFoundError(`Configuration with key '${key}' not found.`);
    }

    const oldValue = config.getValue();
    const auditDetails = {
        key,
        oldValue,
        newValue,
    };

    try {
      config.updateValue(newValue, actorId);
      await this.configRepo.save(config);

      await this.auditRepo.create({
        eventType: 'CONFIG_UPDATE',
        actorId,
        ipAddress,
        status: 'success',
        details: auditDetails,
      });
    } catch (error) {
      await this.auditRepo.create({
        eventType: 'CONFIG_UPDATE',
        actorId,
        ipAddress,
        status: 'failure',
        details: {
          ...auditDetails,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      // Re-throw the original error to be handled by the presentation layer
      throw error;
    }
  }
}