import { IBaseRepository } from './IBaseRepository';
import { ProceduralLevelDataDocument, ProceduralLevelDataModel } from '../../domain/level/ProceduralLevelData.schema';

export interface IProceduralLevelDataRepository extends IBaseRepository<ProceduralLevelDataDocument, ProceduralLevelDataModel> {
  findBySeed(seed: string): Promise<ProceduralLevelDataDocument | null>;
  findByLevelId(levelId: string): Promise<ProceduralLevelDataDocument | null>;
}