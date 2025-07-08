/**
 * @file Defines the DTO for user registration requests.
 */

/**
 * Specifies the data contract for a new user registration request,
 * containing the user's desired username, email, and password.
 */
export class RegisterRequestDto {
  /**
   * The desired username for the new account.
   */
  public username!: string;

  /**
   * The email address for the new account.
   */
  public email!: string;

  /**
   * The password for the new account.
   */
  public password!: string;
}