/**
 * @file Manages data retrieval for player profiles, specifically for enriching leaderboard data.
 * @description Provides a data access layer for bulk-fetching player display data and managing
 * player-specific leaderboard settings.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Repositories
 */

import { Schema, Model, model } from 'mongoose';
import { IPlayerProfile, IPlayerRepository } from '../interfaces/leaderboard.interfaces';

// This is a placeholder schema and model definition. In a real microservices
// architecture, this repository might communicate with another service via RPC/HTTP
// or access a shared database with a well-defined model.
const playerProfileSchema = new Schema<IPlayerProfile>({
    username: { type: String, required: true, unique: true },
    avatarUrl: { type: String, required: false },
    isExcludedFromLeaderboards: { type: Boolean, default: false },
}, {
    collection: 'playerprofiles'
});

const PlayerProfileModel: Model<IPlayerProfile> = model<IPlayerProfile>('PlayerProfile', playerProfileSchema);


export class PlayerRepository implements IPlayerRepository {
  private readonly playerProfileModel: Model<IPlayerProfile>;

  constructor() {
    // In a real DI setup, this would be injected.
    this.playerProfileModel = PlayerProfileModel;
  }

  /**
   * Fetches minimal profile data for multiple users by their IDs.
   * @param userIds An array of user IDs to fetch.
   * @returns A promise that resolves to a Map where keys are user IDs and values are player data.
   */
  public async findManyByIds(userIds: string[]): Promise<Map<string, { username: string; avatarUrl?: string }>> {
    const players = await this.playerProfileModel
      .find({ _id: { $in: userIds } })
      .select('username avatarUrl')
      .lean()
      .exec();

    const playerMap = new Map<string, { username: string; avatarUrl?: string }>();
    for (const player of players) {
      playerMap.set(player._id.toString(), {
        username: player.username,
        avatarUrl: player.avatarUrl,
      });
    }
    return playerMap;
  }

  /**
   * Updates a player's profile to exclude them from all leaderboards.
   * @param userId The ID of the user to exclude.
   * @param isExcluded The exclusion status to set.
   * @returns A promise that resolves when the update is complete.
   */
  public async setLeaderboardExclusion(userId: string, isExcluded: boolean): Promise<void> {
    await this.playerProfileModel.updateOne(
      { _id: userId },
      { $set: { isExcludedFromLeaderboards: isExcluded } }
    ).exec();
  }
}