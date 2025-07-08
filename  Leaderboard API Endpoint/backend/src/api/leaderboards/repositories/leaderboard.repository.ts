/**
 * @file Manages data persistence and retrieval for leaderboard definitions in the MongoDB database.
 * @description A repository focused on fetching leaderboard definition documents from the database
 * based on their unique key.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Repositories
 */

import { Model } from 'mongoose';
import { ILeaderboard, ILeaderboardRepository } from '../interfaces/leaderboard.interfaces';
import { LeaderboardModel } from '../models/leaderboard.model';

export class LeaderboardRepository implements ILeaderboardRepository {
  private readonly leaderboardModel: Model<ILeaderboard>;

  constructor() {
    // In a real DI setup, this would be injected.
    this.leaderboardModel = LeaderboardModel;
  }

  /**
   * Finds a single, active leaderboard definition by its unique key name.
   * @param keyName The programmatic key of the leaderboard to find.
   * @returns A promise that resolves to the leaderboard document or null if not found.
   */
  public async findByKeyName(keyName: string): Promise<ILeaderboard | null> {
    return this.leaderboardModel.findOne({ keyName, isActive: true }).lean().exec();
  }
}