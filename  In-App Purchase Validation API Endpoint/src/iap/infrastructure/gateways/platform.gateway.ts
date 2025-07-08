import { AppleIapGateway } from './apple.gateway';
import { GoogleIapGateway } from './google.gateway';

/**
 * @interface IPlatformIapGateway
 * @description Defines a uniform contract that all platform-specific IAP validation gateways must adhere to.
 * This abstraction allows the core application service to be agnostic of the platform details.
 */
export interface IPlatformIapGateway {
  /**
   * Validates a purchase receipt with the respective platform's validation server.
   * @param {any} receiptData - The receipt data from the client. The structure varies by platform.
   * @returns {Promise<{ isValid: boolean; transactionId: string; sku: string; rawResponse: any; }>}
   *          A standardized response object.
   */
  validate(receiptData: any): Promise<{
    isValid: boolean;
    transactionId: string | null;
    sku: string | null;
    rawResponse: any;
  }>;
}

/**
 * @class PlatformGatewayFactory
 * @description Implements the Factory pattern to provide the correct platform-specific
 * validation gateway at runtime based on a platform identifier. This decouples the
 * client (IapValidationService) from the concrete gateway implementations.
 */
export class PlatformGatewayFactory {
  // Dependencies would be injected in a real DI container
  constructor(
    private readonly appleGateway: AppleIapGateway,
    private readonly googleGateway: GoogleIapGateway
  ) {}

  /**
   * Returns an instance of the appropriate gateway based on the platform string.
   * @param {'ios' | 'android'} platform - The platform identifier.
   * @returns {IPlatformIapGateway} An object conforming to the IPlatformIapGateway interface.
   * @throws {Error} if an unsupported platform is provided.
   */
  public getGateway(platform: 'ios' | 'android'): IPlatformIapGateway {
    switch (platform) {
      case 'ios':
        return this.appleGateway;
      case 'android':
        return this.googleGateway;
      default:
        // This should theoretically never be reached if input is validated.
        throw new Error(`Unsupported platform provided: ${platform}`);
    }
  }
}