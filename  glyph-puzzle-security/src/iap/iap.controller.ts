import { Request, Response, NextFunction } from 'express';
import { IapService, ValidateAppleReceiptDto, ValidateGoogleReceiptDto, ValidationResultDto } from './iap.service';
import { HttpException } from '../common/exceptions/http-exception';
import { logger } from '../common/utils/logger.util';

export class IapController {
  constructor(private iapService: IapService) {}

  public validateAppleReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const validationData: ValidateAppleReceiptDto = req.body;

    if (!validationData.receiptData) {
      next(new HttpException(400, 'Missing receiptData for Apple IAP validation.'));
      return;
    }
    
    try {
      const result: ValidationResultDto = await this.iapService.validateAppleReceipt(validationData, req);
      if (!result.isValid && result.isRetryable) {
        // 503 Service Unavailable for retryable errors
        res.status(503).json(result);
      } else if (!result.isValid) {
        // 400 or 422 for non-retryable validation failures
        res.status(400).json(result);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      logger.error('IAP Apple validation controller error:', error);
      next(new HttpException(500, 'Internal server error during Apple IAP validation.'));
    }
  };

  public validateGoogleReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const validationData: ValidateGoogleReceiptDto = req.body;

    if (!validationData.packageName || !validationData.productId || !validationData.purchaseToken) {
      next(new HttpException(400, 'Missing packageName, productId, or purchaseToken for Google IAP validation.'));
      return;
    }

    try {
      const result: ValidationResultDto = await this.iapService.validateGoogleReceipt(validationData, req);
       if (!result.isValid && result.isRetryable) {
        res.status(503).json(result);
      } else if (!result.isValid) {
        res.status(400).json(result);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      logger.error('IAP Google validation controller error:', error);
      next(new HttpException(500, 'Internal server error during Google IAP validation.'));
    }
  };
}