import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config';
import { SynchronizeCloudSaveInput } from '../../interfaces/score.interfaces';
import { ServiceUnavailableError, ActivityOperationFailedError } from '../../error_handling/custom_errors';

export class CloudSaveClient {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: `${config.services.backendApi.endpoint}/cloud-save`, // Assuming a /cloud-save path prefix
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.services.backendApi.authToken}`,
      },
      timeout: 15000, // 15 seconds timeout
    });
  }

  public async triggerSync(input: SynchronizeCloudSaveInput): Promise<void> {
    try {
      // Endpoint might be POST /sync or POST /players/{playerId}/sync
      await this.httpClient.post(`/players/${input.playerId}/trigger-sync`, { reason: input.reason });
    } catch (error) {
      // Cloud save sync failures are often logged and retried but might not fail the whole workflow
      // The activity using this client will define the retry strategy.
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        if (axiosError.response) {
          throw ActivityOperationFailedError(
            `CloudSaveClient.triggerSync failed: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.message}`,
            axiosError.response.status >= 400 && axiosError.response.status < 500, // 4xx non-retryable
            axiosError.response.data?.details
          );
        } else if (axiosError.request) {
          throw ServiceUnavailableError('CloudSaveService (no response)', axiosError);
        }
      }
      throw ServiceUnavailableError('CloudSaveService (unknown error)', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

export const cloudSaveClient = new CloudSaveClient();