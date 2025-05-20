import { ISecretProvider } from '../interfaces/secret-provider.interface';
import { logger } from '../../common/utils/logger.util'; // Assuming a logger utility

export class EnvSecretProvider implements ISecretProvider {
    async getSecret(key: string): Promise<string | undefined> {
        const value = process.env[key];
        if (value !== undefined) {
            logger.debug(`EnvSecretProvider: Found secret for key '${key}'.`);
        } else {
            logger.debug(`EnvSecretProvider: Secret for key '${key}' not found in environment variables.`);
        }
        return Promise.resolve(value);
    }
}