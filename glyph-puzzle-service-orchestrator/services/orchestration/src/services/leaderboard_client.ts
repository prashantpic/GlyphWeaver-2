import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config';
import {
  UpdateLeaderboardInput,
  UpdateLeaderboardOutput,
  CompensateUpdateLeaderboardInput,
} from '../../interfaces/score.interfaces';
import { ServiceUnavailableError, ActivityOperationFailedError } from '../../error_handling/custom_errors';

export class LeaderboardClient {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: `${config.services.backendApi.endpoint}/leaderboards`, // Assuming a /leaderboards path prefix
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.services.backendApi.authToken}`,
      },
      timeout: 15000, // 15 seconds timeout
    });
  }

  public async submitScore(input: UpdateLeaderboardInput): Promise<UpdateLeaderboardOutput> {
    try {
      const response = await this.httpClient.post<UpdateLeaderboardOutput>('/submit', input); // Or specific endpoint like /scores
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'submitScore');
    }
  }

  public async removeOrInvalidateScore(input: CompensateUpdateLeaderboardInput): Promise<void> {
    try {
      // Endpoint might be like /scores/{submissionId}/invalidate or /scores/remove
      await this.httpClient.post(`/scores/${input.submissionId}/invalidate`, { reason: input.reason });
    } catch (error) {
      this.handleApiError(error, 'removeOrInvalidateScore', true); // Compensation failure is critical
    }
  }

  private handleApiError(error: unknown, operationName: string, nonRetryable = false): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        throw ActivityOperationFailedError(
          `LeaderboardClient.${operationName} failed: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.message}`,
          nonRetryable || (axiosError.response.status >= 400 && axiosError.response.status < 500),
          axiosError.response.data?.details
        );
      } else if (axiosError.request) {
        throw ServiceUnavailableError('LeaderboardService (no response)', axiosError);
      }
    }
    throw ServiceUnavailableError('LeaderboardService (unknown error)', error instanceof Error ? error : new Error(String(error)));
  }
}

export const leaderboardClient = new LeaderboardClient();