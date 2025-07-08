import * as crypto from 'crypto';
import { config } from '../../config';
import { SubmitScoreDto } from '../../api/dtos/submitScore.dto';

/**
 * A service responsible for analyzing score submissions for potential cheating.
 * Encapsulates the logic for identifying suspicious scores based on game rules and heuristics.
 * Implements REQ-SEC-005.
 */
export class CheatDetectionService {
  // This could be fetched from a game content service or level configuration
  private readonly MAX_POSSIBLE_SCORE = 1000000;

  /**
   * Analyzes a score submission for anomalies.
   * @param scoreSubmission The DTO containing the score data and validation payload.
   * @returns An object indicating if the score is anomalous and the reason.
   */
  public async isScoreAnomalous(
    scoreSubmission: SubmitScoreDto
  ): Promise<{ isAnomalous: boolean; reason: string | null }> {
    
    // 1. Sanity Check: Is the score value within a reasonable range?
    if (scoreSubmission.scoreValue > this.MAX_POSSIBLE_SCORE) {
      return { isAnomalous: true, reason: 'Score exceeds maximum possible value.' };
    }
    if (scoreSubmission.scoreValue < 0) {
      return { isAnomalous: true, reason: 'Score value cannot be negative.' };
    }

    // 2. Payload Integrity: Validate the HMAC checksum.
    if (!this.isPayloadValid(scoreSubmission)) {
        return { isAnomalous: true, reason: 'Invalid validation payload.' };
    }

    // 3. Velocity Check (Future enhancement)
    // Could check against player's submission history to flag impossibly fast progression.

    return { isAnomalous: false, reason: null };
  }

  /**
   * Re-calculates a checksum/HMAC on the server and compares it with the one from the client.
   * @param submission The score submission DTO.
   * @returns True if the payload is valid, false otherwise.
   */
  private isPayloadValid(submission: SubmitScoreDto): boolean {
    const { validationPayload, ...dataToValidate } = submission;
    
    // Create a deterministic, ordered string from the critical data.
    // The client must generate its HMAC from the exact same string structure.
    const dataString = `playerId:${dataToValidate.playerId}|leaderboardId:${dataToValidate.leaderboardId}|scoreValue:${dataToValidate.scoreValue}|tieBreakerValue:${dataToValidate.tieBreakerValue}|levelId:${dataToValidate.metadata?.levelId ?? ''}`;

    const expectedHmac = crypto
      .createHmac('sha256', config.CLIENT_SECRET)
      .update(dataString)
      .digest('hex');
      
    // Use timing-safe comparison to prevent timing attacks.
    try {
      return crypto.timingSafeEqual(
        Buffer.from(validationPayload, 'hex'),
        Buffer.from(expectedHmac, 'hex')
      );
    } catch {
      // This catches errors if buffers have different lengths, which means they don't match.
      return false;
    }
  }
}