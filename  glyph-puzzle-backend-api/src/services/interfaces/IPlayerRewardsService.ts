import { GrantRewardRequestDTO } from '../../api/rewards/dtos/GrantReward.request.dto';
import { RewardResponseDTO } from '../../api/rewards/dtos/Reward.response.dto';

export interface IPlayerRewardsService {
  /**
   * Grants a reward to a player, typically after an ad view or other event.
   * @param playerId - The ID of the player receiving the reward.
   * @param grantRewardDto - DTO containing reward details.
   * @returns A promise that resolves to a RewardResponseDTO.
   */
  grantReward(
    playerId: string,
    grantRewardDto: GrantRewardRequestDTO,
  ): Promise<RewardResponseDTO>;
}