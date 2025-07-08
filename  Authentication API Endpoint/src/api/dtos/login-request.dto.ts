/**
 * @file Defines the DTO for user login requests.
 */

/**
 * Specifies the data contract for a user login request,
 * containing the user's email and password.
 */
export class LoginRequestDto {
  /**
   * The user's email address.
   */
  public email!: string;

  /**
   * The user's password.
   */
  public password!: string;
}