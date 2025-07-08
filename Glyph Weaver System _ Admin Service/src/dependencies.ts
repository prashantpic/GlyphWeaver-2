/**
 * @file Manual Dependency Injection Setup
 * @description This file is responsible for instantiating and wiring up all the
 * classes (dependencies) for the application. In a larger application, this would be
 * replaced by a proper Dependency Injection container library like InversifyJS or NestJS DI.
 */

import { PlayerServiceClient } from './infrastructure/clients/player-service.client';
import { PlayerDataRequestService } from './application/services/player-data-request.service';
import { ConfigurationService } from './application/services/configuration.service';
import { SystemHealthService } from './application/services/system-health.service';
import { MongoAuditLogRepository } from './infrastructure/database/mongoose/repositories/audit-log.repository.impl';
import { MongoGameConfigurationRepository } from './infrastructure/database/mongoose/repositories/game-configuration.repository.impl';
import { AuditLogModel } from './infrastructure/database/mongoose/models/audit-log.model';
import { GameConfigurationModel } from './infrastructure/database/mongoose/models/game-configuration.model';
import { ConfigurationController } from './presentation/http/controllers/configuration.controller';
import { HealthController } from './presentation/http/controllers/health.controller';
import { PlayerDataController } from './presentation/http/controllers/player-data.controller';

// This is a simple container to hold the instantiated classes.
export let configurationController: ConfigurationController;
export let playerDataController: PlayerDataController;
export let healthController: HealthController;

export function setupDependencies() {
  // Layer 3: Infrastructure / Adapters
  const gameConfigRepository = new MongoGameConfigurationRepository(GameConfigurationModel);
  const auditLogRepository = new MongoAuditLogRepository(AuditLogModel);
  const playerServiceClient = new PlayerServiceClient();

  // Layer 2: Application / Services
  const configurationService = new ConfigurationService(gameConfigRepository, auditLogRepository);
  const playerDataRequestService = new PlayerDataRequestService(auditLogRepository, playerServiceClient);
  const systemHealthService = new SystemHealthService();

  // Layer 1: Presentation / Controllers
  // We export the controllers so the routes can use them.
  configurationController = new ConfigurationController(configurationService);
  playerDataController = new PlayerDataController(playerDataRequestService);
  healthController = new HealthController(systemHealthService);
}