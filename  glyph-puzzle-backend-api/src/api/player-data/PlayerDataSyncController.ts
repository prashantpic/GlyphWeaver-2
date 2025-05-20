import { Request, Response, NextFunction } from 'express';
import { IPlayerDataSyncService }_ from '../../services/interfaces/IPlayerDataSyncService';
import { PlayerDataDTO }_ from './dtos/PlayerData.dto';
import { SyncResponseDTO }_ from './dtos/Sync.response.dto';

export class PlayerDataSyncController {
    constructor(private playerDataSyncService: IPlayerDataSyncService) {}

    /**
     * @swagger
     * /player/data:
     *   get:
     *     summary: Fetch authenticated player's data
     *     tags: [Player Data]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Player data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PlayerDataDTO'
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Player data not found
     */
    public async getPlayerData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const playerData: PlayerDataDTO = await this.playerDataSyncService.getPlayerData(playerId);
            res.status(200).json(playerData);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /player/sync:
     *   post:
     *     summary: Synchronize player data
     *     tags: [Player Data]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PlayerDataDTO' # Client version of player data
     *     responses:
     *       200:
     *         description: Synchronization result with latest server data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SyncResponseDTO'
     *       400:
     *         description: Invalid input
     *       401:
     *         description: Unauthorized
     *       409:
     *         description: Sync conflict that could not be automatically resolved
     */
    public async syncPlayerData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const clientData = req.body as PlayerDataDTO;
            const syncResponse: SyncResponseDTO = await this.playerDataSyncService.syncPlayerData(playerId, clientData);
            res.status(200).json(syncResponse);
        } catch (error) {
            next(error);
        }
    }
}