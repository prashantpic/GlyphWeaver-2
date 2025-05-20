import { Router, Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../../services/LeaderboardService';
import { SubmitScoreRequestDTO, LeaderboardQueryDTO, LeaderboardResponseDTO } from './dtos';
import { IAuthRequest } from '../../types/express'; // For req.user

// --- Placeholder for dependencies ---
const placeholderScoreRepository: any = {
    submitScore: async (playerId: string, leaderboardId: string, score: number, metadata?: any) => ({
        id: 'score1', userId: playerId, leaderboardId, scoreValue: score, timestamp: new Date(), metadata
    }),
    getPlayerBestScore: async (playerId: string, leaderboardId: string, timeScope?: string) => {
        if (playerId === 'user1' && leaderboardId === 'global1') return { scoreValue: 1000 };
        return null;
    }
};
const placeholderLeaderboardRepository: any = {
    findById: async (id: string) => ({ id, name: `Leaderboard ${id}`, isActive: true }),
    getEntries: async (leaderboardId: string, options: any) => [
        { userId: 'user1', scoreValue: 1000, rank: 1 }, { userId: 'user2', scoreValue: 900, rank: 2 }
    ],
    getPlayerRank: async (playerId: string, leaderboardId: string, timeScope?: string) => {
        if (playerId === 'user1' && leaderboardId === 'global1') return 1;
        if (playerId === 'user2' && leaderboardId === 'global1') return 2;
        return 999;
    },
    getTotalEntries: async (leaderboardId: string, timeScope?: string) => 2,
};
const placeholderPlayerRepository: any = { // Needed by LeaderboardService
    findByIds: async (ids: string[]) => ids.map(id => ({ id, username: `Player ${id}` })),
    findById: async (id: string) => ({ id, username: `Player ${id}`})
};
const placeholderCacheService: any = {
    get: async (key: string) => null,
    set: async (key: string, value: any, ttl?: number) => {},
    del: async (key: string) => {},
};
const leaderboardService = new LeaderboardService(
    placeholderScoreRepository,
    placeholderLeaderboardRepository,
    placeholderPlayerRepository,
    placeholderCacheService
);

class LeaderboardController {
    constructor(private leaderboardService: LeaderboardService) {}

    async submitScore(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id; // Auth middleware ensures req.user exists
            const requestBody = req.body as SubmitScoreRequestDTO;
            const result = await this.leaderboardService.submitScore(playerId, requestBody);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const leaderboardId = req.params.id;
            const queryParams = req.query as LeaderboardQueryDTO;
            const result = await this.leaderboardService.getLeaderboard(leaderboardId, queryParams);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
const leaderboardController = new LeaderboardController(leaderboardService);

const validationMiddlewarePlaceholder = (dto: any, source: 'body' | 'query' | 'params') =>
    (req: Request, res: Response, next: NextFunction) => {
        console.log(`Validating ${source} against DTO: ${dto.name || 'UnnamedDTO'}`);
        next();
    };

const authMiddlewarePlaceholder = (req: IAuthRequest, res: Response, next: NextFunction) => {
    // Simulate auth: extract token, verify, attach user
    // This is a placeholder for the actual auth.middleware.ts
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token === 'valid.jwt.token') { // Dummy token
            req.user = { id: 'user1', role: 'player' }; // Attach dummy user
            return next();
        }
    }
    // res.status(401).json({ message: 'Unauthorized' });
    // For testing, allow if no token or dummy token
    req.user = { id: 'user1', role: 'player' }; // Default to user1 for testing if no auth
    console.warn("Auth Middleware Placeholder: Defaulting to user 'user1'. Provide 'Bearer valid.jwt.token' for simulated auth.");
    next();
};
// --- End of Placeholder dependencies ---

const router = Router();

// REQ-SCF-003
router.post(
    '/scores',
    authMiddlewarePlaceholder,
    validationMiddlewarePlaceholder(SubmitScoreRequestDTO, 'body'),
    leaderboardController.submitScore.bind(leaderboardController)
);

router.get(
    '/:id',
    // authMiddlewarePlaceholder, // Auth might be optional for public leaderboards
    validationMiddlewarePlaceholder(LeaderboardQueryDTO, 'query'),
    leaderboardController.getLeaderboard.bind(leaderboardController)
);

export default router;