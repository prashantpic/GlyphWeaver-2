import { IapConfig } from '../config/iap.config';
import { AuditService, AuditEventType, AuditEventDto } from '../audit/audit.service';
import { AUDIT_OUTCOME_SUCCESS, AUDIT_OUTCOME_FAILURE, AUDIT_OUTCOME_ATTEMPT } from '../common/constants/audit.constants';
import { logger } from '../common/utils/logger.util';
import axios, { AxiosInstance, AxiosError } from 'axios';


// --- DTOs and Interfaces (as their files are not in the generation list) ---
export interface ValidateAppleReceiptDto {
  receiptData: string;
  password?: string; // The shared secret
  excludeOldTransactions?: boolean;
}

export interface ValidateGoogleReceiptDto {
  packageName: string;
  productId: string;
  purchaseToken: string;
}

// This DTO is for the service method, controller might take a more generic one
export type ValidateReceiptDto = ValidateAppleReceiptDto | ValidateGoogleReceiptDto;


export interface ValidationResultDto {
  isValid: boolean;
  platform: 'apple' | 'google';
  transactionId?: string;
  productId?: string;
  purchaseDate?: Date | string;
  originalTransactionId?: string; // Apple specific
  originalPurchaseDate?: Date | string; // Apple specific
  isTrialPeriod?: boolean; // Apple/Google specific
  isInIntroOfferPeriod?: boolean; // Apple specific
  isRetryable?: boolean; // For transient errors
  developerPayload?: string; // Google specific
  rawResponse?: any; // For debugging or further processing
  errorMessage?: string;
  errorCode?: string | number; // Platform specific error code or internal
}

interface IPlatformReceiptClient {
  validate(data: any): Promise<ValidationResultDto>;
}

// --- Placeholder Clients (as their files are not in the generation list) ---
// These would normally be in their own files (e.g., apple.client.ts, google.client.ts)
class AppleReceiptClient implements IPlatformReceiptClient {
  private httpClient: AxiosInstance;
  private validationUrl: string;
  private sharedSecret?: string;

