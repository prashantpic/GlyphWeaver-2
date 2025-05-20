/**
 * Defines the structure of the JWT payload.
 * Standard claims (sub, iss, aud, exp, iat) are typically handled by the JWT library.
 * This DTO focuses on the custom claims embedded within the token.
 */
export class JwtPayloadDto {
  /**
   * Subject - Standard JWT claim, typically the user ID.
   */
  sub: string; // User ID

  /**
   * Issuer - Standard JWT claim.
   */
  iss?: string;

  /**
   * Audience - Standard JWT claim.
   */
  aud?: string;

  /**
   * Expiration Time - Standard JWT claim (timestamp).
   */
  exp?: number;

  /**
   * Issued At - Standard JWT claim (timestamp).
   */
  iat?: number;

  // Custom claims aligning with UserPrincipal
  userId: string;
  username?: string;
  email?: string;
  roles: string[];
  permissions?: string[];
  provider?: string;

  constructor(
    userId: string,
    roles: string[],
    username?: string,
    email?: string,
    permissions?: string[],
    provider?: string,
    iss?: string,
    aud?: string,
  ) {
    this.sub = userId; // Typically, subject is the user ID
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.permissions = permissions;
    this.provider = provider;
    this.iss = iss;
    this.aud = aud;
    // exp and iat are usually set by the token generation service
  }
}