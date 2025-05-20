import winston from 'winston';
import { environmentConfig } from '../config/environment'; // Assuming this will be created

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} ${level}: ${stack || message}`;
});

const developmentFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  logFormat
);

const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: environmentConfig.nodeEnv === 'production' ? 'info' : 'debug',
  format: environmentConfig.nodeEnv === 'production' ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console(),
    // In production, you might want to add a file transport or integrate with a log management service
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// Stream interface for Morgan (if used for HTTP request logging, alternative to custom requestLoggerMiddleware)
// logger.stream = {
//   write: (message: string) => {
//     logger.info(message.trim());
//   },
// };

export default logger;