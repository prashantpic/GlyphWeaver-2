import { IScoreRepository } from '../../interfaces/IScoreRepository';
import { ICacheService } from '../../interfaces/ICacheService';
import { CheatDetectionService } from '../../services/cheatDetection.service';
import { IAuditLogService } from '../../interfaces/IAuditLogService';
import { Score } from '../../../domain/models/score.model';
import { SubmitScoreDto } from '../../../api/dtos/submitScore.dto';
import { ForbiddenError, ServerError } from '../../../utils/errors';
import { logger } from '../../../utils/logger';

// Command is structurally identical to the DTO in this case.
export type SubmitScoreCommand = SubmitScoreDto;

/**
 * Handles the business logic for the 'Submit Score' use case.
 * It orchestrates the entire process of a score submission, including validation,
 * persistence, and cache management, ensuring data integrity and consistency.
 */
export class SubmitScoreHandler {
  constructor(
    private readonly scoreRepository: IScoreRepository,
    private readonly cacheService: ICacheService,
    private readonly cheatDetectionService: CheatDetectionService,
    private readonly auditLogger: IAuditLogService
  ) {}

  public async execute(command: SubmitScoreCommand): Promise<void> {
    const { isAnomalous, reason } = await this.cheatDetectionService.isScoreAnomalous(command);

    if (isAnomalous) {
      const auditDetails = { ...command, reason };
      await this.auditLogger.logSuspicious(auditDetails);
      throw new ForbiddenError(reason || 'Score rejected by cheat detection.');
    }

    const scoreEntity = new Score(
      command.leaderboardId,
      command.playerId,
      command.scoreValue,
      command.tieBreakerValue,
      command.metadata
    );

    try {
      await this.scoreRepository.add(scoreEntity);

      // Asynchronously invalidate the cache for this leaderboard
      const cachePattern = `leaderboard:${command.leaderboardId}:*`;
      this.cacheService.delByPattern(cachePattern).catch(err => {
        logger.error(`Failed to invalidate cache for pattern ${cachePattern}`, err);
      });

      await this.auditLogger.logSuccess({
        playerId: command.playerId,
        leaderboardId: command.leaderboardId,
        scoreValue: command.scoreValue,
        // ipAddress could be added from request in controller
      });

    } catch (error) {
      logger.error('Failed to persist score', { error, command });
      throw new ServerError('Could not process score submission.');
    }
  }
}