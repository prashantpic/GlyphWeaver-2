import { IsOptional, IsNumber, IsString, IsIn, IsObject, Min, IsPositive } from 'class-validator';

export class LevelSeedRequestDTO {
  @IsOptional()
  @IsNumber()
  @Min(1)
  difficultyLevel?: number;

  @IsOptional()
  @IsObject()
  playerProgression?: any;

  @IsOptional()
  @IsObject()
  seedParameters?: any;

  // Fields for logging a used seed
  @IsOptional()
  @IsString()
  seed?: string;

  @IsOptional()
  @IsString()
  @IsIn(['win', 'loss'])
  outcome?: 'win' | 'loss';

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  duration?: number; // in seconds, for example

  @IsOptional()
  @IsObject()
  playerActions?: any;
}