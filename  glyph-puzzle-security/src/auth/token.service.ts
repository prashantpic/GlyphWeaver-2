import * as jwt from 'jsonwebtoken';
import { JwtConfig } from '../config/jwt.config';
import { logger } from '../common/utils/logger.util';

// Define JwtPayloadDto interface as its file is not in the generation list
export interface JwtPayloadDto {
  sub: string; // Subject (usually userId)
  userId: string; // Custom claim for convenience
  username?: string; // Optional: username
  roles?: string[]; // Optional: user roles
  // Standard claims
  iss?: string; // Issuer
  aud?: string; // Audience
  iat?: number; // Issued At (Unix timestamp)
  exp?: number; // Expiration Time (Unix timestamp)
  jti?: string; // JWT ID
  [key: string]: any; // Allow other custom claims
}

export class TokenService {
  constructor(private jwtConfig: JwtConfig) {}

  generateAccessToken(payload: Omit<JwtPayloadDto, 'iss' | 'aud' | 'iat' | 'exp'>): string {
    const expiresIn = this.jwtConfig.accessTokenExpirationTime;
    const options: jwt.SignOptions = {
      expiresIn,
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience,
      algorithm: this.jwtConfig.algorithm as jwt.Algorithm, // Ensure algorithm is a valid type
    };
    // Add iat automatically by jwt.sign
    const tokenPayload: Partial<JwtPayloadDto> = {
        ...payload,
        sub: payload.sub || payload.userId, // Ensure sub is set
    };
    return jwt.sign(tokenPayload, this.jwtConfig.secretOrPrivateKey, options);
  }

  generateRefreshToken(payload: Omit<JwtPayloadDto, 'iss' | 'aud' | 'iat' | 'exp'>): string {
    // Refresh tokens typically have longer expiration
    const expiresIn = this.jwtConfig.refreshTokenExpirationTime;
    const options: jwt.SignOptions = {
      expiresIn,
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience, // Can be a specific audience for refresh tokens
      algorithm: this.jwtConfig.algorithm as jwt.Algorithm,
    };
     const tokenPayload: Partial<JwtPayloadDto> = {
        ...payload,
        sub: payload.sub || payload.userId, // Ensure sub is set
    };
    return jwt.sign(tokenPayload, this.jwtConfig.secretOrPrivateKey, options); // Potentially use a different secret for refresh tokens
  }

  verifyToken(token: string): JwtPayloadDto | null {
    try {
      const decoded = jwt.verify(token, this.jwtConfig.secretOrPublicKey || this.jwtConfig.secretOrPrivateKey, {
        issuer: this.jwtConfig.issuer,
        audience: this.jwtConfig.audience,
        algorithms: [this.jwtConfig.algorithm as jwt.Algorithm],
      }) as JwtPayloadDto;
      return decoded;
    } catch (error) {
      logger.warn('Token verification failed:', (error as Error).message);
      return null;
    }
  }

  decodeToken(token: string): JwtPayloadDto | null {
    // Decodes without verifying signature. Use with caution.
    try {
      const decoded = jwt.decode(token) as JwtPayloadDto;
      return decoded;
    } catch (error) {
      logger.warn('Token decoding failed:', (error as Error).message);
      return null;
    }
  }
}