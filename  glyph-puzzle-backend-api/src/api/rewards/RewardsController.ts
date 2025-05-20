import { Request, Response, NextFunction } from 'express';
import { IPlayerRewardsService }_ from '../../services/interfaces/IPlayerRewardsService';
import { GrantRewardRequestDTO }_ from './dtos/GrantReward.request.dto';
import { RewardResponseDTO }_ from './dtos/Reward.response.dto';

export class RewardsController {
    constructor(private playerRewardsService: IPlayerRewardsService) {}

    /**
     * @swagger
     * /rewards/grant:
     *   post:
     *     summary: Grant a player reward
     *     tags: [Player Rewards]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/GrantRewardRequestDTO'
     *     responses:
     *       200:
     *         description: Reward granted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/RewardResponseDTO'
     *       400:
     *         description: Invalid input or reward type
     *       401:
     *         description: Unauthorized
     */
    public async grantReward(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const { rewardType, placementId, validationToken } = req.body as GrantRewardRequestDTO;
            const rewardResponse: RewardResponseDTO = await this.playerRewardsService.grantReward(
                playerId,
                rewardType,
                placementId,
                validationToken
            );
            res.status(200).json(rewardResponse);
        } catch (error) {
            next(error);
        }
    }
}