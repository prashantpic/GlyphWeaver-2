import AWS from 'aws-sdk';
import { ISecretProvider } from '../interfaces/secret-provider.interface';
import { kmsConfig } from '../../config/kms.config';
import { logger } from '../../common/utils/logger.util'; // Assuming a logger utility

export class KmsSecretProvider implements ISecretProvider {
    private kms: AWS.KMS;

    constructor() {
        if (!kmsConfig.region) {
            const msg = "AWS KMS region is not configured. KmsSecretProvider cannot operate.";
            logger.error(msg);
            throw new Error(msg);
        }
        AWS.config.update({ region: kmsConfig.region });
        this.kms = new AWS.KMS({ apiVersion: '2014-11-01' });
    }

    async getSecret(key: string): Promise<string | undefined> {
        const encryptedValue = process.env[key];

        if (!encryptedValue) {
            logger.debug(`KMS Secret Provider: Environment variable ${key} not found.`);
            return undefined;
        }

        // Heuristic: Assume it's KMS encrypted if it looks like base64 and is not trivially short.
        // A more robust way would be a naming convention, e.g., key prefixed with KMS_ENCRYPTED_
        // or if the value itself has a prefix like "kms:".
        // For this example, we'll attempt decryption if it's found.
        if (typeof encryptedValue !== 'string' || encryptedValue.length < 20) { // Arbitrary length check
            logger.debug(`KMS Secret Provider: Environment variable ${key} does not appear to be a KMS ciphertext.`);
            return undefined; // Or return encryptedValue if it's meant to be used as is by other providers.
                             // The design suggests this provider *decrypts*.
        }

        try {
            logger.debug(`KMS Secret Provider: Attempting to decrypt secret for key ${key}.`);
            const params: AWS.KMS.DecryptRequest = {
                CiphertextBlob: Buffer.from(encryptedValue, 'base64'),
                // Optionally, you can specify KeyId if known, or EncryptionContext.
                // KeyId: kmsConfig.defaultKeyId, // If you want to enforce a specific key for all env vars
            };

            const { Plaintext } = await this.kms.decrypt(params).promise();

            if (!Plaintext) {
                logger.warn(`KMS Secret Provider: Decryption for key ${key} resulted in empty plaintext.`);
                return undefined;
            }

            const decryptedSecret = Plaintext.toString('utf-8');
            logger.info(`KMS Secret Provider: Successfully decrypted secret for key ${key}.`);
            return decryptedSecret;

        } catch (error: any) {
            logger.error(`KMS Secret Provider: Failed to decrypt secret for key ${key}. Error: ${error.message}`);
            // Optionally, rethrow or return undefined based on desired error handling.
            // Returning undefined means the SecretService might try other providers.
            return undefined;
        }
    }
}