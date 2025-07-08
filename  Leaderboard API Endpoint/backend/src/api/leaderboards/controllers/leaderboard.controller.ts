/**
 * @file Handles incoming HTTP requests for leaderboards.
 * @description This controller manages the request/response cycle for leaderboard operations,
 * delegating all business logic to the application service layer.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Controllers
 */

import { Request, Response, NextFunction } from 'express';
import { ILeaderboardService, SubmitScoreDto } from '../interfaces/leaderboard.interfaces';

// A helper to extend the Express Request type
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    // other JWT payload fields
  };
}

export class LeaderboardController {
  // Injected via constructor
  private readonly leaderboardService: ILeaderboardService;

  constructor(leaderboardService: ILeaderboardService) {
    this.leaderboardService = leaderboardService;
    // Bind `this` to ensure it's correct when Express calls the methods
    this.getLeaderboard = this.getLeaderboard.bind(this);
    this.submitScore = this.submitScore.bind(this);
    this.getPlayerRank = this.getPlayerRank.bind(this);
    this.excludePlayer = this.excludePlayer.bind(this);
  }

  /**
   * Handles GET /:leaderboardKey
   * Retrieves a paginated view of a leaderboard.
   */
  public async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leaderboardKey } = req.params;
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);
      
      const leaderboardView = await this.leaderboardService.getLeaderboardView(leaderboardKey, { limit, offset });
      
      res.status(200).json(leaderboardView);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles POST /:leaderboardKey/scores
   * Submits a player's score for the specified leaderboard.
   */
  public async submitScore(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leaderboardKey } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        // This should ideally be caught by the auth middleware
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }
      
      const submission = req.body as SubmitScoreDto;
      
      const result = await this.leaderboardService.processScoreSubmission(leaderboardKey, userId, submission);
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles GET /:leaderboardKey/rank/me
   * Retrieves the authenticated player's specific rank and score.
   */
  public async getPlayerRank(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leaderboardKey } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      const playerRankView = await this.leaderboardService.getPlayerRankView(leaderboardKey, userId);

      res.status(200).json(playerRankView);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles POST /admin/players/:userId/exclude
   * Excludes a player from all leaderboards. Admin only.
   */
  public async excludePlayer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const adminId = req.user?.userId;
        if (!adminId) {
            res.status(401).json({ message: 'Authentication required for admin action.'});
            return;
        }

        const { userId: userIdToExclude } = req.params;
        
        await this.leaderboardService.excludePlayerFromLeaderboards(userIdToExclude, adminId);
        
        res.status(204).send();
    } catch (error) {
        next(error);
    }
  }
}