import { Score } from '../../domain/models/score.model';

/**
 * Defines the contract for a repository that handles persistence for Score entities.
 * This decouples the application layer from the specific database implementation,
 * enabling easier testing and maintainability.
 */
export interface IScoreRepository {
  /**
   * Adds a new score to the persistence layer.
   * @param score - The Score domain entity to add.
   */
  add(score: Score): Promise<void>;

  /**
   * Retrieves a paginated and ranked list of scores for a specific leaderboard.
   * @param leaderboardId - The ID of the leaderboard.
   * @param limit - The maximum number of scores to return.
   * @param offset - The starting position for the entries.
   * @returns A promise that resolves to an array of Score domain entities.
   */
  getRankedScores(leaderboardId: string, limit: number, offset: number): Promise<Score[]>;

  /**
   * Retrieves the specific rank and score for a single player on a given leaderboard.
   * @param leaderboardId - The ID of the leaderboard.
   * @param playerId - The ID of the player.
   * @returns A promise that resolves to an object with the rank and score, or null if the player has no score.
   */
  getPlayerRank(leaderboardId: string, playerId: string): Promise<{ rank: number; score: Score } | null>;
}