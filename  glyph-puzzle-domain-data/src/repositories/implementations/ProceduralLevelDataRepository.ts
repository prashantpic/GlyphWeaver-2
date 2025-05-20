import mongoose, { FilterQuery } from 'mongoose';
import { ProceduralLevelDataDocument, ProceduralLevelDataModel } from '../../domain/level/ProceduralLevelData.schema';
import { IProceduralLevelDataRepository } from '../interfaces/IProceduralLevelDataRepository';
import { BaseRepository } from './BaseRepository';

export class ProceduralLevelDataRepository
  extends BaseRepository<ProceduralLevelDataDocument, typeof ProceduralLevelDataModel>
  implements IProceduralLevelDataRepository
{
  constructor() {
    super(ProceduralLevelDataModel);
  }

  async findBySeed(seed: string): Promise<ProceduralLevelDataDocument | null> {
    return this.model.findOne({ seed }).exec();
  }

  async findByLevelId(levelId: string): Promise<ProceduralLevelDataDocument | null> {
    return this.model.findOne({ levelId }).exec();
  }
}