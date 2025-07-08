import { hash, compare } from 'bcryptjs';

/**
 * A specialized service for securely hashing and comparing passwords using bcrypt.
 * Using static methods for this utility class as it holds no state.
 */
export class PasswordService {
  private static getSaltRounds(): number {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    if (isNaN(saltRounds)) {
      return 10;
    }
    return saltRounds;
  }

  /**
   * Hashes a plain-text password.
   * @param password - The plain-text password to hash.
   * @returns A promise that resolves to the hashed password string.
   */
  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = this.getSaltRounds();
    return hash(password, saltRounds);
  }

  /**
   * Compares a plain-text password with a stored hash.
   * @param plainText - The plain-text password from a user's login attempt.
   * @param passwordHash - The stored hash from the database.
   * @returns A promise that resolves to true if the password matches, false otherwise.
   */
  public static async comparePassword(plainText: string, passwordHash: string): Promise<boolean> {
    return compare(plainText, passwordHash);
  }
}