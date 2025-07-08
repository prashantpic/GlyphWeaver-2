import { OAuth2Client } from 'google-auth-library';
import { verify } from 'node-apple-signin-auth';
import { Platform } from '../../api/v1/dto/LoginPlatformDto';
import { UnauthorizedException } from '../../api/v1/middleware/error.handler';
import Logger from '../../infrastructure/logging/logger';

/**
 * Defines the contract for a service that validates platform-specific identity tokens.
 */
export interface IPlatformTokenValidator {
  /**
   * Validates a token from a specific platform.
   * @param platform - The platform ('google' or 'apple').
   * @param token - The identity token from the client.
   * @returns A promise resolving to an object with the platform-specific user ID and email.
   * @throws {UnauthorizedException} if the token is invalid.
   */
  validate(platform: Platform, token: string): Promise<{ platformUserId: string; email?: string }>;
}

/**
 * Encapsulates the logic for validating identity tokens from Google and Apple.
 */
export class PlatformTokenValidator implements IPlatformTokenValidator {
  private readonly googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  public async validate(platform: Platform, token: string): Promise<{ platformUserId: string; email?: string }> {
    switch (platform) {
      case Platform.GOOGLE:
        return this.validateGoogleToken(token);
      case Platform.APPLE:
        return this.validateAppleToken(token);
      default:
        Logger.warn(`Unsupported platform validation attempted: ${platform}`);
        throw new UnauthorizedException('Unsupported authentication platform.');
    }
  }

  private async validateGoogleToken(token: string): Promise<{ platformUserId: string; email?: string }> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new Error('Google token payload is invalid.');
      }

      return {
        platformUserId: payload.sub,
        email: payload.email,
      };
    } catch (error: any) {
      Logger.error(`Google token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid Google token.');
    }
  }

  private async validateAppleToken(token: string): Promise<{ platformUserId: string; email?: string }> {
    try {
      const payload = await verify({
        identityToken: token,
        audience: process.env.APPLE_CLIENT_ID,
      });

      if (!payload || !payload.sub) {
        throw new Error('Apple token payload is invalid.');
      }

      return {
        platformUserId: payload.sub,
        email: payload.email, // Note: email is only sent on the first sign-in from Apple
      };
    } catch (error: any) {
      Logger.error(`Apple token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid Apple token.');
    }
  }
}