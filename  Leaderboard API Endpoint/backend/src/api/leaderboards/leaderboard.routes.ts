/**
 * @file Defines and registers all RESTful API routes for leaderboard functionalities.
 * @description This file acts as the entry point for the Leaderboard API, defining the
 * public-facing contract and routing incoming HTTP requests.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards
 */

import { Router, Request, Response, NextFunction } from 'express';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { submitScoreSchema } from './validation/leaderboard.validator.ts';
import { Joi } from 'joi';

// --- Placeholder Middleware ---
// In a real application, these would be imported from a shared middleware directory.
const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
    // Mock user for development. Real implementation would validate JWT.
    (req as any).user = { userId: 'mock-user-id-123', roles: ['player', 'admin'] };
    console.log('JWT Auth Middleware (mock) passed.');
    next();
};

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user && user.roles.includes('admin')) {
        console.log('Admin-Only Middleware passed.');
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
};

const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        res.status(400).json({ message: 'Validation failed', errors });
    } else {
        next();
    }
};
// --- End Placeholder Middleware ---


// --- DI and Controller Instantiation ---
// In a real app, a DI container (like InversifyJS or NestJS's) would manage this.
// For now, we instantiate dependencies manually.
import { LeaderboardService } from './services/leaderboard.service.ts';
import { ScoreRepository } from './repositories/score.repository.ts';
import { LeaderboardRepository } from './repositories/leaderboard.repository.ts';
import { PlayerRepository } from './repositories/player.repository.ts';
import { CheatDetectionService } from './services/cheatDetection.service.ts';
import { CacheProvider } from './providers/cache.provider.ts';
import { AuditService } from './services/audit.service.ts';

const leaderboardService = new LeaderboardService(
    new ScoreRepository(),
    new LeaderboardRepository(),
    new PlayerRepository(),
    new CheatDetectionService(),
    new CacheProvider(),
    new AuditService()
);
const leaderboardController = new LeaderboardController(leaderboardService);
// --- End DI Setup ---


const router = Router();

/**
 * @route GET /api/v1/leaderboards/:leaderboardKey
 * @description Retrieves a paginated view of a leaderboard.
 * @access Private
 */
router.get(
  '/:leaderboardKey',
  jwtAuth,
  leaderboardController.getLeaderboard
);

/**
 * @route POST /api/v1/leaderboards/:leaderboardKey/scores
 * @description Submits a player's score for the specified leaderboard.
 * @access Private
 */
router.post(
  '/:leaderboardKey/scores',
  jwtAuth,
  validate(submitScoreSchema),
  leaderboardController.submitScore
);

/**
 * @route GET /api/v1/leaderboards/:leaderboardKey/rank/me
 * @description Retrieves the authenticated player's rank and surrounding scores.
 * @access Private
 */
router.get(
  '/:leaderboardKey/rank/me',
  jwtAuth,
  leaderboardController.getPlayerRank
);

/**
 * @route POST /api/v1/leaderboards/admin/players/:userId/exclude
 * @description Excludes a player from all leaderboards.
 * @access Admin
 */
router.post(
  '/admin/players/:userId/exclude',
  jwtAuth,
  adminOnly,
  leaderboardController.excludePlayer
);


export default router;