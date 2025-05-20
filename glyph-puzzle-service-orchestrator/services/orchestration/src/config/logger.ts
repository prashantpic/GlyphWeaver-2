import winston from 'winston';
import { config } from './environment';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        return `${timestamp} [${service || 'glyph-puzzle-service-orchestrator'}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    ),
  }),
];

if (config.NODE_ENV === 'production') {
  // Example: Add a JSON transport for production
  // transports.push(new winston.transports.File({
  //   filename: 'app-prod.log',
  //   format: winston.format.combine(
  //     winston.format.timestamp(),
  //     winston.format.json()
  //   ),
  // }));
  // For simplicity, production will also use console but could be configured for structured logging
    transports[0].format = winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    );
}


const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.errors({ stack: true })
  ),
  defaultMeta: { service: 'glyph-puzzle-service-orchestrator' },
  transports,
});

export { logger };