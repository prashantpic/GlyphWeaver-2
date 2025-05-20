export interface IAdminService {
  /**
   * Retrieves the system health status.
   * @returns A promise that resolves to an object containing health status details.
   */
  getSystemHealth(): Promise<any>;

  /**
   * Updates a game configuration setting.
   * @param key - The configuration key to update.
   * @param value - The new value for the configuration key.
   * @returns A promise that resolves when the configuration is updated.
   */
  updateConfiguration(key: string, value: any): Promise<void>;

  /**
   * Retrieves all game configuration settings.
   * @returns A promise that resolves to an object containing all configurations.
   */
  getConfigurations(): Promise<any>;
}