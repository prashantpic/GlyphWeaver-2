import { IBaseRepository } from './IBaseRepository';
import { GameConfigurationDocument, GameConfigurationModel } from '../../domain/configuration/GameConfiguration.schema';

export interface IGameConfigurationRepository extends IBaseRepository<GameConfigurationDocument, GameConfigurationModel> {
  findByConfigKey(configKey: string): Promise<GameConfigurationDocument | null>;
  findAllActive(): Promise<GameConfigurationDocument[]>;
}