/**
 * @file Contains the core application logic for managing leaderboards.
 * @description This service encapsulates all logic for leaderboard management,
 * including fetching, caching, score submission, validation, and administration.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Services
 */

import {
  ILeaderboardService,
  IScoreRepository,
  ILeaderboardRepository,
  IPlayerRepository,
  ICheatDetectionService,
  ICacheProvider,
  IAuditService,
  SubmitScoreDto,
  LeaderboardViewDto,
  LeaderboardEntryDto,
} from '../interfaces/leaderboard.interfaces';
import { ScoreRepository } from '../repositories/score.repository';
import { LeaderboardRepository } from '../repositories/leaderboard.repository';
import { PlayerRepository } from '../repositories/player.repository';
import { CheatDetectionService } from './cheatDetection.service';
import { CacheProvider } from '../providers/cache.provider';
import { AuditService } from './audit.service';

// In a real app, these would be in a shared error-handling module.
class NotFoundException extends Error { constructor(message: string) { super(message); this.name = 'NotFoundException'; } }
class ForbiddenException extends Error { constructor(message: string) { super(message); this.name = 'ForbiddenException'; } }

export class LeaderboardService implements ILeaderboardService {
  constructor(
    private readonly scoreRepository: IScoreRepository,
    private readonly leaderboardRepository: ILeaderboardRepository,
    private readonly playerRepository: IPlayerRepository,
    private readonly cheatDetectionService: ICheatDetectionService,
    private readonly cacheProvider: ICacheProvider,
    private readonly auditService: IAuditService
  ) {}

  public async getLeaderboardView(leaderboardKey: string, options: { limit: number; offset: number }): Promise<LeaderboardViewDto> {
    const cacheKey = `leaderboard:${leaderboardKey}:l:${options.limit}:o:${options.offset}`;
    const cachedData = await this.cacheProvider.get(cacheKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      // Ensure dates are correctly revived from JSON string
      parsedData.lastRefreshed = new Date(parsedData.lastRefreshed);
      parsedData.entries.forEach((e: any) => e.submittedAt = new Date(e.submittedAt));
      return parsedData;
    }

    const leaderboard = await this.leaderboardRepository.findByKeyName(leaderboardKey);
    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with key '${leaderboardKey}' not found.`);
    }

    const scores = await this.scoreRepository.findByLeaderboard(leaderboard._id, options, leaderboard.tieBreakingFields);
    const playerIds = scores.map(score => score.userId.toString());
    const playersMap = await this.playerRepository.findManyByIds(playerIds);
    
    const entries: LeaderboardEntryDto[] = scores.map((score, index) => {
      const playerInfo = playersMap.get(score.userId.toString()) || { username: 'Unknown Player' };
      return {
        rank: options.offset + index + 1,
        playerName: playerInfo.username,
        score: score.scoreValue,
        submittedAt: score.timestamp,
        avatarUrl: playerInfo.avatarUrl || null,
      };
    });

    // We would need another query to get the total count for the leaderboard
    // This is simplified for now.
    const totalEntries = entries.length + options.offset; // This is an approximation

    const view: LeaderboardViewDto = {
      leaderboardName: leaderboard.name,
      entries,
      totalEntries,
      lastRefreshed: new Date(),
    };

    await this.cacheProvider.set(cacheKey, JSON.stringify(view), 300); // 5-minute TTL
    return view;
  }

  public async processScoreSubmission(leaderboardKey: string, userId: string, submission: SubmitScoreDto): Promise<{ rank: number | null }> {
    const leaderboard = await this.leaderboardRepository.findByKeyName(leaderboardKey);
    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with key '${leaderboardKey}' not found.`);
    }

    const isValid = await this.cheatDetectionService.isScoreValid(submission, leaderboard, userId);

    await this.auditService.logScoreSubmission({ userId, leaderboardKey, score: submission.score, isValid });

    if (!isValid) {
      await this.auditService.logSuspiciousActivity({ userId, reason: 'Cheat detection failed', submissionData: submission });
      throw new ForbiddenException('Invalid score submission.');
    }

    await this.scoreRepository.create({
      leaderboardId: leaderboard._id,
      userId,
      scoreValue: submission.score,
      metadata: {
        completionTime: submission.completionTime,
        moves: submission.moves,
      },
    });

    await this.cacheProvider.invalidateByPattern(`leaderboard:${leaderboardKey}:*`);
    
    const rank = await this.scoreRepository.getPlayerRank(leaderboard._id, userId);

    return { rank };
  }

  public async getPlayerRankView(leaderboardKey: string, userId: string): Promise<LeaderboardEntryDto> {
    const leaderboard = await this.leaderboardRepository.findByKeyName(leaderboardKey);
    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with key '${leaderboardKey}' not found.`);
    }

    const rank = await this.scoreRepository.getPlayerRank(leaderboard._id, userId);
    if (rank === null) {
        throw new NotFoundException(`Player rank not found for user '${userId}' on leaderboard '${leaderboardKey}'.`);
    }

    const offset = Math.max(0, rank - 3); // Fetch 2 above, player, and 2 below
    const limit = 5;

    const scores = await this.scoreRepository.findByLeaderboard(leaderboard._id, { limit, offset }, leaderboard.tieBreakingFields);
    
    const playerEntry = scores.find(s => s.userId.toString() === userId);
    if(!playerEntry) {
         throw new NotFoundException(`Player score data inconsistency for user '${userId}'.`);
    }

    // Since scoreRepository populates, we can cast.
    const populatedUser = playerEntry.userId as { username: string, avatarUrl?: string };

    return {
        rank,
        playerName: populatedUser.username,
        score: playerEntry.scoreValue,
        submittedAt: playerEntry.timestamp,
        avatarUrl: populatedUser.avatarUrl || null,
    };
  }

  public async excludePlayerFromLeaderboards(userId: string, adminId: string): Promise<void> {
    await this.playerRepository.setLeaderboardExclusion(userId, true);
    await this.auditService.logAdminAction({
      adminId,
      action: 'EXCLUDE_PLAYER_FROM_LEADERBOARDS',
      targetUserId: userId,
    });
    // Invalidate all caches related to this user? This could be complex.
    // For now, their scores will just stop appearing in new queries.
  }
}