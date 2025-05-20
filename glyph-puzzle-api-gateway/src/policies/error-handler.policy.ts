import { Policy } from 'express-gateway';
import { ErrorResponseDto } from '../dto/error-response.dto';

const policy: Policy = {
  name: 'errorHandlerPolicy',
  policy: () => {
    // This policy functions like an Express error handling middleware.
    // It should be the last policy in the pipeline or configured in a way
    // that it catches errors from preceding policies and the proxy.
    return (err: any, req: any, res: any, next: (err?: any) => void) => {
      // Log the full error internally for debugging
      // In a production environment, use a structured logger (e.g., Winston, Pino)
      console.error(`[API Gateway Error] Request ID: ${req.egContext?.requestID || 'N/A'}`);
      console.error(`Error during ${req.method} ${req.path}:`, err.message);
      if (err.stack) {
        console.error(err.stack);
      }
      if(err.response && err.response.data) { // For errors from downstream services via axios-like clients
        console.error('Downstream service error data:', err.response.data);
      }


      let statusCode = err.statusCode || err.status || 500;
      let message = err.message || 'An unexpected error occurred.';
      let errorCode: string | undefined = err.errorCode || err.code; // Use err.code if err.errorCode is not present
      let details: any | undefined = err.details;

      // Standardize common error types
      if (err.name === 'UnauthorizedError') { // Often from JWT middleware
        statusCode = 401;
        message = 'Authentication failed or token is invalid.';
        errorCode = errorCode || 'UNAUTHORIZED';
      } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Access to this resource is forbidden.';
        errorCode = errorCode || 'FORBIDDEN';
      } else if (err.isJoi || (err.details && Array.isArray(err.details))) { // Joi validation error
        statusCode = 400;
        message = 'Request validation failed.';
        errorCode = errorCode || 'VALIDATION_ERROR';
        details = err.details.map((d: any) => ({
          field: d.path.join('.'),
          message: d.message,
          type: d.type,
        }));
      }


      // Sanitize error message for 5xx errors in production to avoid leaking sensitive info
      if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
        message = 'An internal server error occurred. Please try again later.';
        // Optionally clear details for 5xx errors in prod unless specifically safe
        // details = undefined; 
      }

      const errorResponse: ErrorResponseDto = {
        statusCode,
        message,
        errorCode,
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path, // req.originalUrl includes query params
        details,
      };

      if (res.headersSent) {
        // If headers are already sent, we can't send a new JSON response.
        // This indicates an issue deeper in the pipeline or an error during streaming.
        // Delegate to the default Express error handler or simply log and end.
        console.error('Error handler: Headers already sent. Cannot send error response.');
        return next(err); // Pass to default EG error handler
      }

      res.status(statusCode).json(errorResponse);
    };
  },
  schema: {
    $id: 'http://express-gateway.io/schemas/policies/errorHandlerPolicy.json',
    type: 'object',
    properties: {}, // No specific configuration needed for this generic handler
  },
};

module.exports = policy;