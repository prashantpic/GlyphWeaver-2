// This file augments the Express interfaces with custom properties added by middleware.

declare global {
  namespace Express {
    interface Request {
      /**
       * Status of user consent for analytics tracking, set by the consentCheck middleware.
       */
      userConsentStatus?: 'granted' | 'denied' | 'unknown';
      /**
       * A unique identifier for the incoming request, potentially set by early middleware (e.g., requestLogger).
       */
      requestId?: string;
      /**
       * The pre-hashed API key provided in the request header, if applicable and set by an auth middleware.
       * This is an example; secure authentication is recommended.
       */
      apiKeyHash?: string;
    }
  }
}

// Export {} is needed to make this a module, which is required for global augmentation.
export {};