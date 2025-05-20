import { TokenService, JwtPayloadDto } from './token.service';
import { AuditService, AuditEventType, AuditEventDto } from '../audit/audit.service';
import { AUDIT_OUTCOME_SUCCESS, AUDIT_OUTCOME_FAILURE } from '../common/constants/audit.constants';
import { logger } from '../common/utils/logger.util';

// Define UserPrincipal interface as its file is not in the generation list
export interface UserPrincipal {
  userId: string;
  provider: string; // e.g., 'google', 'apple', 'local'
  providerId: string; // User ID from the OAuth provider
  email?: string;
  username?: string; // Could be derived from email or profile
  roles?: string[];
  // other relevant details
  displayName?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

// Define TokenResponseDto interface as its file is not in the generation list
export interface TokenResponseDto {
  accessToken: string;
  refreshToken?: string; // Optional, if refresh tokens are implemented
  expiresIn: number; // Expiration time of the access token in seconds
  tokenType: string;
  user?: UserPrincipal; // Optionally return user info
}

// Define IOAuthUserProfile for standardizing profile data from Passport strategies
export interface IOAuthUserProfile {
  provider: string;
  id: string;
  displayName?: string;
  name?: {
    familyName?: string;
    givenName?: string;
  };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  // Apple specific
  email?: string; // Apple might return email directly
  fullName?: { // Apple specific structure
      firstName?: string;
      lastName?: string;
  };
}


export class AuthService {
  constructor(
    private tokenService: TokenService,
    private auditService: AuditService,
    // private userService: UserService, // Hypothetical service to interact with user data store
  ) {}

  async processOAuthProfile(
    provider: string,
    profile: IOAuthUserProfile,
    // userDetails: any, // This might be specific details from the strategy, e.g., Apple identityToken
    req: any // Express request object for IP, User-Agent
  ): Promise<UserPrincipal> {
    // This is a simplified example. A real implementation would:
    // 1. Normalize the profile data from different providers.
    // 2. Call a UserService to find an existing user by providerId or email,
    //    or create a new user if one doesn't exist.
    // 3. Handle account linking if a user with the same email exists from a different provider.

    const sourceIp = req.ip || req.socket?.remoteAddress;
    const userAgent = req.headers?.['user-agent'];
    
    let userEmail: string | undefined;
    if (profile.emails && profile.emails.length > 0) {
      userEmail = profile.emails[0].value;
    } else if (profile.email) { // For Apple
        userEmail = profile.email;
    }

    let firstName = profile.name?.givenName;
    let lastName = profile.name?.familyName;
    if (provider === 'apple' && profile.fullName) {
        firstName = profile.fullName.firstName || firstName;
        lastName = profile.fullName.lastName || lastName;
    }


    // Placeholder: Simulate user creation/retrieval
    // In a real app, this would involve database interaction via a UserService.
    const userPrincipal: UserPrincipal = {
      userId: `user-${provider}-${profile.id}`, // Simulated unique user ID
      provider: provider,
      providerId: profile.id,
      email: userEmail,
      username: userEmail || profile.displayName?.replace(/\s+/g, '.').toLowerCase() || `user-${profile.id}`,
      displayName: profile.displayName || `${firstName || ''} ${lastName || ''}`.trim(),
      firstName,
      lastName,
      picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
      roles: ['user'], // Default role
    };

    // const user = await this.userService.findOrCreateUser({
    //   provider,
    //   providerId: profile.id,
    //   email: userEmail,
    //   // other details
    // });

    logger.info(`OAuth profile processed for ${provider} user: ${userPrincipal.username} (ID: ${userPrincipal.userId})`);
    await this.auditService.logEvent({
      eventType: AuditEventType.OAUTH_CALLBACK_SUCCESS,
      userId: userPrincipal.userId,
      outcome: AUDIT_OUTCOME_SUCCESS,
      sourceIp,
      userAgent,
      details: { provider, providerId: profile.id, email: userEmail },
    });

    return userPrincipal;
  }

  issueTokens(userPrincipal: UserPrincipal): TokenResponseDto {
    const payloadForToken: Omit<JwtPayloadDto, 'iss' | 'aud' | 'iat' | 'exp'> = {
      sub: userPrincipal.userId,
      userId: userPrincipal.userId,
      username: userPrincipal.username,
      roles: userPrincipal.roles,
      // Add other claims as needed
    };

    const accessToken = this.tokenService.generateAccessToken(payloadForToken);
    const refreshToken = this.tokenService.generateRefreshToken(payloadForToken); // If using refresh tokens

    // Calculate expiresIn in seconds (from string like '15m')
    // This is a simplified way; a robust solution would parse the string.
    // For now, assume TokenService returns JWTs with 'exp' claim.
    // The 'expiresIn' here is for the client.
    const decodedAccessToken = this.tokenService.decodeToken(accessToken);
    const expiresInSeconds = decodedAccessToken?.exp 
        ? decodedAccessToken.exp - Math.floor(Date.now() / 1000)
        : 15 * 60; // Default to 15 minutes if exp not found (should not happen)

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds,
      tokenType: 'Bearer',
      user: userPrincipal, // Optionally return user details
    };
  }

  async handleOAuthLoginFailure(provider: string, error: Error, req: any): Promise<void> {
    const sourceIp = req.ip || req.socket?.remoteAddress;
    const userAgent = req.headers?.['user-agent'];
    logger.error(`OAuth login failure for provider ${provider}:`, error);
    await this.auditService.logEvent({
        eventType: AuditEventType.OAUTH_CALLBACK_FAILURE,
        outcome: AUDIT_OUTCOME_FAILURE,
        sourceIp,
        userAgent,
        details: { provider, error: error.message, stack: error.stack }
    });
  }

  // Example for token refresh, if implemented
  async refreshToken(currentRefreshToken: string, req: any): Promise<TokenResponseDto> {
    const sourceIp = req.ip || req.socket?.remoteAddress;
    const userAgent = req.headers?.['user-agent'];

    const payload = this.tokenService.verifyToken(currentRefreshToken);
    if (!payload || !payload.sub) {
      await this.auditService.logEvent({
        eventType: AuditEventType.TOKEN_REFRESH_FAILURE,
        outcome: AUDIT_OUTCOME_FAILURE,
        sourceIp,
        userAgent,
        details: { reason: 'Invalid or expired refresh token' },
      });
      throw new Error('Invalid or expired refresh token'); // Should be an AuthenticationException
    }

    // Placeholder: In a real app, you might check if the refresh token is revoked (e.g., in a denylist).
    // const user = await this.userService.findById(payload.sub);
    // if (!user /* || user.isRefreshTokenRevoked(currentRefreshToken) */) {
    //   throw new Error('User not found or refresh token revoked');
    // }
    
    // Construct a new UserPrincipal or fetch full details if needed
    const userPrincipal: UserPrincipal = {
        userId: payload.userId,
        provider: payload.provider || 'unknown', // provider info might not be in refresh token
        providerId: payload.providerId || payload.userId, //
        username: payload.username,
        roles: payload.roles,
    };

    const tokens = this.issueTokens(userPrincipal);
    
    await this.auditService.logEvent({
        eventType: AuditEventType.TOKEN_REFRESH_SUCCESS,
        userId: userPrincipal.userId,
        outcome: AUDIT_OUTCOME_SUCCESS,
        sourceIp,
        userAgent,
        details: { oldRefreshTokenJti: payload.jti, newAccessTokenJti: this.tokenService.decodeToken(tokens.accessToken)?.jti },
    });
    return tokens;
  }
}