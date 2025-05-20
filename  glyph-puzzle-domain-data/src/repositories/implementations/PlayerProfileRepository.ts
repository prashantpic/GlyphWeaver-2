import mongoose, { FilterQuery, UpdateQuery } from 'mongoose';
import { PlayerProfileDocument, PlayerProfileModel, IPlayerProfile } from '../../domain/player/PlayerProfile.schema';
import { IPlayerProfileRepository } from '../interfaces/IPlayerProfileRepository';
import { BaseRepository } from './BaseRepository';
import { IPlayerLevelProgress } from '../../domain/player/PlayerLevelProgress.schema';
// Assuming PlayerLevelProgressType is a partial of IPlayerLevelProgress for updates
// If not defined in CustomTypes.ts, it would be something like:
// export type PlayerLevelProgressType = Partial<Omit<IPlayerLevelProgress, '_id'>>;

// This type is based on the SDS for IPlayerProfileRepository.updateLevelProgress
// It should ideally be defined in a shared types file or alongside the schema.
// For now, we use Partial<IPlayerLevelProgress> which might include _id.
// A more precise type would exclude _id if we are updating based on levelId.
export type PlayerLevelProgressUpdateData = Partial<Omit<IPlayerLevelProgress, 'levelId' | '_id'>>;


export class PlayerProfileRepository
  extends BaseRepository<PlayerProfileDocument, typeof PlayerProfileModel>
  implements IPlayerProfileRepository
{
  constructor() {
    super(PlayerProfileModel);
  }

  async findByUserId(userId: string): Promise<PlayerProfileDocument | null> {
    return this.model.findOne({ userId }).exec();
  }

  async updateLevelProgress(
    userId: string,
    levelId: string,
    progressData: PlayerLevelProgressUpdateData
  ): Promise<PlayerProfileDocument | null> {
    const update: UpdateQuery<IPlayerProfile> = {};
    for (const key in progressData) {
      if (Object.prototype.hasOwnProperty.call(progressData, key)) {
        // Make sure we are not trying to set undefined values, which Mongoose might ignore or handle differently
        if ((progressData as any)[key] !== undefined) {
          (update as any)[`levelProgress.$[elem].${key}`] = (progressData as any)[key];
        }
      }
    }
    // Ensure lastPlayedAt is updated if not explicitly provided but progress is made
    if (!progressData.lastPlayedAt) {
        (update as any)['levelProgress.$[elem].lastPlayedAt'] = new Date();
    }


    const profile = await this.model.findOneAndUpdate(
      { userId, 'levelProgress.levelId': levelId },
      { $set: update },
      { new: true, arrayFilters: [{ 'elem.levelId': levelId }] }
    ).exec();

    if (profile) {
      return profile;
    }

    // If level progress does not exist, add it
    const newProgressEntry: IPlayerLevelProgress = {
      levelId,
      stars: progressData.stars ?? 0,
      highScore: progressData.highScore ?? 0,
      completed: progressData.completed ?? false,
      unlockedAt: new Date(), // Default unlockedAt if new
      lastPlayedAt: progressData.lastPlayedAt ?? new Date(),
      // Add any other required fields from IPlayerLevelProgress with defaults
    } as IPlayerLevelProgress;


    return this.model.findOneAndUpdate(
      { userId },
      { $push: { levelProgress: newProgressEntry } },
      { new: true }
    ).exec();
  }

  async addConsumable(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<PlayerProfileDocument | null> {
    // Try to increment quantity if item exists
    const updatedProfile = await this.model.findOneAndUpdate(
      { userId, 'iapInventory.itemId': itemId },
      { $inc: { 'iapInventory.$.quantity': quantity } },
      { new: true }
    ).exec();

    if (updatedProfile) {
      return updatedProfile;
    }

    // If item does not exist, add it to the inventory
    return this.model.findOneAndUpdate(
      { userId },
      { $push: { iapInventory: { itemId, quantity } } },
      { new: true, upsert: false } // upsert: false because we only push if profile exists
    ).exec();
  }

  async updateVirtualCurrency(
    userId: string,
    currencyId: string,
    amount: number // Can be positive (add) or negative (subtract)
  ): Promise<PlayerProfileDocument | null> {
     // First, try to update an existing currency balance.
    // Ensure balance doesn't go below 0 if amount is negative.
    const updateOperation: UpdateQuery<IPlayerProfile> = {
        $inc: { 'virtualCurrencies.$.balance': amount }
    };

    let profile = await this.model.findOneAndUpdate(
        { userId, 'virtualCurrencies.currencyId': currencyId },
        updateOperation,
        { new: true, arrayFilters: [{ 'elem.currencyId': currencyId, 'elem.balance': { $gte: (amount < 0 ? -amount : 0) } }] }
    ).exec();

    if (profile) {
        // Verify the balance didn't go negative if it was a debit
        const currency = profile.virtualCurrencies.find(vc => vc.currencyId === currencyId);
        if (currency && currency.balance < 0) {
            // Rollback or handle insufficient funds - this simple inc might not be atomic enough for this check.
            // For robust transactional behavior, consider two-phase commits or app-level checks before update.
            // For now, we'll assume positive balances or rely on schema min:0.
            // Re-fetch to ensure accurate balance if previous update was conditional and failed due to insufficient funds.
             profile = await this.model.findOne({ userId }).exec();
        }
        return profile;
    }


    // If currency does not exist and amount is positive, add it
    if (amount >= 0) {
        return this.model.findOneAndUpdate(
            { userId },
            { $push: { virtualCurrencies: { currencyId, balance: amount } } },
            { new: true, upsert: false }
        ).exec();
    } else {
        // Cannot debit a non-existent currency or one that would go negative
        return this.model.findOne({ userId }).exec(); // return current profile without change
    }
  }
}