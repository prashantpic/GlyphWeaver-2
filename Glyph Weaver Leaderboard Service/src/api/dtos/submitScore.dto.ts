import { IsString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsUUID } from 'class-validator';

/**
 * Data Transfer Object for validating the score submission payload from the client.
 * Uses class-validator decorators to enforce the contract for the 'submit score' API endpoint.
 * This ensures that incoming requests are well-formed before being processed.
 */
export class SubmitScoreDto {
  @IsUUID()
  @IsNotEmpty()
  leaderboardId: string;

  @IsUUID()
  @IsNotEmpty()
  playerId: string;

  @IsNumber()
  scoreValue: number;

  @IsNumber()
  tieBreakerValue: number;

  @IsObject()
  @IsOptional()
  metadata: {
    levelId: string;
    moves: number;
  };

  @IsString()
  @IsNotEmpty()
  validationPayload: string;
}