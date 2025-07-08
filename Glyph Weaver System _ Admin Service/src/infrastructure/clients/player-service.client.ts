import axios, { AxiosInstance } from 'axios';
import { IPlayerServiceClient } from '../../application/clients/player-service.client';
import config from '../../config';

/**
 * @file Concrete implementation of the IPlayerServiceClient using Axios.
 * @description This class is responsible for all HTTP communication with the downstream Player microservice.
 */

export class PlayerServiceClient implements IPlayerServiceClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.PLAYER_SERVICE_URL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        // In a real scenario, you'd have a secure way to authenticate internal service-to-service calls,
        // such as a shared secret or a service token.
        'X-Internal-Secret': process.env.INTERNAL_SERVICE_SECRET || 'dev-secret',
      },
    });
  }

  /**
   * @inheritdoc
   */
  public async requestDeletion(playerId: string): Promise<void> {
    try {
      // The endpoint is defined in the Player Service's API contract.
      const response = await this.client.delete(`/internal/players/${playerId}`);
      if (response.status !== 202 && response.status !== 204) {
        throw new Error(`Player Service returned unexpected status code: ${response.status}`);
      }
    } catch (error) {
      // Enhance error message for better logging
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to call Player Service for deletion: ${message}`);
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async requestDataAccess(playerId: string): Promise<any> {
    try {
      const response = await this.client.get(`/internal/players/${playerId}/data-export`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to call Player Service for data access: ${message}`);
      }
      throw error;
    }
  }
}