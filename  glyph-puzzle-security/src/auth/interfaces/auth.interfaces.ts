import { UserPrincipal } from '../domain/user-principal.entity';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { TokenResponseDto } from '../dto/token-response.dto';

export interface IOAuthUserProfile {
    provider: string;
    id: string;
    displayName?: string;
    name?: {
        familyName?: string;
        givenName?: string;
    };
    emails?: Array<{
        value: string;
        verified: boolean;
    }>;
    photos?: Array<{
        value: string;
    }>;
    rawProfile: any; // Store the original profile from the provider
    accessToken?: string; // Optional: store the access token from provider
    refreshToken?: string; // Optional: store the refresh token from provider
}

export interface ITokenService {
    generateAccessToken(payload: JwtPayloadDto): Promise<string>;
    generateRefreshToken?(payload: JwtPayloadDto): Promise<string>; // Optional refresh token generation
    verifyToken(token: string): Promise<JwtPayloadDto>;
    decodeToken(token: string): JwtPayloadDto | null;
}

export interface IAuthService {
    processOAuthProfile(provider: string, profile: IOAuthUserProfile, userDetails?: any): Promise<UserPrincipal>;
    issueTokens(userPrincipal: UserPrincipal): Promise<TokenResponseDto>;
    // Potentially other methods like:
    // validateUser(credentials): Promise<UserPrincipal | null>;
    // refreshToken(token: string): Promise<TokenResponseDto | null>;
}

// Re-exporting for convenience, assuming these are defined elsewhere as per SDS
export { UserPrincipal, JwtPayloadDto, TokenResponseDto };