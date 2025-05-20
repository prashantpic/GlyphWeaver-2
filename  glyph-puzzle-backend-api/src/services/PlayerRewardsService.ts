import { IPlayerRewardsService } from './interfaces/IPlayerRewardsService';
import { IInventoryRepository } from './interfaces/IInventoryRepository';
import { ICurrencyRepository } from './interfaces/ICurrencyRepository';
import { IAuditLogRepository } from './interfaces/IAuditLogRepository';
import { IRewardDefinitionRepository } from './interfaces/IRewardDefinitionRepository'; // To look up reward details
// Assuming DTOs are in src/api/rewards/dtos
import { GrantRewardRequestDTO, RewardResponseDTO } from '../api/rewards/dtos';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

// REQ-8-002, REQ-SEC-019, REQ-8-019, REQ-8-016

export class PlayerRewardsService implements IPlayerRewardsService {
    constructor(
        private inventoryRepository: IInventoryRepository,
        private currencyRepository: ICurrencyRepository,
        private auditLogRepository: IAuditLogRepository,
        private rewardDefinitionRepository: IRewardDefinitionRepository, // For reward definitions
    ) {}

    async grantReward(playerId: string, request: GrantRewardRequestDTO): Promise<RewardResponseDTO> {
        const { rewardType, placementId, validationToken } = request;
        logger.info(`Attempting to grant reward for player ${playerId}, type: ${rewardType}, placement: ${placementId}`);

        // 1. Validate the reward request (e.g., using validationToken with an ad network S2S callback if applicable)
        // For this example, we'll assume a simpler validation or that it's pre-validated if no token
        if (validationToken) {
            // const isValidToken = await someExternalValidationService.verify(validationToken, rewardType, placementId);
            // if (!isValidToken) {
            //     logger.warn(`Invalid reward validation token for player ${playerId}, type ${rewardType}`);
            //     throw new ApiError('Invalid reward validation token.', 400);
            // }
            logger.info(`Reward validation token received: ${validationToken} (validation logic placeholder)`);
        }

        // 2. Look up reward details based on rewardType and placementId
        const rewardDefinition = await this.rewardDefinitionRepository.findByTypeAndPlacement(rewardType, placementId);
        if (!rewardDefinition) {
            logger.warn(`No reward definition found for type ${rewardType}, placement ${placementId}.`);
            throw new ApiError('Reward definition not found.', 404);
        }

        // Potentially check for reward cooldowns or frequency caps for this player/reward type
        // e.g., await this.checkRewardCooldown(playerId, rewardDefinition.id);

        // 3. Grant items/currency
        const grantedItems: Array<{ itemId: string, quantity: number }> = [];
        const grantedCurrency: Array<{ currencyId: string, amount: number }> = [];

        if (rewardDefinition.currencyGrants) {
            for (const grant of rewardDefinition.currencyGrants) {
                await this.currencyRepository.credit(playerId, grant.currencyId, grant.amount);
                grantedCurrency.push(grant);
            }
        }
        if (rewardDefinition.itemGrants) {
            for (const grant of rewardDefinition.itemGrants) {
                await this.inventoryRepository.addItem(playerId, grant.itemId, grant.quantity);
                grantedItems.push(grant);
            }
        }

        // 4. Log the reward grant
        await this.auditLogRepository.logEvent({
            eventType: 'PLAYER_REWARD_GRANTED',
            userId: playerId,
            details: { rewardType, placementId, rewardDefinitionId: rewardDefinition.id, grantedItems, grantedCurrency },
        });

        logger.info(`Reward granted successfully to player ${playerId}: ${JSON.stringify({ grantedItems, grantedCurrency })}`);

        return {
            success: true,
            grantedItems: grantedItems.length > 0 ? grantedItems : undefined,
            grantedCurrency: grantedCurrency.length > 0 ? grantedCurrency : undefined,
        };
    }
}