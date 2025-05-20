import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsObject } from 'class-validator';

export class SubmitScoreRequestDTO {
  @IsString()
  @IsNotEmpty()
  leaderboardId!: string;

  @IsNumber()
  @IsPositive()
  score!: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}