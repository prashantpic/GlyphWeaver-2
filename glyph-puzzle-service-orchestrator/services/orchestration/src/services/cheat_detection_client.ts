import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config';
import {
  RunCheatDetectionActivityInput,
  CheatDetectionResult,
} from '../../interfaces/score.interfaces';
import { ServiceUnavailableError, ActivityOperationFailedError, CheatDetectedError } from '../../error_handling/custom_errors';

export class CheatDetectionClient {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: `${config.services.backendApi.endpoint}/cheat-detection`, // Assuming a /cheat-detection path prefix
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.services.backendApi.authToken}`,
      },
      timeout: 25000, // 25 seconds timeout, cheat detection might be intensive
    });
  }

  public async analyzeScore(input: RunCheatDetectionActivityInput): Promise<CheatDetectionResult> {
    try {
      const response = await this.httpClient.post<CheatDetectionResult>('/analyze', input);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        if (axiosError.response) {
            // If the service responds with a specific "cheat detected" status or error type
            // it might be handled here, or more likely, the service returns a CheatDetectionResult
            // with isCheater = true. Here we handle communication errors.
          throw ActivityOperationFailedError(
            `CheatDetectionClient.analyzeScore failed: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.message}`,
            axiosError.response.status >= 400 && axiosError.response.status < 500, // 4xx non-retryable by default
            axiosError.response.data?.details
          );
        } else if (axiosError.request) {
          throw ServiceUnavailableError('CheatDetectionService (no response)', axiosError);
        }
      }
      throw ServiceUnavailableError('CheatDetectionService (unknown error)', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

export const cheatDetectionClient = new CheatDetectionClient();