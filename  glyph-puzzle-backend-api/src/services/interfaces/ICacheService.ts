export interface ICacheService {
  /**
   * Retrieves a value from the cache.
   * @param key - The cache key.
   * @returns A promise that resolves to the cached value or null if not found or on error.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Stores a value in the cache.
   * @param key - The cache key.
   * @param value - The value to store.
   * @param ttlSeconds - Optional time-to-live in seconds.
   * @returns A promise that resolves when the value is set.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Deletes a value from the cache.
   * @param key - The cache key.
   * @returns A promise that resolves when the value is deleted.
   */
  del(key: string): Promise<void>;

  /**
   * Increments a numerical value in the cache.
   * @param key - The cache key.
   * @returns A promise that resolves to the new value after incrementing.
   */
  increment(key: string): Promise<number>;

  /**
   * Sets an expiration time on a key.
   * @param key - The cache key.
   * @param ttlSeconds - Time-to-live in seconds.
   * @returns A promise that resolves when the expiration is set.
   */
  expire(key: string, ttlSeconds: number): Promise<void>;
}