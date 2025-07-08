import { IUser, UserModel } from '../../domain/models/user.model';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

/**
 * Concrete implementation of the IUserRepository interface using Mongoose
 * to interact with a MongoDB 'users' collection.
 */
export class MongoUserRepository implements IUserRepository {
  /**
   * Finds a user by their unique ID.
   * @param id - The user's ID.
   * @returns A promise that resolves to the user document or null if not found.
   */
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  /**
   * Finds a user by their email address.
   * Explicitly includes the `passwordHash` for authentication checks.
   * @param email - The user's email.
   * @returns A promise that resolves to the user document or null if not found.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  }

  /**
   * Finds a user by their third-party platform identity.
   * @param provider - The platform provider (e.g., 'google', 'apple').
   * @param providerUserId - The user's unique ID on that platform.
   * @returns A promise that resolves to the user document or null if not found.
   */
  async findByPlatformId(provider: string, providerUserId: string): Promise<IUser | null> {
    return UserModel.findOne({
      'platformIdentities.provider': provider,
      'platformIdentities.providerUserId': providerUserId,
    }).exec();
  }

  /**
   * Creates a new user record.
   * @param userData - A partial user object with the data to create.
   * @returns A promise that resolves to the newly created user document.
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    return UserModel.create(userData);
  }

  /**
   * Updates an existing user record.
   * @param id - The ID of the user to update.
   * @param updateData - A partial user object with the fields to update.
   * @returns A promise that resolves to the updated user document or null if not found.
   */
  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}