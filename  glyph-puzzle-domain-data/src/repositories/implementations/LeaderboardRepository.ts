import mongoose, { FilterQuery } from 'mongoose';
import { Redis } from 'ioredis';
import { LeaderboardEntryDocument, LeaderboardEntryModel, ILeaderboardEntry } from '../../domain/leaderboard/LeaderboardEntry.schema';
import { ILeaderboardRepository } from '../interfaces/ILeaderboardRepository';
import { BaseRepository } from './BaseRepository';

// Define LeaderboardEntryType as a partial for creation
export type LeaderboardEntryType = Partial<Omit<ILeaderboardEntry, 'createdAt' | 'updatedAt' | 'schemaVersion' | '_id'>>;


const LEADERBOARD_CACHE_TTL_SECONDS = 60; // 1 minute
const PLAYER_RANK_CACHE_TTL_SECONDS = 30; // 30 seconds

const getTopScoresLevelCacheKey = (levelId: string, limit: number) => `leaderboard:level:${levelId}:top:${limit}`;
const getPlayerRankLevelCacheKey = (levelId: string, playerId: string) => `leaderboard:rank:level:${levelId}:player:${playerId}`;
const getTopScoresZoneCacheKey = (zoneId: string, limit: number) => `leaderboard:zone:${zoneId}:top:${limit}`;
const getPlayerRankZoneCacheKey = (zoneId: string, playerId: string) => `leaderboard:rank:zone:${zoneId}:player:${playerId}`;

export class LeaderboardRepository
  extends BaseRepository<LeaderboardEntryDocument, typeof LeaderboardEntryModel>
  implements ILeaderboardRepository
{
  private redisClient: Redis;

  constructor(redisClient: Redis) {
    super(LeaderboardEntryModel);
    this.redisClient = redisClient;
  }

  async getTopScoresForLevel(levelId: string, limit: number): Promise<LeaderboardEntryDocument[]> {
    const cacheKey = getTopScoresLevelCacheKey(levelId, limit);
    const cachedData = await this.redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData).map((item: any) => new this.model(item) as LeaderboardEntryDocument);
    }

    const scores = await this.model
      .find({ levelId })
      .sort({ score: -1, timestamp: 1 })
      .limit(limit)
      .populate('playerId', 'displayName') // Optionally populate player details
      .exec();

    await this.redisClient.set(cacheKey, JSON.stringify(scores), 'EX', LEADERBOARD_CACHE_TTL_SECONDS);
    return scores;
  }

  async getPlayerRankForLevel(levelId: string, playerId: string): Promise<number | null> {
    const cacheKey = getPlayerRankLevelCacheKey(levelId, playerId);
    const cachedData = await this.redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData) as number | null;
    }

    // Find the player's score first
    const playerScoreEntry = await this.model.findOne({ levelId, playerId }).exec();
    if (!playerScoreEntry) {
      return null; // Player has no score for this level
    }

    // Count players with a higher score, or same score but earlier timestamp
    const rank = await this.model.countDocuments({
      levelId,
      $or: [
        { score: { $gt: playerScoreEntry.score } },
        { score: playerScoreEntry.score, timestamp: { $lt: playerScoreEntry.timestamp } },
      ],
    }).exec();

    const playerRank = rank + 1; // Rank is 1-based

    await this.redisClient.set(cacheKey, JSON.stringify(playerRank), 'EX', PLAYER_RANK_CACHE_TTL_SECONDS);
    return playerRank;
  }

  async submitScore(entryData: LeaderboardEntryType): Promise<LeaderboardEntryDocument> {
    // In a real scenario, you might want to update existing entry if a player submits a new, better score.
    // Or, always create a new one and rely on queries to pick the best.
    // The current schema/SDS implies creating new entries. REQ-8-004 "Leaderboard Entries"
    // Let's assume we create a new entry. If only one entry per player per level is allowed,
    // this logic would need to be an upsert based on playerId and levelId.
    // For simplicity as per SDS structure, we create a new entry.
    // A common pattern is to upsert: update if score is higher, or if same score, if time is less, etc.
    // For now, a simple create:
    const newEntry = await this.create(entryData as Partial<LeaderboardEntryDocument>);


    // Invalidate relevant caches
    const keysToInvalidate: string[] = [];
    if (newEntry.levelId) {
        // Invalidate general top scores for this level (limit variations would need more complex invalidation)
        // For simplicity, we can use a pattern or just invalidate known common limits.
        // Or, more robustly, use Redis SCAN and DEL for patterns like `leaderboard:level:${newEntry.levelId}:top:*`
        keysToInvalidate.push(getTopScoresLevelCacheKey(newEntry.levelId, 10)); // Example limit
        keysToInvalidate.push(getTopScoresLevelCacheKey(newEntry.levelId, 50)); // Example limit
        keysToInvalidate.push(getPlayerRankLevelCacheKey(newEntry.levelId, newEntry.playerId.toString()));
    }
    if (newEntry.zoneId) {
        keysToInvalidate.push(getTopScoresZoneCacheKey(newEntry.zoneId, 10));
        keysToInvalidate.push(getTopScoresZoneCacheKey(newEntry.zoneId, 50));
        keysToInvalidate.push(getPlayerRankZoneCacheKey(newEntry.zoneId, newEntry.playerId.toString()));
    }
    
    if (keysToInvalidate.length > 0) {
      // Use a pipeline for multiple deletions if supported and makes sense
      // For a few keys, individual dels are fine.
      // More advanced: use Lua script or pattern deletion if `redisClient` supports it and it's safe.
      // await this.redisClient.del(...keysToInvalidate);
      for (const key of keysToInvalidate) {
        await this.redisClient.del(key);
      }
    }

    return newEntry;
  }

  async getTopScoresForZone(zoneId: string, limit: number): Promise<LeaderboardEntryDocument[]> {
    const cacheKey = getTopScoresZoneCacheKey(zoneId, limit);
    const cachedData = await this.redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData).map((item: any) => new this.model(item) as LeaderboardEntryDocument);
    }

    const scores = await this.model
      .find({ zoneId })
      .sort({ score: -1, timestamp: 1 })
      .limit(limit)
      .populate('playerId', 'displayName')
      .exec();

    await this.redisClient.set(cacheKey, JSON.stringify(scores), 'EX', LEADERBOARD_CACHE_TTL_SECONDS);
    return scores;
  }

  async getPlayerRankForZone(zoneId: string, playerId: string): Promise<number | null> {
    const cacheKey = getPlayerRankZoneCacheKey(zoneId, playerId);
    const cachedData = await this.redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData) as number | null;
    }
    
    const playerScoreEntry = await this.model.findOne({ zoneId, playerId }).exec();
    if (!playerScoreEntry) {
      return null;
    }

    const rank = await this.model.countDocuments({
      zoneId,
      $or: [
        { score: { $gt: playerScoreEntry.score } },
        { score: playerScoreEntry.score, timestamp: { $lt: playerScoreEntry.timestamp } },
      ],
    }).exec();

    const playerRank = rank + 1;

    await this.redisClient.set(cacheKey, JSON.stringify(playerRank), 'EX', PLAYER_RANK_CACHE_TTL_SECONDS);
    return playerRank;
  }
}