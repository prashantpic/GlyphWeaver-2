import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GrantRewardRequestDTO {
  @IsString()
  @IsNotEmpty()
  rewardType!: string; // e.g., 'rewardedAd', 'dailyBonus'

  @IsString()
  @IsNotEmpty()
  placementId!: string; // e.g., 'gameOverAd', 'storeBonus'

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  validationToken?: string; // Optional token for server-to-server ad validation
}