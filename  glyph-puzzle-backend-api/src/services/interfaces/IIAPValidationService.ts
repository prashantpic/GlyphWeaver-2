import { ValidateReceiptRequestDTO } from '../../api/iap/dtos/ValidateReceipt.request.dto';
import { ValidationResponseDTO } from '../../api/iap/dtos/Validation.response.dto';

export interface IIAPValidationService {
  /**
   * Validates an In-App Purchase receipt with the respective platform provider.
   * @param playerId - The ID of the player making the purchase.
   * @param validateReceiptDto - DTO containing receipt details.
   * @returns A promise that resolves to a ValidationResponseDTO.
   */
  validateReceipt(
    playerId: string,
    validateReceiptDto: ValidateReceiptRequestDTO,
  ): Promise<ValidationResponseDTO>;
}