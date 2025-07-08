import { IScoreRepository } from '../../interfaces/IScoreRepository';
import { NotFoundError } from '../../../utils/errors';

export interface GetPlayerRankQuery {
    leaderboardId: string;
    playerId: string;
}

export interface PlayerRankDto {
    rank: number;
    playerId: string;
    playerName: string;
    scoreValue: number;
    tieBreakerValue: number;
    submittedAt: string;
}

/**
 * Handles the business logic for retrieving a single player's rank.
 */
export class GetPlayerRankHandler {
    constructor(private readonly scoreRepository: IScoreRepository) {}

    public async execute(query: GetPlayerRankQuery): Promise<PlayerRankDto> {
        const result = await this.scoreRepository.getPlayerRank(query.leaderboardId, query.playerId);

        if (!result) {
            throw new NotFoundError('Player has no score on this leaderboard.');
        }

        const { rank, score } = result;

        return {
            rank,
            playerId: score.playerId,
            playerName: `Player-${score.playerId.substring(0, 8)}`, // Placeholder
            scoreValue: score.scoreValue,
            tieBreakerValue: score.tieBreakerValue,
            submittedAt: score.submittedAt.toISOString(),
        };
    }
}