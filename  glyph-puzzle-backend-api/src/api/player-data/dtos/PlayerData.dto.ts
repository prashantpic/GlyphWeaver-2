import { IsObject, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

// This DTO's structure is highly game-specific.
// 'any' types should be replaced with more specific DTOs or interfaces as the game design matures.
export class PlayerDataDTO {
  @IsOptional()
  @IsObject()
  levelProgress?: any; // e.g., { "world1": { "level1": { stars: 3, score: 1000 }, ... } }

  @IsOptional()
  @IsObject()
  inventory?: any; // e.g., { "hintBooster": 5, "undoToken": 10 }

  @IsOptional()
  @IsObject()
  currency?: any; // e.g., { "coins": 1000, "gems": 50 }

  @IsOptional()
  @IsObject()
  settings?: any; // e.g., { "soundVolume": 0.8, "musicVolume": 0.5, "notificationsEnabled": true }

  @IsNumber()
  @IsNotEmpty()
  version!: number; // Version number for conflict resolution
}