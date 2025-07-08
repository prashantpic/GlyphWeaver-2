/**
 * @file Defines the contract for a service that handles JWT creation and verification.
 */

/**
 * Payload contained within the JWT.
 */
export interface TokenPayload {
  userId: string;
}

/**
 * Represents the pair of tokens generated on successful authentication.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Interface for a service that handles JSON Web Token (JWT) operations.
 * This abstraction allows for different JWT implementations or libraries to be used.
 */
export interface ITokenService {
  /**
   * Generates a new pair of access and refresh tokens.
   * @param payload - The data to embed in the tokens, typically the user's ID.
   * @returns A promise that resolves to an object containing the access and refresh tokens.
   */
  generateTokens(payload: TokenPayload): Promise<TokenPair>;

  /**
   * Verifies an access token.
   * @param token - The access token string to verify.
   * @returns A promise that resolves to the token's payload if valid.
   * @throws {Error} If the token is invalid or expired.
   */
  verifyAccessToken(token: string): Promise<TokenPayload>;

  /**
   * Verifies a refresh token.
   * @param token - The refresh token string to verify.
   * @returns A promise that resolves to the token's payload if valid.
   * @throws {Error} If the token is invalid or expired.
   */
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}