/**
 * @file Manages data persistence and retrieval for player scores in the MongoDB database.
 * @description Provides data access methods for creating and querying player scores,
 * optimized for leaderboard ranking and retrieval.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Repositories
 */

import { Model } from 'mongoose';
import { IPlayerScore, IScoreRepository } from '../interfaces/leaderboard.interfaces';
import { PlayerScoreModel } from '../models/playerScore.model';

export class ScoreRepository implements IScoreRepository {
  private readonly playerScoreModel: Model<IPlayerScore>;

  constructor() {
    // In a real DI setup, this would be injected.
    this.playerScoreModel = PlayerScoreModel;
  }

  /**
   * Creates and saves a new player score document.
   * @param scoreData The data for the new score.
   * @returns A promise that resolves to the newly created score document.
   */
  public async create(scoreData: Partial<IPlayerScore>): Promise<IPlayerScore> {
    // This logic could be expanded to use `findOneAndUpdate` with `upsert: true`
    // if we only want to keep the single best score per user per leaderboard.
    // For now, we allow multiple scores as per the base SDS.
    const newScore = new this.playerScoreModel(scoreData);
    return newScore.save();
  }

  /**
   * Finds a paginated and sorted list of scores for a specific leaderboard.
   * @param leaderboardId The ID of the leaderboard.
   * @param options Pagination options { limit, offset }.
   * @param tieBreakingFields The fields to use for tie-breaking, from the leaderboard definition.
   * @returns A promise that resolves to an array of score documents.
   */
  public async findByLeaderboard(leaderboardId: string, options: { limit: number; offset: number; }, tieBreakingFields: any[]): Promise<IPlayerScore[]> {
    const sort: Record<string, 1 | -1> = { scoreValue: -1 };
    
    // Dynamically construct the sort object based on leaderboard rules
    for (const tieBreaker of tieBreakingFields) {
        sort[tieBreaker.field] = tieBreaker.order;
    }
    // Final, definitive tie-breaker
    sort['timestamp'] = 1;

    return this.playerScoreModel
      .find({ leaderboardId })
      .sort(sort)
      .skip(options.offset)
      .limit(options.limit)
      .populate('userId', 'username avatarUrl') // Enrich with player data
      .lean()
      .exec();
  }

  /**
   * Calculates a player's rank on a specific leaderboard.
   * @param leaderboardId The ID of the leaderboard.
   * @param userId The ID of the player.
   * @returns A promise that resolves to the player's rank (1-based) or null if they have no score.
   */
  public async getPlayerRank(leaderboardId: string, userId: string): Promise<number | null> {
    // For simplicity and performance, this implementation finds the user's best score first.
    // A more complex single-aggregation pipeline could also achieve this.
    const userScore = await this.playerScoreModel.findOne(
        { leaderboardId, userId }
        // In a system where users can submit multiple scores, you'd sort here
        // to find their *best* score first. Assuming one score per user for now.
    ).lean().exec();

    if (!userScore) {
      return null;
    }
    
    // The rank is 1 + the number of players with a better score.
    const higherRankedCount = await this.playerScoreModel.countDocuments({
        leaderboardId,
        $or: [
            // Case 1: Higher score
            { scoreValue: { $gt: userScore.scoreValue } },
            // Case 2: Same score, but better completion time
            { 
                scoreValue: userScore.scoreValue, 
                'metadata.completionTime': { $lt: userScore.metadata.completionTime }
            },
            // Case 3: Same score and time, but earlier submission
            {
                scoreValue: userScore.scoreValue,
                'metadata.completionTime': userScore.metadata.completionTime,
                timestamp: { $lt: userScore.timestamp }
            }
        ]
    }).exec();

    return higherRankedCount + 1;
  }
}