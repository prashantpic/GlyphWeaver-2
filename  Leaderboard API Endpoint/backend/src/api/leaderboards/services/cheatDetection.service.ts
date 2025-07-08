/**
 * @file Implements server-side validation logic to detect and prevent cheating in score submissions.
 * @description Provides a single point of validation for incoming player scores
 * to protect against common cheating vectors.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Services
 */

import * as crypto from 'crypto';
import { 
  ICheatDetectionService, 
  SubmitScoreDto, 
  ILeaderboard, 
  ILevelRepository,
  ILevel
} from '../interfaces/leaderboard.interfaces';
import { Model, Schema, model } from 'mongoose';

// Placeholder Repository until it's defined in its own domain
class LevelRepository implements ILevelRepository {
    private readonly levelModel: Model<ILevel>;
    constructor() {
        const levelSchema = new Schema<ILevel>({
            maxPossibleScore: { type: Number, required: false },
        }, { collection: 'levels' });
        this.levelModel = model<ILevel>('Level', levelSchema);
    }
    async findById(id: string): Promise<ILevel | null> {
        return this.levelModel.findById(id).lean().exec();
    }
}


export class CheatDetectionService implements ICheatDetectionService {
  private readonly levelRepository: ILevelRepository;
  private readonly scoreSecret: string;

  constructor(levelRepository?: ILevelRepository) {
    // In a real DI setup, this would be injected.
    this.levelRepository = levelRepository || new LevelRepository();
    
    if (!process.env.SCORE_SECRET) {
      throw new Error('SCORE_SECRET environment variable is not set for cheat detection.');
    }
    this.scoreSecret = process.env.SCORE_SECRET;
  }

  /**
   * Validates a score submission against various cheating vectors.
   * @param submission The score data from the client.
   * @param leaderboard The definition of the leaderboard the score is for.
   * @param userId The ID of the user submitting the score.
   * @returns A promise that resolves to true if the score is valid, false otherwise.
   */
  public async isScoreValid(submission: SubmitScoreDto, leaderboard: ILeaderboard, userId: string): Promise<boolean> {
    // 1. Checksum Validation
    const isValidHash = this.validateChecksum(submission, leaderboard, userId);
    if (!isValidHash) {
      console.warn(`Invalid checksum for user ${userId} on leaderboard ${leaderboard.keyName}`);
      return false;
    }

    // 2. Score Bounding Validation
    const isWithinBounds = await this.validateScoreBounds(submission, leaderboard);
    if (!isWithinBounds) {
        console.warn(`Score out of bounds for user ${userId} on leaderboard ${leaderboard.keyName}`);
        return false;
    }

    // 3. (Future) Progression Speed Validation
    // This could involve fetching the player's last submission timestamp from another
    // service or repository and checking if the new score was achieved impossibly fast.
    // e.g., const isProgressionSpeedValid = await this.validateProgressionSpeed(userId, submission);
    // if (!isProgressionSpeedValid) return false;
    
    // All checks passed
    return true;
  }

  private validateChecksum(submission: SubmitScoreDto, leaderboard: ILeaderboard, userId: string): boolean {
    const dataToSign = `${userId}|${leaderboard.keyName}|${submission.score}`;
    
    const expectedHash = crypto
      .createHmac('sha256', this.scoreSecret)
      .update(dataToSign)
      .digest('hex');
      
    return crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(submission.validationHash));
  }

  private async validateScoreBounds(submission: SubmitScoreDto, leaderboard: ILeaderboard): Promise<boolean> {
    if (!leaderboard.associatedLevelId) {
        // If leaderboard is not tied to a specific level (e.g., global total score),
        // we can't perform this check.
        return true;
    }

    const level = await this.levelRepository.findById(leaderboard.associatedLevelId);
    if (!level || typeof level.maxPossibleScore === 'undefined') {
        // If level doesn't exist or has no max score defined, we skip the check.
        // This could be logged as a configuration warning.
        return true;
    }

    return submission.score <= level.maxPossibleScore;
  }
}