import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenRequestDTO {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}