  constructor(config: IapConfig['apple'], timeoutMs: number) {
    this.validationUrl = config.validationUrl; // Could also select sandbox URL based on env
    this.sharedSecret = config.sharedSecret;
    this.httpClient = axios.create({
      timeout: timeoutMs,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async validate(data: ValidateAppleReceiptDto): Promise<ValidationResultDto> {
    const payload: Record<string, any> = {
      'receipt-data': data.receiptData,
    };
    if (data.password || this.sharedSecret) {
      payload.password = data.password || this.sharedSecret;
    }
    if (data.excludeOldTransactions !== undefined) {
        payload['exclude-old-transactions'] = data.excludeOldTransactions;
    }

    try {
      const response = await this.httpClient.post(this.validationUrl, payload);
      const appleResponse = response.data;
      // Normalize Apple response to ValidationResultDto
      // See: https://developer.apple.com/documentation/appstorereceipts/responsebody
      const isValid = appleResponse.status === 0;
      // For subscriptions, latest_receipt_info is an array, for others, receipt.in_app is an array.
      // This simplified logic picks the first one. A real app needs to find the specific transaction.
      const latestTransaction = appleResponse.latest_receipt_info?.[0] || appleResponse.receipt?.in_app?.[0];

      return {
        isValid,
        platform: 'apple',
        transactionId: latestTransaction?.transaction_id,
        originalTransactionId: latestTransaction?.original_transaction_id,
        productId: latestTransaction?.product_id,
        purchaseDate: latestTransaction?.purchase_date_ms ? new Date(parseInt(latestTransaction.purchase_date_ms, 10)) : undefined,
        originalPurchaseDate: latestTransaction?.original_purchase_date_ms ? new Date(parseInt(latestTransaction.original_purchase_date_ms, 10)) : undefined,
        isTrialPeriod: latestTransaction?.is_trial_period === 'true',
        isInIntroOfferPeriod: latestTransaction?.is_in_intro_offer_period === 'true',
        rawResponse: appleResponse,
        isRetryable: this.isAppleErrorRetryable(appleResponse.status),
        errorCode: appleResponse.status,
        errorMessage: isValid ? undefined : `Apple validation failed with status: ${appleResponse.status}`,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Apple IAP validation HTTP error:', axiosError.message, axiosError.response?.data);
      return {
        isValid: false,
        platform: 'apple',
        isRetryable: true, // Network errors are typically retryable
        errorMessage: axiosError.message,
        errorCode: axiosError.response?.status || 'HTTP_ERROR',
        rawResponse: axiosError.response?.data,
      };
    }
  }

  private isAppleErrorRetryable(status: number): boolean {
    // See: https://developer.apple.com/documentation/appstorereceipts/status
    // Statuses indicating the App Store is temporarily unavailable.
    const retryableStatuses = [
        21000, // The App Store could not read the JSON object you provided. (Maybe retry if client error)
        21005, // The receipt server is not currently available.
        21008, // The receipt server is temporarily unavailable. (Sandbox only)
        21009, // Internal data access error. (Sandbox only)
    ];
    return retryableStatuses.includes(status);
  }
}

class GoogleReceiptClient implements IPlatformReceiptClient {
  private httpClient: AxiosInstance;
  private validationUrlBase: string; // e.g. https://androidpublisher.googleapis.com/androidpublisher/v3/applications/
  // private googleAuth; // Instance of GoogleAuth for JWT Bearer token

  constructor(config: IapConfig['google'], timeoutMs: number) {
    this.validationUrlBase = config.validationUrl;
    this.httpClient = axios.create({ timeout: timeoutMs });

    // Initialize GoogleAuth from google-auth-library with service account
    // const { GoogleAuth } = require('google-auth-library');
    // if (config.googleServiceAccountKeyJson) {
    //   try {
    //     const key = JSON.parse(config.googleServiceAccountKeyJson);
    //     this.googleAuth = new GoogleAuth({
    //       credentials: key,
    //       scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    //     });
    //   } catch (e) {
    //     logger.error('Failed to parse Google Service Account Key JSON for IAP:', e);
    //   }
    // } else {
    //    logger.warn('Google Service Account Key JSON for IAP not provided. Validation will likely fail.');
    // }
  }

  async validate(data: ValidateGoogleReceiptDto): Promise<ValidationResultDto> {
    if (!data.packageName || !data.productId || !data.purchaseToken) {
        return { isValid: false, platform: 'google', errorMessage: 'Missing packageName, productId, or purchaseToken for Google validation.' };
    }
    // if (!this.googleAuth) {
    //   return { isValid: false, platform: 'google', errorMessage: 'Google Auth for IAP not initialized.' };
    // }
    
    const validationUrl = `${this.validationUrlBase}${data.packageName}/purchases/products/${data.productId}/tokens/${data.purchaseToken}`;
    
    try {
      // const token = await this.googleAuth.getAccessToken();
      const mockToken = "DUMMY_ACCESS_TOKEN_FOR_NOW"; // Replace with actual token fetching

      const response = await this.httpClient.get(validationUrl, {
        headers: {
          // Authorization: `Bearer ${token}`,
          Authorization: `Bearer ${mockToken}`, // Placeholder
        },
      });
      const googleResponse = response.data;
      // Normalize Google response to ValidationResultDto
      // See: https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.products/get
      // purchaseState: 0 (purchased), 1 (canceled), 2 (pending)
      const isValid = googleResponse.purchaseState === 0;
      return {
        isValid,
        platform: 'google',
        transactionId: googleResponse.orderId, // Often used as transaction ID
        productId: data.productId, // productId is part of request, not typically in response this way
        purchaseDate: googleResponse.purchaseTimeMillis ? new Date(parseInt(googleResponse.purchaseTimeMillis, 10)) : undefined,
        isTrialPeriod: googleResponse.acknowledgementState !== undefined && googleResponse.purchaseType === 1, // purchaseType 1 is test, 0 is real
        developerPayload: googleResponse.developerPayload,
        rawResponse: googleResponse,
        isRetryable: false, // Google API errors are typically not client-retryable unless specific HTTP codes
        errorCode: isValid ? undefined : googleResponse.purchaseState, // Or HTTP status if error
        errorMessage: isValid ? undefined : `Google validation failed with purchaseState: ${googleResponse.purchaseState}`,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Google IAP validation HTTP error:', axiosError.message, axiosError.response?.data);
      const status = axiosError.response?.status;
      const isRetryable = status === 500 || status === 503; // Server errors
      return {
        isValid: false,
        platform: 'google',
        isRetryable,
        errorMessage: axiosError.message,
        errorCode: status || 'HTTP_ERROR',
        rawResponse: axiosError.response?.data,
      };
    }
  }
}


export class IapService {
  private appleClient: IPlatformReceiptClient;
  private googleClient: IPlatformReceiptClient;

  constructor(
    private iapConfig: IapConfig,
    private auditService: AuditService,
  ) {
    // In a real DI setup, clients would be injected.
    // For now, instantiate them here.
    this.appleClient = new AppleReceiptClient(this.iapConfig.apple, this.iapConfig.timeoutMs);
    this.googleClient = new GoogleReceiptClient(this.iapConfig.google, this.iapConfig.timeoutMs);
  }

  private async logValidationAttempt(platform: 'apple' | 'google', data: any, req: any) {
    const sourceIp = req?.ip || req?.socket?.remoteAddress;
    const userAgent = req?.headers?.['user-agent'];
    const userId = req?.user?.userId; // If request is authenticated

    await this.auditService.logEvent({
      eventType: AuditEventType.IAP_VALIDATION_ATTEMPT,
      userId,
      outcome: AUDIT_OUTCOME_ATTEMPT,
      sourceIp,
      userAgent,
      details: { platform, requestData: this.sanitizeReceiptData(data, platform) },
    });
  }

  private async logValidationResult(result: ValidationResultDto, req: any) {
    const sourceIp = req?.ip || req?.socket?.remoteAddress;
    const userAgent = req?.headers?.['user-agent'];
    const userId = req?.user?.userId;

    await this.auditService.logEvent({
      eventType: result.isValid ? AuditEventType.IAP_VALIDATION_SUCCESS : AuditEventType.IAP_VALIDATION_FAILURE,
      userId,
      outcome: result.isValid ? AUDIT_OUTCOME_SUCCESS : AUDIT_OUTCOME_FAILURE,
      sourceIp,
      userAgent,
      details: {
        platform: result.platform,
        transactionId: result.transactionId,
        productId: result.productId,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        // rawResponse could be too verbose for audit, consider omitting or summarizing
      },
    });
  }

  private sanitizeReceiptData(data: any, platform: 'apple' | 'google'): any {
      if (platform === 'apple' && data.receiptData) {
          return { ...data, receiptData: data.receiptData.substring(0, 30) + '...'}; // Truncate long receipt
      }
      return data; // Google data is usually not excessively long
  }

  async validateAppleReceipt(receiptData: ValidateAppleReceiptDto, req?: any): Promise<ValidationResultDto> {
    await this.logValidationAttempt('apple', receiptData, req);
    const result = await this.appleClient.validate(receiptData);
    await this.logValidationResult(result, req);
    return result;
  }

  async validateGoogleReceipt(purchaseData: ValidateGoogleReceiptDto, req?: any): Promise<ValidationResultDto> {
    await this.logValidationAttempt('google', purchaseData, req);
    const result = await this.googleClient.validate(purchaseData);
    await this.logValidationResult(result, req);
    return result;
  }
}