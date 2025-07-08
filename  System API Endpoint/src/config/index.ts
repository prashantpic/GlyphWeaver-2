import dotenv from 'dotenv';

dotenv.config();

/**
 * Defines the structure for the application's configuration.
 */
export interface AppConfig {
    port: number;
    mongoUri: string;
    jwtSecret: string;
    nodeEnv: 'development' | 'production' | 'test';
}

const requiredEnvVars: (keyof AppConfig)[] = ['port', 'mongoUri', 'jwtSecret', 'nodeEnv'];

// A map to process.env keys for better readability if they differ
const envVarMap: Record<keyof AppConfig, string> = {
    port: 'PORT',
    mongoUri: 'MONGO_URI',
    jwtSecret: 'JWT_SECRET',
    nodeEnv: 'NODE_ENV'
};

const missingVars = requiredEnvVars.filter(key => !process.env[envVarMap[key]]);

if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.map(key => envVarMap[key]).join(', ')}`);
}

const nodeEnv = process.env.NODE_ENV;
if (