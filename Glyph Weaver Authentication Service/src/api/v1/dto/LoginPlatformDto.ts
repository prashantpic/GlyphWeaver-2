import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

/**
 * Enum defining the supported authentication platforms.
 */
export enum Platform {
  GOOGLE = 'google',
  APPLE = 'apple',
}

/**
 * Data Transfer Object for third-party platform login requests.
 * Defines the shape and validation rules for the request body.
 */
export class LoginPlatformDto {
  @IsEnum(Platform, { message: 'Platform must be either "google" or "apple".' })
  platform: Platform;

  @IsString()
  @IsNotEmpty({ message: 'Platform token must not be empty.' })
  token: string; // The ID token from Google or identity token from Apple
}