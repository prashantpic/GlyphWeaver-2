import { Request, Response, NextFunction } from 'express';
import { ConsentError } from '../../utils/customError';
import { LoggingService } from '../../services/LoggingService';

/**
 * Middleware to check for user consent status before processing analytics events.
 * This example checks for a custom header 'X-User-Consent'.
 * It populates `req.userConsentStatus` and throws `ConsentError` if consent is denied
 * or unknown for events requiring consent (as per REQ-AMOT-001).
 */
export const consentCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const consentHeader = req.headers['x-user-consent'] as string | undefined;
  let userConsentStatus: 'granted' | 'denied' | 'unknown' = 'unknown';

  if (consentHeader) {
      const lowerCaseConsent = consentHeader.toLowerCase();
      if (lowerCaseConsent === 'granted') {
          userConsentStatus = 'granted';
      } else if (lowerCaseConsent === 'denied') {
          userConsentStatus = 'denied';
      }
      // 'unknown' remains if header is present but not 'granted' or 'denied'
  }
  // If integrating with an auth system that provides consent, you might check req.user here.

  // Attach the determined consent status to the request object
  // Augment Express.Request type via src/types/express.d.ts
  (req as any).userConsentStatus = userConsentStatus; // Using 'any' for simplicity here, ensure type augmentation
  LoggingService.debug(`User consent status determined: ${userConsentStatus}. RequestId: ${req.requestId}`);


  // REQ-AMOT-001: Ensure consent is granted for data collection.
  // This implementation assumes ALL analytics events passed through this middleware require consent.
  // For more granularity, you might check event types or other payload properties.
  const requiresConsent = true;

  if (requiresConsent && userConsentStatus !== 'granted') {
    LoggingService.warn('Analytics event rejected due to missing or denied user consent.', {
        requestId: req.requestId,
        userId: (req.body as any)?.userId || 'N/A',
        sessionId: (req.body as any)?.sessionId || 'N/A',
        consentStatus: userConsentStatus
    });
    return next(new ConsentError('User consent not granted or is unknown for analytics tracking.')); // 403 Forbidden
  }

  LoggingService.debug(`User consent check passed for RequestId: ${req.requestId}. Proceeding.`);
  next();
};