import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { IPlayerServiceClient } from '../clients/player-service.client';

/**
 * @file This service acts as the orchestration layer for fulfilling player data privacy requests. It ensures that every request is handled and properly audited, while delegating the actual data manipulation to the responsible services.
 * @namespace GlyphWeaver.Backend.System.Application.Services
 */

/**
 * @class PlayerDataRequestService
 * @description Orchestrates the fulfillment of player data subject rights requests (e.g., GDPR/CCPA).
 * @pattern ServiceLayerPattern
 */
export class PlayerDataRequestService {
  /**
   * @param {IAuditLogRepository} auditRepo - The repository for creating audit logs.
   * @param {IPlayerServiceClient} playerServiceClient - The client for communicating with the Player microservice.
   */
  constructor(
    private readonly auditRepo: IAuditLogRepository,
    private readonly playerServiceClient: IPlayerServiceClient
  ) {}

  /**
   * Orchestrates a player data deletion request.
   * This service does not delete data itself; it calls the Player Service to perform the deletion.
   * @param {string} playerId - The ID of the player whose data is to be deleted.
   * @param {string} actorId - The ID of the administrator initiating the request.
   * @param {string} ipAddress - The IP address of the administrator.
   * @returns {Promise<{ success: boolean; message: string }>} The result of the operation.
   */
  public async processDataDeletionRequest(
    playerId: string,
    actorId: string,
    ipAddress: string
  ): Promise<{ success: boolean; message: string }> {
    const auditDetails = { playerId };
    try {
      await this.playerServiceClient.requestDeletion(playerId);
      
      await this.auditRepo.create({
        eventType: 'PLAYER_DATA_DELETE_REQUEST',
        actorId,
        ipAddress,
        status: 'success',
        details: auditDetails,
      });
      
      return { success: true, message: `Data deletion process initiated for player ${playerId}.` };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await this.auditRepo.create({
        eventType: 'PLAYER_DATA_DELETE_REQUEST',
        actorId,
        ipAddress,
        status: 'failure',
        details: { ...auditDetails, error: errorMessage },
      });
      
      return { success: false, message: `Failed to initiate data deletion for player ${playerId}: ${errorMessage}` };
    }
  }

  /**
   * Orchestrates a player data access request.
   * This service calls the Player Service to export the player's data.
   * @param {string} playerId - The ID of the player whose data is to be accessed.
   * @param {string} actorId - The ID of the administrator initiating the request.
   * @param {string} ipAddress - The IP address of the administrator.
   * @returns {Promise<{ success: boolean; data?: any; message?: string }>} The result of the operation, including the data on success.
   */
  public async processDataAccessRequest(
    playerId: string,
    actorId: string,
    ipAddress: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    const auditDetails = { playerId };
    try {
      const data = await this.playerServiceClient.requestDataAccess(playerId);

      await this.auditRepo.create({
        eventType: 'PLAYER_DATA_ACCESS_REQUEST',
        actorId,
        ipAddress,
        status: 'success',
        details: auditDetails,
      });

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.auditRepo.create({
        eventType: 'PLAYER_DATA_ACCESS_REQUEST',
        actorId,
        ipAddress,
        status: 'failure',
        details: { ...auditDetails, error: errorMessage },
      });

      return { success: false, message: `Failed to process data access request for player ${playerId}: ${errorMessage}` };
    }
  }
}