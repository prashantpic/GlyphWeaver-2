import { LevelProgressModel } from '../../data/models/levelProgress.model.ts';
import { Types } from 'mongoose';

// DTO matching the request body for /progress/sync
export interface SyncProgressDto {
  progress: Array<{
    levelId: string;
    isProcedural: boolean;
    bestScore: number;
    starsEarned: number;
    completionTime: number;
    lastAttempt: string; // ISO 8601 date string
  }>;
}

/**
 * This service acts as a facade for all operations related to managing and
 * synchronizing a player's level-by-level game progress.
 */
export class ProgressService {

  /**
   * Retrieves all level progress records for the authenticated player.
   * @param playerId - The ID of the authenticated player.
   * @returns The full list of the player's progress.
   */
  public async getFullProgress(playerId: string) {
    const progressRecords = await LevelProgressModel.find({ userId: new Types.ObjectId(playerId) })
      .select('-_id -userId -__v -createdAt -updatedAt') // Exclude fields
      .lean(); // Use lean for better performance on read-only ops
    
    return { progress: progressRecords };
  }

  /**
   * Synchronizes a batch of level progress data from the client.
   * Uses an "upsert" strategy: updates existing records or creates new ones.
   * This implements a "last write wins" approach.
   * @param playerId - The ID of the authenticated player.
   * @param syncData - The batch of progress data from the client.
   * @returns The full, updated list of player progress.
   */
  public async synchronizeProgress(playerId: string, syncData: SyncProgressDto) {
    const userId = new Types.ObjectId(playerId);

    const operations = syncData.progress.map(record => {
      return LevelProgressModel.findOneAndUpdate(
        { userId, levelId: record.levelId },
        { 
          ...record,
          userId, // Ensure userId is set on new documents
          lastAttempt: new Date(record.lastAttempt), // Convert string to Date
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });

    // Execute all updates in parallel
    await Promise.all(operations);

    // Return the fresh, complete state
    return this.getFullProgress(playerId);
  }
}