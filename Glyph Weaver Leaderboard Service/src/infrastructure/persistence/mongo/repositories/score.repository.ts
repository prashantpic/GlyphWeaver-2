import { Model } from 'mongoose';
import { IScoreRepository } from '../../../../application/interfaces/IScoreRepository';
import { Score } from '../../../../domain/models/score.model';
import { IScoreDocument, ScoreModel } from '../score.schema';

/**
 * MongoDB-specific implementation of the IScoreRepository interface.
 * Handles all database operations for Score documents using Mongoose.
 */
export class ScoreRepository implements IScoreRepository {
  
  constructor(private readonly scoreModel: Model<IScoreDocument>) {}

  private mapToDomain(doc: IScoreDocument): Score {
    const score = new Score(
      doc.leaderboardId,
      doc.playerId,
      doc.scoreValue,
      doc.tieBreakerValue,
      doc.metadata,
      doc._id.toString(),
      doc.submittedAt
    );
    if (doc.isSuspicious && doc.suspicionReason) {
      score.flagAsSuspicious(doc.suspicionReason);
    }
    return score;
  }

  async add(score: Score): Promise<void> {
    const scoreDoc = new this.scoreModel({
      leaderboardId: score.leaderboardId,
      playerId: score.playerId,
      scoreValue: score.scoreValue,
      tieBreakerValue: score.tieBreakerValue,
      metadata: score.metadata,
      submittedAt: score.submittedAt,
      isSuspicious: score.getIsSuspicious(),
      suspicionReason: score.getSuspicionReason(),
    });
    await scoreDoc.save();
  }

  async getRankedScores(leaderboardId: string, limit: number, offset: number): Promise<Score[]> {
    const scoreDocs = await this.scoreModel
      .find({ leaderboardId, isSuspicious: false })
      .sort({ scoreValue: -1, tieBreakerValue: 1, submittedAt: 1 })
      .skip(offset)
      .limit(limit)
      .exec();
    
    return scoreDocs.map(this.mapToDomain);
  }

  async getPlayerRank(leaderboardId: string, playerId: string): Promise<{ rank: number; score: Score } | null> {
    // Find the player's best score first.
    const playerBestScoreDoc = await this.scoreModel.findOne({
      leaderboardId,
      playerId,
      isSuspicious: false
    }).sort({ scoreValue: -1, tieBreakerValue: 1, submittedAt: 1 });

    if (!playerBestScoreDoc) {
      return null;
    }

    const playerScore = playerBestScoreDoc.scoreValue;
    const playerTieBreaker = playerBestScoreDoc.tieBreakerValue;

    // Count how many other players have a better score.
    // A better score is: higher scoreValue OR same scoreValue and lower tieBreakerValue.
    const higherRankCount = await this.scoreModel.countDocuments({
      leaderboardId,
      isSuspicious: false,
      $or: [
        { scoreValue: { $gt: playerScore } },
        { 
          scoreValue: playerScore,
          tieBreakerValue: { $lt: playerTieBreaker }
        },
        {
          scoreValue: playerScore,
          tieBreakerValue: playerTieBreaker,
          submittedAt: { $lt: playerBestScoreDoc.submittedAt }
        }
      ]
    });

    const rank = higherRankCount + 1;
    const score = this.mapToDomain(playerBestScoreDoc);

    return { rank, score };
  }
}