/**
 * @file Defines the contract for a service that handles password hashing and comparison.
 */

/**
 * Interface for a service that provides password hashing and comparison functionality.
 * Abstracting this allows for easy swapping of hashing algorithms (e.g., from bcrypt to argon2).
 */
export interface IPasswordHasher {
  /**
   * Hashes a plain-text password.
   * @param password - The plain-text password to hash.
   * @returns A promise that resolves to the hashed password string.
   */
  hash(password: string): Promise<string>;

  /**
   * Compares a plain-text password against a hash.
   * @param password - The plain-text password to compare.
   * @param hash - The stored hash to compare against.
   * @returns A promise that resolves to true if the password matches the hash, otherwise false.
   */
  compare(password: string, hash: string): Promise<boolean>;
}