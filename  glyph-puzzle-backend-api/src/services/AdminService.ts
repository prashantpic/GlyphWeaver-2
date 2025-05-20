import { IAdminService } from './interfaces/IAdminService';
import { IGameConfigurationRepository } from './interfaces/IGameConfigurationRepository';
import { IAuditLogRepository } from './interfaces/IAuditLogRepository';
import { ICacheService } from './interfaces/ICacheService'; // For health check
import { IPlayerRepository } from './interfaces/IPlayerRepository'; // For DB health check
// Assuming DTOs are in src/api/admin/dtos
import { AdminActionRequestDTO } from '../api/admin/dtos'; // Only one DTO was mentioned for this service
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

// REQ-8-022, REQ-8-023, REQ-SEC-019, REQ-8-019, REQ-8-016

export class AdminService implements IAdminService {
    constructor(
        private gameConfigurationRepository: IGameConfigurationRepository,
        private auditLogRepository: IAuditLogRepository,
        private cacheService: ICacheService, // For cache health
        private playerRepository: IPlayerRepository, // For DB health, using one repo as proxy
    ) {}

    async getSystemHealth(): Promise<any> {
        logger.info('Admin: Requesting system health check.');
        const healthStatus: any = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            dependencies: {},
        };

        try {
            // Check Database (e.g., by trying a simple query on a core repository)
            const dbHealthy = await this.playerRepository.checkConnection(); // Assume repo has a health check method
            healthStatus.dependencies.database = dbHealthy ? 'healthy' : 'unhealthy';
            if (!dbHealthy) healthStatus.status = 'degraded';
        } catch (error: any) {
            logger.error('Admin Health Check: Database check failed.', error);
            healthStatus.dependencies.database = 'unhealthy';
            healthStatus.status = 'degraded';
        }

        try {
            // Check Cache (e.g., Redis PING)
            const redisClient = this.cacheService.getClient(); // Assume ICacheService can provide underlying client
            const pingResponse = await redisClient.ping();
            healthStatus.dependencies.cache = (pingResponse === 'PONG') ? 'healthy' : 'unhealthy';
            if (pingResponse !== 'PONG') healthStatus.status = 'degraded';
        } catch (error: any) {
            logger.error('Admin Health Check: Cache check failed.', error);
            healthStatus.dependencies.cache = 'unhealthy';
            healthStatus.status = 'degraded';
        }

        // Check Key External Services (conceptual - depends on what IExternalApiService exposes or direct checks)
        // try {
        //     const externalServiceStatus = await this.externalApiService.checkHealth('iap_apple');
        //     healthStatus.dependencies.appleIAP = externalServiceStatus;
        //     if(externalServiceStatus !== 'healthy') healthStatus.status = 'degraded';
        // } catch (error: any) {
        //     logger.error('Admin Health Check: External service check failed.', error);
        //     healthStatus.dependencies.appleIAP = 'unhealthy';
        //     healthStatus.status = 'degraded';
        // }
        healthStatus.dependencies.externalServices = 'not_checked_in_this_example';

        await this.auditLogRepository.logEvent({
            eventType: 'ADMIN_SYSTEM_HEALTH_CHECK',
            userId: 'admin_system', // Or the admin user ID if available
            details: { healthStatus },
        });

        return healthStatus;
    }

    async updateConfiguration(adminUserId: string, key: string, value: any): Promise<void> {
        logger.info(`Admin ${adminUserId} updating configuration. Key: ${key}, Value: ${JSON.stringify(value)}`);

        // Validate key and value (e.g., against a schema of allowed config keys and types)
        const isValidKey = await this.gameConfigurationRepository.isValidKey(key);
        if (!isValidKey) {
            throw new ApiError(`Configuration key '${key}' is not valid or cannot be updated.`, 400);
        }
        // Add more specific value validation based on the key if needed.

        await this.gameConfigurationRepository.set(key, value);

        await this.auditLogRepository.logEvent({
            eventType: 'ADMIN_CONFIG_UPDATE',
            userId: adminUserId,
            details: { key, newValue: value },
        });

        logger.info(`Admin: Configuration key '${key}' updated successfully by ${adminUserId}.`);
    }

    async getConfigurations(adminUserId: string): Promise<any> {
        logger.info(`Admin ${adminUserId} requesting all configurations.`);
        const configs = await this.gameConfigurationRepository.getAll();

        // Sensitive values might need to be redacted before sending to client
        const redactedConfigs: any = {};
        for (const key in configs) {
            if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('password') || key.toLowerCase().includes('apikey')) {
                redactedConfigs[key] = '********'; // Redact sensitive info
            } else {
                redactedConfigs[key] = configs[key];
            }
        }
        
        await this.auditLogRepository.logEvent({
            eventType: 'ADMIN_CONFIG_VIEW',
            userId: adminUserId,
            details: { requested: 'all_configs' },
        });

        return redactedConfigs;
    }
}