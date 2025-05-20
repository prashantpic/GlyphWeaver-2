import { IPlayerDataSyncService } from './interfaces/IPlayerDataSyncService';
import { IPlayerRepository } from './interfaces/IPlayerRepository';
import { IAuditLogRepository } from './interfaces/IAuditLogRepository';
// Assuming DTOs are in src/api/player-data/dtos
import { PlayerDataDTO, SyncResponseDTO } from '../api/player-data/dtos';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

// REQ-SEC-019, REQ-8-019, REQ-8-016

export class PlayerDataSyncService implements IPlayerDataSyncService {
    constructor(
        private playerRepository: IPlayerRepository,
        private auditLogRepository: IAuditLogRepository,
    ) {}

    async getPlayerData(playerId: string): Promise<PlayerDataDTO> {
        logger.info(`Fetching player data for player ${playerId}`);
        const playerData = await this.playerRepository.getPlayerData(playerId);
        if (!playerData) {
            logger.warn(`No player data found for player ${playerId}`);
            // Depending on game design, might create default data or throw error
            // For now, throw error if no data, assuming player should exist
            throw new ApiError('Player data not found.', 404);
        }
        return playerData;
    }

    async syncPlayerData(playerId: string, clientData: PlayerDataDTO): Promise<SyncResponseDTO> {
        logger.info(`Synchronizing player data for player ${playerId}, client version: ${clientData.version}`);

        const serverData = await this.playerRepository.getPlayerData(playerId);
        if (!serverData) {
            logger.error(`Critical: Server data not found for player ${playerId} during sync.`);
            throw new ApiError('Player data not found on server.', 404);
        }

        // Conflict Resolution Logic
        // Example: Last Write Wins (if client version is newer or equal)
        // More complex merging logic could be implemented here based on specific fields or game design.
        let dataToSave: PlayerDataDTO;
        let conflict = false;
        let message: string | undefined;

        if (clientData.version >= serverData.version) {
            // Client has newer or same data, accept client's version. Increment server version.
            dataToSave = { ...clientData, version: serverData.version + 1 };
            message = 'Client data applied.';
            logger.info(`Player ${playerId} sync: Client version (${clientData.version}) >= server version (${serverData.version}). Client data accepted.`);
        } else {
            // Server has newer data. Client data is stale. Reject client's write, send server's latest.
            dataToSave = { ...serverData, version: serverData.version }; // No change to server data itself here, just returning it
            conflict = true;
            message = 'Client data was stale. Server data returned.';
            logger.warn(`Player ${playerId} sync: Client version (${clientData.version}) < server version (${serverData.version}). Conflict detected, client data rejected.`);
        }
        
        // If client data was accepted, save it.
        if (!conflict) {
             await this.playerRepository.updatePlayerData(playerId, dataToSave);
             logger.info(`Player ${playerId} data updated to version ${dataToSave.version}.`);
        }


        await this.auditLogRepository.logEvent({
            eventType: 'PLAYER_DATA_SYNC',
            userId: playerId,
            details: { clientVersion: clientData.version, serverVersion: serverData.version, outcome: conflict ? 'conflict_server_won' : 'client_data_applied', finalVersion: dataToSave.version },
        });

        return {
            success: true,
            latestData: dataToSave, // Return the authoritative data (either newly saved client data or existing server data)
            conflict,
            message,
        };
    }
}