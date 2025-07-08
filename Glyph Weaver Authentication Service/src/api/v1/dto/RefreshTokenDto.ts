import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for token refresh requests.
 * Defines the shape and validation rules for the request body.
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token must not be empty.' })
  refreshToken: string;
}