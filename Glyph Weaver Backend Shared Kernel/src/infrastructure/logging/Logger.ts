// src/infrastructure/logging/Logger.ts
import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

const format =
  process.env.NODE_ENV === 'production'
    ? combine(timestamp(), json())
    : combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), simple());

const transports = [new winston.transports.Console()];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});