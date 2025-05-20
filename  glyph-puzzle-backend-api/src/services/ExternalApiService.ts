import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { IExternalApiService } from './interfaces/IExternalApiService';
import { logger } from '../utils/logger'; // Assuming logger is in src/utils
import { ApiError } from '../utils/ApiError'; // Assuming ApiError is in src/utils
import { environmentConfig } from '../config'; // Assuming config is in src/config

export class ExternalApiService implements IExternalApiService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            timeout: environmentConfig.externalApiTimeout || 10000, // Default timeout
        });

        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                logger.error(`External API request failed: ${error.message}`, {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    data: error.response?.data,
                });
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    throw new ApiError(
                        `External API Error: ${error.response.status} ${error.message}`,
                        error.response.status,
                        true,
                        error.response.data
                    );
                } else if (error.request) {
                    // The request was made but no response was received
                    throw new ApiError('External API Error: No response received from server', 503, true);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    throw new ApiError(`External API Error: ${error.message}`, 500, true);
                }
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        logger.info(`External GET request to: ${url}`);
        const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
        return response.data;
    }

    async post<T, R>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> {
        logger.info(`External POST request to: ${url}`);
        const response: AxiosResponse<R> = await this.axiosInstance.post(url, data, config);
        return response.data;
    }

    async put<T, R>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> {
        logger.info(`External PUT request to: ${url}`);
        const response: AxiosResponse<R> = await this.axiosInstance.put(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        logger.info(`External DELETE request to: ${url}`);
        const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
        return response.data;
    }
}