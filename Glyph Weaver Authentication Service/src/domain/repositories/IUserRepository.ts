import { IUser } from '../models/user.model';

/**
 * Defines the contract for the user repository.
 * This interface abstracts the data persistence logic from the application services,
 * enabling dependency inversion and improving testability.
 */
export interface IUserRepository {
  /**
   * Finds a user by their unique ID.
   * @param id - The user's ID.
   * @returns A promise that resolves to the user document or null if not found.
   */
  findById(id: string): Promise<IUser | null>;

  /**
   * Finds a user by their email address.
   * @param email - The user's email.
   * @returns A promise that resolves to the user document or null if not found.
   */
  findByEmail(email: string): Promise<IUser | null>;

  /**
   * Finds a user by their third-party platform identity.
   * @param provider - The platform provider (e.g., 'google', 'apple').
   * @param providerUserId - The user's unique ID on that platform.
   * @returns A promise that resolves to the user document or null if not found.
   */
  findByPlatformId(provider: string, providerUserId: string): Promise<IUser | null>;

  /**
   * Creates a new user record.
   * @param user - A partial user object with the data to create.
   * @returns A promise that resolves to the newly created user document.
   */
  create(user: Partial<IUser>): Promise<IUser>;

  /**
   * Updates an existing user record.
   * @param id - The ID of the user to update.
   * @param user - A partial user object with the fields to update.
   * @returns A promise that resolves to the updated user document or null if not found.
   */
  update(id: string, user: Partial<IUser>): Promise<IUser | null>;
}