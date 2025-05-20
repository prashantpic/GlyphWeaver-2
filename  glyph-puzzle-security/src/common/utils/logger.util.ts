import { AppConfig, appConfig as loadAppConfig } from '../../config/app.config';

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

const config: AppConfig = loadAppConfig(); // Load config directly here for simplicity

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const currentLogLevelPriority = LOG_LEVEL_PRIORITY[config.logLevel];

const log = (level: LogLevel, message: string, ...meta: any[]): void => {
  if (LOG_LEVEL_PRIORITY[level] <= currentLogLevelPriority) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
    if (meta.length > 0) {
      console[level === 'error' ? 'error' : 'log'](logMessage, ...meta);
    } else {
      console[level === 'error' ? 'error' : 'log'](logMessage);
    }
  }
};

export const logger = {
  error: (message: string, ...meta: any[]) => log('error', message, ...meta),
  warn: (message: string, ...meta: any[]) => log('warn', message, ...meta),
  info: (message: string, ...meta: any[]) => log('info', message, ...meta),
  http: (message: string, ...meta: any[]) => log('http', message, ...meta),
  verbose: (message: string, ...meta: any[]) => log('verbose', message, ...meta),
  debug: (message: string, ...meta: any[]) => log('debug', message, ...meta),
  silly: (message: string, ...meta: any[]) => log('silly', message, ...meta),
};

// Example of a more structured logger using a library like Winston could be:
// import winston from 'winston';
// const { combine, timestamp, printf, colorize, json } = winston.format;

// const myFormat = printf(({ level, message, timestamp: ts, ...metadata }) => {
//   let msg = `${ts} [${level}]: ${message} `;
//   if (Object.keys(metadata).length > 0) {
//     msg += JSON.stringify(metadata);
//   }
//   return msg;
// });

// export const logger = winston.createLogger({
//   level: config.logLevel,
//   format: combine(
//     colorize(),
//     timestamp(),
//     myFormat
//   ),
//   transports: [
//     new winston.transports.Console(),
//     // Add other transports like file or HTTP if needed
//   ],
//   defaultMeta: { service: 'glyph-puzzle-security' },
// });