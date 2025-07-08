import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Defines the list of required environment variables for the application to run.
 */
const requiredVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'PLAYER_SERVICE_URL',
    'PLAYER_SERVICE_AUTH_TOKEN', // For service-to-service auth
    'APPLE_VALIDATION_URL',
    'APPLE_SANDBOX_VALIDATION_URL',
    'APPLE_SHARED_SECRET',
    'GOOGLE_PACKAGE_NAME',
    'GOOGLE_PROJECT_ID',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
];

/**
 * Validates that all required environment variables are set.
 * If any variable is missing, it throws an error to prevent the application from starting.
 */
requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

/**
 * A frozen, strongly-typed configuration object that provides access to all
 * environment variables used throughout the application.
 */
export const config = Object.freeze({
    /**
     * The application environment (e.g., 'development', 'production', 'test').
     */
    env: process.env.NODE_ENV!,

    /**
     * The port on which the server will listen.
     */
    port: parseInt(process.env.PORT || '3001', 10),

    /**
     * MongoDB connection configuration.
     */
    mongo: {
        uri: process.env.MONGO_URI!,
    },

    /**
     * Configuration for internal services.
     */
    services: {
        playerServiceUrl: process.env.PLAYER_SERVICE_URL!,
        playerServiceAuthToken: process.env.PLAYER_SERVICE_AUTH_TOKEN!,
    },

    /**
     * Apple App Store IAP validation configuration.
     */
    apple: {
        validationUrl: process.env.APPLE_VALIDATION_URL!,
        sandboxValidationUrl: process.env.APPLE_SANDBOX_VALIDATION_URL!,
        sharedSecret: process.env.APPLE_SHARED_SECRET!,
    },

    /**
     * Google Play Store IAP validation configuration.
     */
    google: {
        packageName: process.env.GOOGLE_PACKAGE_NAME!,
        projectId: process.env.GOOGLE_PROJECT_ID!,
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
        // Correctly formats the private key by replacing escaped newlines.
        privateKey: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    },
});