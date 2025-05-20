import { ILeaderboardService } from './interfaces/ILeaderboardService';
import { IScoreRepository } from './interfaces/IScoreRepository';
import { ILeaderboardRepository } from './interfaces/ILeaderboardRepository';
import { IPlayerRepository } from './interfaces/IPlayerRepository'; // For player display names
import { ICacheService } from './interfaces/ICacheService';
// Assuming DTOs are in src/api/leaderboard/dtos
import { SubmitScoreRequestDTO, LeaderboardQueryDTO, LeaderboardResponseDTO, LeaderboardEntryDTO } from '../api/leaderboard/dtos';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { CACHE_TTL_SECONDS } from '../utils/constants'; // Assuming constants are in src/utils

// REQ-SCF-003, REQ-SEC-005, REQ-8-014

export class LeaderboardService implements ILeaderboardService {
    constructor(
        private scoreRepository: IScoreRepository,
        private leaderboardRepository: ILeaderboardRepository,
        private playerRepository: IPlayerRepository, // To fetch player details for leaderboard entries
        private cacheService: ICacheService,
        // private cheatDetectionService: ICheatDetectionService // Conceptual
    ) {}

    async submitScore(playerId: string, request: SubmitScoreRequestDTO): Promise<{ rank: number; score: number; leaderboardId: string }> {
        logger.info(`Submitting score for player ${playerId} to leaderboard ${request.leaderboardId}`);
        const { leaderboardId, score, metadata } = request;

        // REQ-SEC-005, REQ-8-014: Score Validation / Cheat Detection
        // const isScoreValid = await this.cheatDetectionService.validateScore(playerId, leaderboardId, score, metadata);
        // if (!isScoreValid) {
        //     logger.warn(`Invalid score submission detected for player ${playerId}, leaderboard ${leaderboardId}, score ${score}`);
        //     throw new ApiError('Invalid score submitted. Potential cheating detected.', 400);
        // }
        if (score < 0 || score > 1000000000) { // Basic sanity check
             logger.warn(`Score ${score} out of reasonable bounds for player ${playerId}.`);
             throw new ApiError('Score is out of bounds.', 400);
        }

        // Check if leaderboard exists and is active
        const leaderboardConfig = await this.leaderboardRepository.findById(leaderboardId);
        if (!leaderboardConfig || !leaderboardConfig.isActive) {
            logger.warn(`Leaderboard ${leaderboardId} not found or inactive for score submission by player ${playerId}`);
            throw new ApiError('Leaderboard not found or is inactive.', 404);
        }

        // Atomically add score and get rank (Repo should handle this)
        // Or, add score then update/recalculate leaderboard. For simplicity:
        const newScoreEntry = await this.scoreRepository.submitScore(playerId, leaderboardId, score, metadata);

        // Invalidate cache for this leaderboard
        const cacheKey = `leaderboard:${leaderboardId}:${JSON.stringify({})}`; // A generic key, or more specific if query params affect cache
        await this.cacheService.del(cacheKey);
        logger.info(`Cache invalidated for leaderboard ${leaderboardId} due to new score submission.`);

        // For now, we'll fetch the rank separately. In a real system, this might be returned by submitScore.
        const playerRank = await this.leaderboardRepository.getPlayerRank(playerId, leaderboardId);


        logger.info(`Score ${newScoreEntry.scoreValue} submitted successfully for player ${playerId} to leaderboard ${leaderboardId}. New rank: ${playerRank}`);
        return { rank: playerRank, score: newScoreEntry.scoreValue, leaderboardId };
    }

    async getLeaderboard(leaderboardId: string, query: LeaderboardQueryDTO): Promise<LeaderboardResponseDTO> {
        logger.info(`Fetching leaderboard ${leaderboardId} with query: ${JSON.stringify(query)}`);
        const { limit = 50, offset = 0, timeScope = 'all', playerId: requestingPlayerId } = query;

        const cacheKey = `leaderboard:${leaderboardId}:${timeScope}:${limit}:${offset}`;
        const cachedLeaderboard = await this.cacheService.get<LeaderboardResponseDTO>(cacheKey);
        if (cachedLeaderboard) {
            logger.info(`Leaderboard ${leaderboardId} (query: ${JSON.stringify(query)}) served from cache.`);
            // If requestingPlayerId is present, we might need to fetch their specific rank if not in the cached top list
            if (requestingPlayerId && !cachedLeaderboard.entries.find(e => e.playerId === requestingPlayerId)) {
                const playerEntry = await this.getPlayerEntryForLeaderboard(requestingPlayerId, leaderboardId, timeScope);
                if (playerEntry) cachedLeaderboard.playerEntry = playerEntry;
            }
            return cachedLeaderboard;
        }

        const leaderboardConfig = await this.leaderboardRepository.findById(leaderboardId);
        if (!leaderboardConfig) {
            throw new ApiError('Leaderboard not found.', 404);
        }

        const rawEntries = await this.leaderboardRepository.getEntries(leaderboardId, {
            limit,
            offset,
            timeScope,
        });

        const playerIds = rawEntries.map(entry => entry.userId);
        const players = await this.playerRepository.findByIds(playerIds);
        const playerMap = new Map(players.map(p => [p.id, p]));

        const entries: LeaderboardEntryDTO[] = rawEntries.map((entry, index) => ({
            playerId: entry.userId,
            displayName: playerMap.get(entry.userId)?.username || 'Unknown Player',
            score: entry.scoreValue,
            rank: offset + index + 1, // Calculate rank based on offset and position
            // metadata: entry.metadata // if metadata is stored and needed
        }));

        const totalEntries = await this.leaderboardRepository.getTotalEntries(leaderboardId, timeScope);

        let playerEntryDTO: LeaderboardEntryDTO | undefined = undefined;
        if (requestingPlayerId) {
            playerEntryDTO = await this.getPlayerEntryForLeaderboard(requestingPlayerId, leaderboardId, timeScope);
        }
        
        const response: LeaderboardResponseDTO = {
            leaderboardId,
            entries,
            totalEntries,
            playerEntry: playerEntryDTO,
        };

        await this.cacheService.set(cacheKey, response, CACHE_TTL_SECONDS.LEADERBOARD);
        logger.info(`Leaderboard ${leaderboardId} (query: ${JSON.stringify(query)}) fetched from DB and cached.`);
        return response;
    }

    private async getPlayerEntryForLeaderboard(playerId: string, leaderboardId: string, timeScope?: 'daily' | 'weekly' | 'all'): Promise<LeaderboardEntryDTO | undefined> {
        const playerScore = await this.scoreRepository.getPlayerBestScore(playerId, leaderboardId, timeScope);
        if (!playerScore) return undefined;

        const playerRank = await this.leaderboardRepository.getPlayerRank(playerId, leaderboardId, timeScope);
        const playerProfile = await this.playerRepository.findById(playerId);

        return {
            playerId,
            displayName: playerProfile?.username || 'Unknown Player',
            score: playerScore.scoreValue,
            rank: playerRank,
        };
    }
}