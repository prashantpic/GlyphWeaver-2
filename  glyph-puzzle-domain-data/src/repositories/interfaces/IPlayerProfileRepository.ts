import { IBaseRepository } from './IBaseRepository';
// Assuming PlayerProfileDocument and PlayerProfileModel are defined in their schema file
// and PlayerLevelProgress is defined in its embedded schema file
import { PlayerProfileDocument, PlayerProfileModel } from '../../domain/player/PlayerProfile.schema';
import { PlayerLevelProgress } from '../../domain/player/PlayerLevelProgress.schema';

// This type is derived from PlayerLevelProgress.schema.ts for partial updates
export type PlayerLevelProgressType = Partial<PlayerLevelProgress>;


export interface IPlayerProfileRepository extends IBaseRepository<PlayerProfileDocument, PlayerProfileModel> {
  findByUserId(userId: string): Promise<PlayerProfileDocument | null>;
  updateLevelProgress(userId: string, levelId: string, progressData: PlayerLevelProgressType): Promise<PlayerProfileDocument | null>;
  addConsumable(userId: string, itemId: string, quantity: number): Promise<PlayerProfileDocument | null>;
  updateVirtualCurrency(userId: string, currencyId: string, amount: number): Promise<PlayerProfileDocument | null>; // amount can be positive or negative
}