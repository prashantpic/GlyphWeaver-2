import { ApplicationFailure, Context } from '@temporalio/activity';
import { IAPReceiptData, IAPValidationResult } from '../../interfaces/iap.interfaces'; // Placeholder
import { IapValidationPlatformClient } from '../../services/iap_validation_platform_client'; // Placeholder

// Placeholder for actual client type
interface ActivityContext extends Context {
  iapValidationPlatformClient: IapValidationPlatformClient;
}

interface VerifyIapReceiptActivityInput {
  receiptData: IAPReceiptData;
  productId: string;
}

export async function verifyIapReceiptActivity(
  input: VerifyIapReceiptActivityInput
): Promise<IAPValidationResult> {
  const { receiptData, productId } = input;
  const { iapValidationPlatformClient, log } = Context.current<ActivityContext>();

  log.info('Verifying IAP receipt activity started', { productId });

  try {
    const validationResult = await iapValidationPlatformClient.verifyReceipt({
      receiptData,
      productId,
    });

    if (!validationResult.isValid) {
      log.warn('IAP receipt validation failed', { productId, reason: validationResult.failureReason });
      // This would be a custom error e.g. IAPValidationFailedError
      throw ApplicationFailure.create({
        message: `IAP receipt validation failed: ${validationResult.failureReason || 'Unknown reason'}`,
        type: 'IAPValidationFailedError',
        nonRetryable: true,
        details: [validationResult],
      });
    }

    log.info('IAP receipt successfully validated', { productId, transactionId: validationResult.transactionId });
    return validationResult;
  } catch (error) {
    log.error('Error during IAP receipt verification', { productId, error });
    if (error instanceof ApplicationFailure) {
      throw error;
    }
    // This could be mapped to a ServiceUnavailableError or similar custom error
    throw ApplicationFailure.create({
      message: 'Failed to communicate with IAP validation service',
      type: 'ServiceCommunicationError',
      cause: error as Error,
      nonRetryable: false, // Depending on the nature of client errors
    });
  }
}