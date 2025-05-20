import winston from 'winston';
import { environment, isProduction } from './environment';

const { combine, timestamp, printf, json, colorize, errors } = winston.format;

// Custom format for console logging in non-production
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }), // Log stack trace
  printf(info => {
    let logMessage = `${info.timestamp} ${info.level}: ${info.message}`;
    if (info.durationMs) { // For request/response logs
        logMessage += ` - ${info.durationMs}ms`;
    }
    if (info.stack) {
        logMessage += `\n${info.stack}`;
    }
    if (info.meta && Object.keys(info.meta).length) {
        // Avoid logging large objects in simple dev format, or stringify selectively
        // logMessage += ` ${JSON.stringify(info.meta)}`;
    }
    return logMessage;
  }),
);

// JSON format for production (ELK stack)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }), // Include stack traces in JSON
  json(),
  // Add additional fields for ELK stack here if needed, e.g., traceId, spanId
  // from APM agent if integration is manual
);


/**
 * Winston logger configuration options.
 */
export const winstonConfig: winston.LoggerOptions = {
  level: environment.LOG_LEVEL,
  format: isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console({
      // In production, the Docker logs will be collected, so console is fine.
      // Consider adding file or other transports for specific needs.
      handleExceptions: true, // Log unhandled exceptions
      handleRejections: true, // Log unhandled rejections
    }),
  ],
  exitOnError: false, // Do not exit on handled exceptions
};