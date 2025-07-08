/**
 * @interface FulfillmentResult
 * @description Defines the standardized structure for the result of a fulfillment request
 * to the Player Service.
 */
export interface FulfillmentResult {
    /**
     * Indicates whether the item crediting was successful.
     */
    success: boolean;
    /**
     * Optional details from the Player Service, such as the player's updated
     * inventory or currency balance.
     */
    details?: any;
}

/**
 * @interface IPlayerServiceGateway
 * @description Defines the port for communicating with the external Player Service.
 * This abstracts away the specific API protocol (e.g., HTTP REST, gRPC) used to
 * interact with the service responsible for managing player data and inventory.
 */
export interface IPlayerServiceGateway {
    /**
     * Sends a request to the Player Service to credit a purchased item to a player's account.
     * @param userId The unique identifier of the player to be credited.
     * @param sku The SKU of the item that was purchased.
     * @param transactionId The unique internal transaction ID from this IAP service for idempotency and tracking.
     * @returns A Promise that resolves to a standardized `FulfillmentResult`.
     */
    creditPlayer(userId: string, sku: string, transactionId: string): Promise<FulfillmentResult>;
}