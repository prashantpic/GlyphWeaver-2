import { AxiosInstance } from 'axios';
import { IPlayerServiceGateway, FulfillmentResult } from '../../application/interfaces/player-service.gateway.interface';
import { config } from '../../config';

/**
 * @class HttpPlayerServiceGateway
 * @description Implements the IPlayerServiceGateway interface using HTTP.
 * It makes secure calls to the external Player Service to credit items
 * to a player's account after a successful IAP validation.
 */
export class HttpPlayerServiceGateway implements IPlayerServiceGateway {
    
    /**
     * @param httpClient - An Axios instance for making HTTP requests.
     */
    constructor(private readonly httpClient: AxiosInstance) {}

    /**
     * Sends a request to the Player Service to credit a player.
     * This method includes a service-to-service authentication token for security.
     * @param userId The ID of the player to credit.
     * @param sku The SKU of the item purchased.
     * @param transactionId The unique internal IAP transaction ID for idempotency.
     * @returns A promise that resolves to a FulfillmentResult.
     */
    async creditPlayer(userId: string, sku: string, transactionId: string): Promise<FulfillmentResult> {
        const url = `${config.services.playerServiceUrl}/v1/player/credit`;
        const payload = { userId, sku, transactionId };
        
        try {
            const response = await this.httpClient.post(url, payload, {
                headers: {
                    // Service-to-service authentication
                    'Authorization': `Bearer ${config.services.playerServiceAuthToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status >= 200 && response.status < 300) {
                return {
                    success: true,
                    details: response.data,
                };
            }
            
            // This case might be redundant with the catch block but adds robustness
            return {
                success: false,
                details: response.data,
            };

        } catch (error: any) {
            // Log the error with details for debugging
            console.error(
                `Failed to credit player ${userId} for transaction ${transactionId}. ` +
                `Status: ${error.response?.status}. ` +
                `Data: ${JSON.stringify(error.response?.data)}`
            );

            return {
                success: false,
                details: error.response?.data || { message: 'Network error or Player Service is down.' },
            };
        }
    }
}