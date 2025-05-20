import { Request, Response, NextFunction } from 'express';
import { IProceduralLevelService }_ from '../../services/interfaces/IProceduralLevelService';
import { LevelSeedRequestDTO }_ from './dtos/LevelSeed.request.dto'; // Used for both request and log
import { LevelSeedResponseDTO }_ from './dtos/LevelSeed.response.dto';

export class ProceduralLevelController {
    constructor(private proceduralLevelService: IProceduralLevelService) {}

    /**
     * @swagger
     * /levels/procedural/seed:
     *   get:
     *     summary: Request a procedural level seed
     *     tags: [Procedural Levels]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: difficultyLevel
     *         schema:
     *           type: integer
     *         description: Desired difficulty level for the seed
     *       # Add other query parameters from LevelSeedRequestDTO as needed
     *     responses:
     *       200:
     *         description: Procedural level seed and parameters
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LevelSeedResponseDTO'
     *       400:
     *         description: Invalid parameters
     *       401:
     *         description: Unauthorized
     */
    public async requestNewSeed(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const parameters = req.query as LevelSeedRequestDTO; // Partial, for requesting
            const seedResponse: LevelSeedResponseDTO = await this.proceduralLevelService.requestNewSeed(playerId, parameters);
            res.status(200).json(seedResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /levels/procedural/log-seed:
     *   post:
     *     summary: Log details of a procedural level played by the client
     *     tags: [Procedural Levels]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LevelSeedRequestDTO' # Full DTO for logging
     *     responses:
     *       201:
     *         description: Seed log accepted
     *       400:
     *         description: Invalid input
     *       401:
     *         description: Unauthorized
     */
    public async logUsedSeed(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const logData = req.body as LevelSeedRequestDTO; // Full DTO for logging
            await this.proceduralLevelService.logUsedSeed(playerId, logData);
            res.status(201).send();
        } catch (error) {
            next(error);
        }
    }
}