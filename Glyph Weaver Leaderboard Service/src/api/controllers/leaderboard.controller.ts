import { Router, Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SubmitScoreDto } from '../dtos/submitScore.dto';
import { SubmitScoreHandler, SubmitScoreCommand } from '../../application/useCases/submitScore/submitScore.handler';
import { GetLeaderboardHandler, GetLeaderboardQuery } from '../../application/useCases/getLeaderboard/getLeaderboard.handler';
import { GetPlayerRankHandler, GetPlayerRankQuery } from '../../application/useCases/getPlayerRank/getPlayerRank.handler';
import { ValidationError } from '../../utils/errors';

/**
 * The Express controller that handles all HTTP requests related to leaderboards.
 * It receives HTTP requests, delegates processing to the appropriate application use case handlers,
 * and formats the HTTP response.
 */
export class LeaderboardController {
  public router: Router;

  constructor(
    private readonly submitScoreHandler: SubmitScoreHandler,
    private readonly getLeaderboardHandler: GetLeaderboardHandler,
    private readonly getPlayerRankHandler: GetPlayerRankHandler,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/scores', this.submitScore.bind(this));
    this.router.get('/leaderboards/:leaderboardId', this.getLeaderboard.bind(this));
    this.router.get('/leaderboards/:leaderboardId/rank/:playerId', this.getPlayerRank.bind(this));
  }

  public async submitScore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submitScoreDto = plainToInstance(SubmitScoreDto, req.body);
      const errors = await validate(submitScoreDto);
      if (errors.length > 0) {
        throw new ValidationError(errors);
      }

      const command: SubmitScoreCommand = submitScoreDto;
      await this.submitScoreHandler.execute(command);
      
      res.status(202).send({ message: 'Score accepted for processing.' });
    } catch (error) {
      next(error);
    }
  }

  public async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leaderboardId } = req.params;
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const offset = parseInt(req.query.offset as string, 10) || 0;
      
      const query: GetLeaderboardQuery = { leaderboardId, limit, offset };
      const leaderboardView = await this.getLeaderboardHandler.execute(query);

      res.status(200).json(leaderboardView);
    } catch (error) {
      next(error);
    }
  }

  public async getPlayerRank(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leaderboardId, playerId } = req.params;
      const query: GetPlayerRankQuery = { leaderboardId, playerId };
      const playerRank = await this.getPlayerRankHandler.execute(query);
      
      res.status(200).json(playerRank);
    } catch (error) {
      next(error);
    }
  }
}