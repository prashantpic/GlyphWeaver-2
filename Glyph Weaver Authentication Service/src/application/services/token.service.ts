import jwt from 'jsonwebtoken';
import { TokenModel } from '../../domain/models/token.model';
import { UnauthorizedException } from '../../api/v1/middleware/error.handler';
import { IUser } from '../../domain/models/user.model';
import Logger from '../../infrastructure/logging/logger';

interface ITokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * A specialized service for creating, signing, and verifying JSON Web Tokens (JWTs).
 * It also manages the persistence and lifecycle of refresh tokens.
 */
export class TokenService {

  /**
   * Generates a new pair of access and refresh tokens for a user.
   * The new refresh token is persisted to the database, overwriting any old one.
   * @param payload - The data to include in the token, typically the user's ID.
   * @returns A promise that resolves to an object containing the new accessToken and refreshToken.
   */
  public async generateAuthTokens(payload: { userId: string }): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION!,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION!,
    });

    // Decode the new refresh token to get its expiration date
    const decoded = jwt.decode(refreshToken) as ITokenPayload;
    const expiresAt = new Date(decoded.exp * 1000);

    // Save the new refresh token to the database.
    // This implements refresh token rotation by replacing the old token.
    await TokenModel.findOneAndUpdate(
      { userId: payload.userId },
      { token: refreshToken, expiresAt },
      { upsert: true, new: true }
    ).exec();

    return { accessToken, refreshToken };
  }

  /**
   * Verifies a refresh token, checks its validity in the database, and deletes it upon use.
   * This one-time-use strategy enhances security.
   * @param token - The refresh token string to verify.
   * @returns A promise that resolves to the decoded token payload if valid.
   * @throws {UnauthorizedException} if the token is invalid, not found, or already used.
   */
  public async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    // Find the token in the database first.
    const tokenDoc = await TokenModel.findOne({ token }).exec();
    if (!tokenDoc) {
      Logger.warn(`Attempt to use a non-existent or already used refresh token.`);
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    try {
      // Verify the token's signature and expiration.
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

      // CRITICAL: Delete the token after it has been successfully verified to prevent reuse.
      await TokenModel.findByIdAndDelete(tokenDoc._id);

      return payload;
    } catch (error) {
      // If verification fails (e.g., expired, bad signature), also remove the invalid token from DB.
      await TokenModel.findByIdAndDelete(tokenDoc._id);
      Logger.warn(`Refresh token verification failed: ${error}`);
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }
}