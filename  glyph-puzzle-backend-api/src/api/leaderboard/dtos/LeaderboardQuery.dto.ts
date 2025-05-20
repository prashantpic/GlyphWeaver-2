import { IsOptional, IsInt, Min, Max, IsString, IsIn, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class LeaderboardQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Example max limit
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly', 'all'])
  timeScope?: 'daily' | 'weekly' | 'all';

  @IsOptional()
  @IsString()
  // @IsUUID('4') // If player IDs are UUIDs
  playerId?: string; // To fetch a specific player's rank or filter by player in some contexts
}