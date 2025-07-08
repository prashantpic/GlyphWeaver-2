/**
 * @file Defines the DTO for successful authentication responses.
 */

/**
 * Specifies the data contract for a successful authentication response,
 * providing the client with an access token, refresh token, and user identifier.
 */
export class AuthResponseDto {
  /**
   * A short-lived JSON Web Token (JWT) for authenticating API requests.
   */
  public accessToken!: string;

  /**
   * A long-lived JSON Web Token (JWT) used to obtain a new access token.
   */
  public refreshToken!: string;

  /**
   * The unique identifier of the authenticated user.
   */
  public userId!: string;
}