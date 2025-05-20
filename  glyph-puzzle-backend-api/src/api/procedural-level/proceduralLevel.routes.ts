import { Router, Request, Response, NextFunction } from 'express';
import { ProceduralLevelService } from '../../services/ProceduralLevelService';
import { LevelSeedRequestDTO } from './dtos';
import { IAuthRequest } from '../../types/express';

// --- Placeholder for dependencies ---
const placeholderProceduralLevelDataRepository: any = {
    storeSeedRequest: async (data: any) => { console.log('Placeholder: Stored seed request', data.seed); },
    logPlayedLevel: async (data: any) => { console.log('Placeholder: Logged played level', data.seed); },
};
const placeholderAuditLogRepository: any = {
    logEvent: async (event: any) => { console.log(`Placeholder Audit: ${event.eventType} for player ${event.userId}, seed ${event.details?.seed}`); }
};
// const placeholderProceduralGeneratorClient: any = { /* ... if server-side generation was used */ };

const proceduralLevelService = new ProceduralLevelService(
    placeholderProceduralLevelDataRepository,
    placeholderAuditLogRepository
    // placeholderProceduralGeneratorClient
);

class ProceduralLevelController {
    constructor(private levelService: ProceduralLevelService) {}

    async requestNewSeed(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const queryParams = req.query as unknown as LevelSeedRequestDTO; // Query params might need parsing
            const result = await this.levelService.requestNewSeed(playerId, queryParams);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async logUsedSeed(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const bodyParams = req.body as LevelSeedRequestDTO;
            await this.levelService.logUsedSeed(playerId, bodyParams);
            res.status(201).send();
        } catch (error) {
            next(error);
        }
    }
}
const proceduralLevelController = new ProceduralLevelController(proceduralLevelService);

const validationMiddlewarePlaceholder = (dto: any, source: 'body' | 'query' | 'params') =>
    (req: Request, res: Response, next: NextFunction) => {
        console.log(`Validating ${source} against DTO: ${dto.name || 'UnnamedDTO'}`);
        next();
    };

const authMiddlewarePlaceholder = (req: IAuthRequest, res: Response, next: NextFunction) => {
    req.user = { id: 'user1', role: 'player' }; // Attach dummy user
    console.warn("Auth Middleware Placeholder: Defaulting to user 'user1'.");
    next();
};
// --- End of Placeholder dependencies ---

const router = Router();

// REQ-CGLE-011, REQ-8-027
router.get(
    '/seed',
    authMiddlewarePlaceholder,
    validationMiddlewarePlaceholder(LevelSeedRequestDTO, 'query'),
    proceduralLevelController.requestNewSeed.bind(proceduralLevelController)
);

router.post(
    '/log-seed',
    authMiddlewarePlaceholder,
    validationMiddlewarePlaceholder(LevelSeedRequestDTO, 'body'),
    proceduralLevelController.logUsedSeed.bind(proceduralLevelController)
);

export default router;