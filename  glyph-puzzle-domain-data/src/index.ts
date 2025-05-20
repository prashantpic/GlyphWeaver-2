import dotenv from 'dotenv';
import mongoose, { ConnectionStates } from 'mongoose';

// DB and Cache connections
import { connectDB } from './config/db.config';
import { redisClient, disconnectRedis } from './config/redis.config';

// Mongoose Models
import {
    PlayerProfileModel,
    LeaderboardEntryModel,
    ProceduralLevelDataModel,
    IAPTransactionModel,
    AuditLogModel,
    GameConfigurationModel
} from './domain';

// Repository Interfaces (for return type annotation)
import {
    IPlayerProfileRepository,
    ILeaderboardRepository,
    IProceduralLevelDataRepository,
    IIAPTransactionRepository,
    IAuditLogRepository,
    IGameConfigurationRepository,
} from './repositories/interfaces';


// Repository Implementations
import {
    PlayerProfileRepository,
    LeaderboardRepository,
    ProceduralLevelDataRepository,
    IAPTransactionRepository,
    AuditLogRepository,
    GameConfigurationRepository,
} from './repositories/implementations';

// Load environment variables. This is often done by the main application,
// but including it here ensures the module can be initialized standalone if necessary.
dotenv.config();

/**
 * Interface describing the structure of the object containing all initialized repositories.
 */
export interface InitializedRepositories {
    playerProfileRepository: IPlayerProfileRepository;
    leaderboardRepository: ILeaderboardRepository;
    proceduralLevelDataRepository: IProceduralLevelDataRepository;
    iapTransactionRepository: IIAPTransactionRepository;
    auditLogRepository: IAuditLogRepository;
    gameConfigurationRepository: IGameConfigurationRepository;
}

let initializedRepositories: InitializedRepositories | null = null;

/**
 * Initializes the data layer by connecting to MongoDB, ensuring Redis is ready,
 * and instantiating all data repositories.
 * This function should be called once at application startup.
 * @returns {Promise<InitializedRepositories>} A promise that resolves to an object containing all initialized repositories.
 * @throws Will throw an error if initialization fails.
 */
async function initializeDataLayer(): Promise<InitializedRepositories> {
    if (initializedRepositories) {
        console.warn('Data Layer already initialized. Returning existing instances.');
        return initializedRepositories;
    }

    try {
        await connectDB(); // Connects to MongoDB
        console.log('MongoDB connection established.');

        // Ensure Redis client is ready
        if (redisClient.status !== 'ready') {
            console.log(`Redis client status: ${redisClient.status}. Awaiting 'ready' event.`);
            await new Promise<void>((resolve, reject) => {
                const readyListener = () => {
                    clearTimeout(timeoutId);
                    redisClient.removeListener('error', errorListener);
                    resolve();
                };
                const errorListener = (err: Error) => {
                    clearTimeout(timeoutId);
                    redisClient.removeListener('ready', readyListener);
                    reject(new Error(`Redis connection error during initialization: ${err.message}`));
                };
                const timeoutId = setTimeout(() => {
                    redisClient.removeListener('ready', readyListener);
                    redisClient.removeListener('error', errorListener);
                    reject(new Error('Redis connection timed out during initialization (5s)'));
                }, 5000); // 5-second timeout for Redis to become ready

                redisClient.once('ready', readyListener);
                redisClient.once('error', errorListener);

                // If ioredis is configured with lazyConnect:true, and it's not in a connecting state,
                // an explicit connect might be needed. Default ioredis behavior is to attempt connection on instantiation.
                // if (redisClient.options.lazyConnect && redisClient.status === 'wait') {
                //    redisClient.connect().catch(reject);
                // }
            });
            console.log('Redis client is ready.');
        } else {
            console.log('Redis client already ready.');
        }

        const repositories: InitializedRepositories = {
            playerProfileRepository: new PlayerProfileRepository(PlayerProfileModel),
            leaderboardRepository: new LeaderboardRepository(LeaderboardEntryModel, redisClient),
            proceduralLevelDataRepository: new ProceduralLevelDataRepository(ProceduralLevelDataModel),
            iapTransactionRepository: new IAPTransactionRepository(IAPTransactionModel),
            auditLogRepository: new AuditLogRepository(AuditLogModel),
            gameConfigurationRepository: new GameConfigurationRepository(GameConfigurationModel),
        };

        initializedRepositories = repositories;
        console.log('Data Layer initialized successfully. Repositories are instantiated.');
        return repositories;

    } catch (error) {
        console.error('Failed to initialize Data Layer:', error);
        // Attempt to clean up Redis connection if MongoDB or other parts failed
        if (redisClient.status === 'ready' || redisClient.status === 'connect') {
            await disconnectRedis(); // Ensure disconnectRedis is implemented in redis.config.ts
        }
        // Re-throw the error to be handled by the application bootstrap process
        throw error;
    }
}

/**
 * Gets the current status of the MongoDB connection.
 * @returns {string} MongoDB connection status.
 */
function getDbConnectionStatus(): string {
    if (!mongoose.connection) {
        return 'MongoDB Connection Object Not Available';
    }
    const state = mongoose.connection.readyState;
    switch (state) {
        case ConnectionStates.disconnected: return 'MongoDB Disconnected';
        case ConnectionStates.connected: return 'MongoDB Connected';
        case ConnectionStates.connecting: return 'MongoDB Connecting';
        case ConnectionStates.disconnecting: return 'MongoDB Disconnecting';
        case ConnectionStates.uninitialized: return 'MongoDB Uninitialized';
        default: return `MongoDB Unknown State (${state})`;
    }
}

/**
 * Gets the current status of the Redis connection.
 * @returns {string} Redis client status (e.g., 'connecting', 'connect', 'ready', 'close', 'reconnecting', 'end').
 */
function getRedisConnectionStatus(): string {
    return redisClient.status;
}

/**
 * Provides access to the initialized repositories.
 * Throws an error if `initializeDataLayer` has not been successfully called and completed.
 * @returns {InitializedRepositories} The initialized repositories.
 */
function getRepositories(): InitializedRepositories {
    if (!initializedRepositories) {
        throw new Error('Data Layer not initialized. Call initializeDataLayer() and ensure it completes successfully before accessing repositories.');
    }
    return initializedRepositories;
}

export {
    initializeDataLayer,
    disconnectRedis, // Export for graceful shutdown by the application
    getDbConnectionStatus,
    getRedisConnectionStatus,
    getRepositories, // Allows retrieving repositories after initialization
    redisClient,    // Exporting Redis client for potential direct use (e.g., other caching needs)
};