import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config';
import {
  GrantEntitlementInput,
  GrantEntitlementOutput,
  CompensateGrantEntitlementInput,
  UpdatePlayerInventoryInput,
  UpdatePlayerInventoryOutput,
} from '../../interfaces/iap.interfaces';
import { ServiceUnavailableError, ActivityOperationFailedError } from '../../error_handling/custom_errors';

export class PlayerInventoryClient {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: `${config.services.backendApi.endpoint}/inventory`, // Assuming an /inventory path prefix
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.services.backendApi.authToken}`,
      },
      timeout: 20000, // 20 seconds timeout
    });
  }

  public async grantItemsOrCurrency(input: GrantEntitlementInput): Promise<GrantEntitlementOutput> {
    try {
      const response = await this.httpClient.post<GrantEntitlementOutput>('/grant', input);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'grantItemsOrCurrency');
    }
  }

  public async revertItemsOrCurrency(input: CompensateGrantEntitlementInput): Promise<void> {
    try {
      await this.httpClient.post('/revert', input);
      // Assuming compensation returns 200/204 on success and doesn't have a specific body
    } catch (error) {
      this.handleApiError(error, 'revertItemsOrCurrency', true); // Compensation failure is critical
    }
  }

  public async updatePlayerInventory(input: UpdatePlayerInventoryInput): Promise<UpdatePlayerInventoryOutput> {
    try {
      const response = await this.httpClient.post<UpdatePlayerInventoryOutput>('/update', input);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'updatePlayerInventory');
    }
  }

  private handleApiError(error: unknown, operationName: string, nonRetryable = false): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>; // Use 'any' for unknown error response body
      if (axiosError.response) {
        throw ActivityOperationFailedError(
          `PlayerInventoryClient.${operationName} failed: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.message}`,
          nonRetryable || (axiosError.response.status >= 400 && axiosError.response.status < 500), // 4xx are often non-retryable
          axiosError.response.data?.details
        );
      } else if (axiosError.request) {
        throw ServiceUnavailableError('PlayerInventoryService (no response)', axiosError);
      }
    }
    throw ServiceUnavailableError('PlayerInventoryService (unknown error)', error instanceof Error ? error : new Error(String(error)));
  }
}

export const playerInventoryClient = new PlayerInventoryClient();