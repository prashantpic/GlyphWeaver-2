export interface IHashingService {
    /**
     * Hashes the given data.
     * @param data The plaintext data to hash.
     * @returns A promise that resolves to the hashed string.
     */
    hash(data: string): Promise<string>;

    /**
     * Compares plaintext data against a previously hashed string.
     * @param data The plaintext data to compare.
     * @param encrypted The previously hashed string.
     * @returns A promise that resolves to true if the data matches the hash, false otherwise.
     */
    compare(data: string, encrypted: string): Promise<boolean>;
}

export interface IEncryptionService {
    /**
     * Encrypts the given plaintext data.
     * @param plaintext The data to encrypt.
     * @param keyId Optional KMS key ID to use. If not provided, a default key ID might be used.
     * @returns A promise that resolves to the base64 encoded ciphertext.
     */
    encrypt(plaintext: string, keyId?: string): Promise<string>;

    /**
     * Decrypts the given base64 encoded ciphertext.
     * @param ciphertext The base64 encoded ciphertext to decrypt.
     * @returns A promise that resolves to the decrypted plaintext string.
     */
    decrypt(ciphertext: string): Promise<string>;
}