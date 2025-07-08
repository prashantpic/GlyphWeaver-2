import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './utils/logger';
import { requestLogger } from './utils/requestLogger';
import { BaseError, ForbiddenError, NotFoundError, ValidationError } from './utils/errors';

// --- Interface & Placeholder Implementation for DI ---
import { IAuditLogService } from './application/interfaces/IAuditLogService';

class ConsoleAuditLogService implements IAuditLogService {
  async logSuccess(details: object): Promise<void> {
    logger.info('[AUDIT_SUCCESS]', details);
  }
  async logSuspicious(details: object): Promise<void> {
    logger.warn('[AUDIT_SUSPICIOUS]', details);
  }
}

// --- Import Application Components ---
import { LeaderboardController } from './api/controllers/leaderboard.controller';
import { SubmitScoreHandler } from './application/useCases/submitScore/submitScore.handler';
import { GetLeaderboardHandler } from './application/useCases/getLeaderboard/getLeaderboard.handler';
import { GetPlayerRankHandler } from './application/useCases/getPlayerRank/getPlayerRank.handler';
import { CheatDetectionService } from './application/services/cheatDetection.service';
import { RedisCacheService } from './infrastructure/caching/redisCache.service';
import { ScoreRepository } from './infrastructure/persistence/mongo/repositories/score.repository';
import { ScoreModel } from './infrastructure/persistence/mongo/score.schema';

// --- Main Application Class ---
class Application {
  public app: Express;
  private redisCacheService: RedisCacheService;

  constructor() {
    this.app = express();
    this.redisCacheService = new RedisCacheService();
  }

  public async initialize(): Promise<void> {
    this.setupMiddleware();
    await this.connectToDatabases();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({ origin: config.CORS_ORIGIN }));
    this.app.use(express.json());
    this.app.use(requestLogger);
  }

  private async connectToDatabases(): Promise<void> {
    try {
      await mongoose.connect(config.MONGO_URI);
      logger.info('Connected to MongoDB database.');
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      process.exit(1);
    }
    
    try {
      await this.redisCacheService.connect();
    } catch (error) {
      logger.error('Redis connection error:', error);
      process.exit(1);
    }
  }

  private setupRoutes(): void {
    // --- Dependency Injection ---
    const auditLogger = new ConsoleAuditLogService();
    const cheatDetectionService = new CheatDetectionService();
    const scoreRepository = new ScoreRepository(ScoreModel);

    const submitScoreHandler = new SubmitScoreHandler(scoreRepository, this.redisCacheService, cheatDetectionService, auditLogger);
    const getLeaderboardHandler = new GetLeaderboardHandler(scoreRepository, this.redisCacheService);
    const getPlayerRankHandler = new GetPlayerRankHandler(scoreRepository);

    const leaderboardController = new LeaderboardController(submitScoreHandler, getLeaderboardHandler, getPlayerRankHandler);

    this.app.use('/api/v1', leaderboardController.router);

    this.app.get('/health', (req, res) => res.status(200).send('OK'));
  }
  
  private setupErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error(err);

      if (err instanceof ValidationError) {
        return res.status(400).json({ statusCode: 400, message: 'Validation failed', errors: err.errors, error: 'BadRequest' });
      }
      if (err instanceof NotFoundError) {
        return res.status(404).json({ statusCode: 404, message: err.message, error: 'NotFound' });
      }
      if (err instanceof ForbiddenError) {
          return res.status(403).json({ statusCode: 403, message: err.message, error: 'Forbidden' });
      }
      if (err instanceof BaseError) {
        return res.status(err.statusCode).json({ statusCode: err.statusCode, message: err.message, error: err.name });
      }
      
      // Generic server error
      res.status(500).json({
        statusCode: 500,
        message: 'An unexpected error occurred on the server.',
        error: 'InternalServerError',
      });
    });
  }

  public listen(): void {
    this.app.listen(config.PORT, () => {
      logger.info(`🚀 Server running on port ${config.PORT}`);
    });
  }
  
  public async gracefulShutdown(): Promise<void> {
    logger.info('Shutting down gracefully...');
    await mongoose.disconnect();
    await this.redisCacheService.disconnect();
    process.exit(0);
  }
}

const application = new Application();
application.initialize().then(() => {
  application.listen();
});

process.on('SIGINT', () => application.gracefulShutdown());
process.on('SIGTERM', () => application.gracefulShutdown());