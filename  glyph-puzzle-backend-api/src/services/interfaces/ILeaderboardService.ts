import { SubmitScoreRequestDTO } from '../../api/leaderboard/dtos/SubmitScore.request.dto';
import { LeaderboardQueryDTO } from '../../api/leaderboard/dtos/LeaderboardQuery.dto';
import { LeaderboardResponseDTO } from '../../api/leaderboard/dtos/Leaderboard.response.dto';

export interface ILeaderboardService {
  /**
   * Submits a score for a player to a specific leaderboard.
   * @param playerId - The ID of the player submitting the score.
   * @param submitScoreDto - DTO containing score details.
   * @returns A promise that resolves to an object with the player's rank and score.
   */
  submitScore(
    playerId: string,
    submitScoreDto: SubmitScoreRequestDTO,
  ): Promise<{ rank: number; score: number }>;

  /**
   * Retrieves leaderboard data based on the specified ID and query parameters.
   * @param leaderboardId - The ID of the leaderboard to retrieve.
   * @param queryDto - DTO containing query parameters (limit, offset, timeScope, etc.).
   * @param requestingPlayerId - Optional ID of the player requesting the leaderboard, to include their rank.
   * @returns A promise that resolves to a LeaderboardResponseDTO.
   */
  getLeaderboard(
    leaderboardId: string,
    queryDto: LeaderboardQueryDTO,
    requestingPlayerId?: string,
  ): Promise<LeaderboardResponseDTO>;
}