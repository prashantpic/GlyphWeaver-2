import { Request, Response, NextFunction } from 'express';
import { ILeaderboardService }_ from '../../services/interfaces/ILeaderboardService';
import { SubmitScoreRequestDTO }_ from './dtos/SubmitScore.request.dto';
import { LeaderboardQueryDTO }_ from './dtos/LeaderboardQuery.dto';
import { LeaderboardResponseDTO }_ from './dtos/Leaderboard.response.dto';

export class LeaderboardController {
    constructor(private leaderboardService: ILeaderboardService) {}

    /**
     * @swagger
     * /leaderboard/scores:
     *   post:
     *     summary: Submit score for a specific leaderboard
     *     tags: [Leaderboard]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SubmitScoreRequestDTO'
     *     responses:
     *       201:
     *         description: Score submitted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 rank:
     *                   type: number
     *                 score:
     *                    type: number
     *       400:
     *         description: Invalid input
     *       401:
     *         description: Unauthorized
     */
    public async submitScore(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { leaderboardId, score, metadata } = req.body as SubmitScoreRequestDTO;
            const playerId = req.user!.id; // Assuming authMiddleware populates req.user
            const result = await this.leaderboardService.submitScore(playerId, leaderboardId, score, metadata);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /leaderboard/{id}:
     *   get:
     *     summary: Get leaderboard data
     *     tags: [Leaderboard]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Leaderboard ID
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Number of entries to return
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *         description: Offset for pagination
     *       - in: query
     *         name: timeScope
     *         schema:
     *           type: string
     *           enum: [daily, weekly, all]
     *         description: Time scope for the leaderboard
     *       - in: query
     *         name: playerId
     *         schema:
     *           type: string
     *         description: Player ID to fetch specific player rank (optional)
     *     responses:
     *       200:
     *         description: Leaderboard data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LeaderboardResponseDTO'
     *       400:
     *         description: Invalid parameters
     *       404:
     *         description: Leaderboard not found
     */
    public async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const leaderboardId = req.params.id;
            const queryParams = req.query as LeaderboardQueryDTO;
            const requestingPlayerId = req.user?.id; // For fetching player's rank if authenticated
            const leaderboardData: LeaderboardResponseDTO = await this.leaderboardService.getLeaderboard(leaderboardId, queryParams, requestingPlayerId);
            res.status(200).json(leaderboardData);
        } catch (error) {
            next(error);
        }
    }
}