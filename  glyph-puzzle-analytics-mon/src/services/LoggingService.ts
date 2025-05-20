import winston, { Logger } from 'winston';
import { winstonConfig } from '../config/winston.config'; 
import { config } from '../config'; 

/**
 * Centralized logger instance configured via winstonConfig.
 */
const logger: Logger = winston.createLogger(winstonConfig);

/**
 * Service for standardized application logging.
 * Provides wrapper methods around the configured Winston logger.
 */
export const LoggingService = {
  info: (message: string, meta?: any) => logger.info(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta), // For HTTP request logging

  /**
   * Logs an error. Includes stack trace if not in production.
   * @param message - The primary error message.
   * @param error - The error object (optional).
   * @param meta - Additional metadata.
   */
  error: (message: string, error?: Error | any, meta?: any) => {
    let logObject: any = { ...meta };
    if (error instanceof Error) {
      logObject.errorMessage = error.message; 
      logObject.errorName = error.name;
      if (config.environment.NODE_ENV !== 'production' || meta?.includeStack) {
        logObject.stack = error.stack;
      }
    } else if (error) { 
        logObject.errorDetails = error;
    }
    logger.error(message, logObject);
  },

  /**
   * Logs an application error instance more directly.
   * @param errorInstance - The error object.
   * @param additionalMeta - Additional metadata.
   */
  logError: (errorInstance: Error, additionalMeta?: any) => {
    const meta = {
      ...additionalMeta,
      errorMessage: errorInstance.message,
      errorName: errorInstance.name,
      stack: config.environment.NODE_ENV !== 'production' || additionalMeta?.includeStack ? errorInstance.stack : undefined,
    };
    logger.error(`Error: ${errorInstance.message}`, meta);
  },

  /**
   * Get the raw Winston logger instance if direct access is needed.
   * @returns The configured Winston logger.
   */
  getWinstonInstance: (): Logger => logger,
};