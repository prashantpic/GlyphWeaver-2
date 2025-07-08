/**
 * Defines the contract for a caching service, abstracting the underlying implementation (e.g., Redis).
 * This provides a generic interface for caching operations, allowing the application
 * to use caching without being tightly coupled to a specific technology.
 */
export interface ICacheService {
  /**
   * Gets a value from the cache by its key.
   * @param key - The key of the item to retrieve.
   * @returns A promise that resolves to the cached value, or null if not found.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Sets a value in the cache.
   * @param key - The key of the item to set.
   * @param value - The value to store.
   * @param ttlSeconds - Optional time-to-live in seconds.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Deletes a value from the cache by its key.
   * @param key - The key of the item to delete.
   */
  del(key: string): Promise<void>;
  
  /**
   * Deletes all keys matching a given pattern.
   * @param pattern The pattern to match (e.g., 'leaderboard:xyz:*').
   */
  delByPattern(pattern: string): Promise<void>;
}