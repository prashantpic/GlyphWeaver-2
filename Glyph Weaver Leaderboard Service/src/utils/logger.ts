import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, json, colorize, align, printf } = winston.format;

/**
 * A structured JSON logger instance using Winston.
 */
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
    }),
  ],
  exitOnError: false,
});