export interface ISecretProvider {
    /**
     * Retrieves a secret value associated with the given key.
     * @param key The key identifying the secret.
     * @returns A promise that resolves to the secret string if found, or undefined otherwise.
     */
    getSecret(key: string): Promise<string | undefined>;
}