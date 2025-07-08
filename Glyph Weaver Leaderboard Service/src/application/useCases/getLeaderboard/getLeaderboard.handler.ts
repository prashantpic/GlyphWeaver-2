import { IScoreRepository } from '../../interfaces/IScoreRepository';
import { ICacheService } from '../../interfaces/ICacheService';
import { NotFoundError } from '../../../utils/errors';
import { logger } from '../../../utils/logger';

export interface GetLeaderboardQuery {
  leaderboardId: string;
  limit: number;
  offset: number;
}

export interface LeaderboardEntryDto {
  rank: number;
  playerId: string;
  playerName: string; // Name would be enriched from another service in a real scenario
  scoreValue: number;
  tieBreakerValue: number;
  submittedAt: string;
}

export interface LeaderboardViewDto {
  leaderboardId: string;
  totalEntries: number; // For now, we don't fetch total, but it's in the spec.
  lastRefreshed: string;
  entries: LeaderboardEntryDto[];
}

/**
 * Handles the business logic for the 'Get Leaderboard' use case.
 * It retrieves and formats leaderboard data, utilizing a cache-aside strategy for performance.
 */
export class GetLeaderboardHandler {
  private readonly CACHE_TTL_SECONDS = 60;

  constructor(
    private readonly scoreRepository: IScoreRepository,
    private readonly cacheService: ICacheService
  ) {}

  public async execute(query: GetLeaderboardQuery): Promise<LeaderboardViewDto> {
    const cacheKey = `leaderboard:${query.leaderboardId}:limit:${query.limit}:offset:${query.offset}`;

    // 1. Cache Check
    const cachedData = await this.cacheService.get<LeaderboardViewDto>(cacheKey);
    if (cachedData) {
      logger.info(`Cache HIT for key: ${cacheKey}`);
      return cachedData;
    }

    logger.info(`Cache MISS for key: ${cacheKey}`);

    // 2. Cache Miss: Fetch from repository
    const scores = await this.scoreRepository.getRankedScores(
      query.leaderboardId,
      query.limit,
      query.offset
    );

    // 3. Transform to DTO
    const entries: LeaderboardEntryDto[] = scores.map((score, index) => ({
      rank: query.offset + index + 1,
      playerId: score.playerId,
      playerName: `Player-${score.playerId.substring(0, 8)}`, // Placeholder name
      scoreValue: score.scoreValue,
      tieBreakerValue: score.tieBreakerValue,
      submittedAt: score.submittedAt.toISOString(),
    }));

    const responseDto: LeaderboardViewDto = {
      leaderboardId: query.leaderboardId,
      totalEntries: -1, // This would require another query (e.g., a count) which we omit for now.
      lastRefreshed: new Date().toISOString(),
      entries,
    };

    // 4. Asynchronously store in cache
    this.cacheService.set(cacheKey, responseDto, this.CACHE_TTL_SECONDS).catch(err => {
      logger.error(`Failed to set cache for key ${cacheKey}`, err);
    });

    return responseDto;
  }
}