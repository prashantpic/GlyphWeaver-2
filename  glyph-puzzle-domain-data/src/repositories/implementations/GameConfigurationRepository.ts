import mongoose, { FilterQuery } from 'mongoose';
import { GameConfigurationDocument, GameConfigurationModel } from '../../domain/configuration/GameConfiguration.schema';
import { IGameConfigurationRepository } from '../interfaces/IGameConfigurationRepository';
import { BaseRepository } from './BaseRepository';

export class GameConfigurationRepository
  extends BaseRepository<GameConfigurationDocument, typeof GameConfigurationModel>
  implements IGameConfigurationRepository
{
  constructor() {
    super(GameConfigurationModel);
  }

  async findByConfigKey(configKey: string): Promise<GameConfigurationDocument | null> {
    return this.model.findOne({ configKey, isActive: true }).exec(); // Also check if active
  }

  async findAllActive(): Promise<GameConfigurationDocument[]> {
    return this.model.find({ isActive: true }).exec();
  }
}