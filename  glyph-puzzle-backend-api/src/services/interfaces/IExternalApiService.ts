// For a more specific config type, you might use AxiosRequestConfig if using Axios
// import { AxiosRequestConfig } from 'axios';

export interface IExternalApiService {
  /**
   * Performs a GET request.
   * @param url - The URL to request.
   * @param config - Optional request configuration (e.g., headers, query params).
   * @returns A promise that resolves to the response data.
   */
  get<T>(url: string, config?: any /* AxiosRequestConfig */): Promise<T>;

  /**
   * Performs a POST request.
   * @param url - The URL to request.
   * @param data - Optional request body data.
   * @param config - Optional request configuration.
   * @returns A promise that resolves to the response data.
   */
  post<T>(url: string, data?: any, config?: any /* AxiosRequestConfig */): Promise<T>;

  /**
   * Performs a PUT request.
   * @param url - The URL to request.
   * @param data - Optional request body data.
   * @param config - Optional request configuration.
   * @returns A promise that resolves to the response data.
   */
  put<T>(url: string, data?: any, config?: any /* AxiosRequestConfig */): Promise<T>;

  /**
   * Performs a DELETE request.
   * @param url - The URL to request.
   * @param config - Optional request configuration.
   * @returns A promise that resolves to the response data.
   */
  delete<T>(url: string, config?: any /* AxiosRequestConfig */): Promise<T>;
}