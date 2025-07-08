import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
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
    ? winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston.format.json())
    : winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      );

const transports = [new winston.transports.Console()];

/**
 * Centralized logger instance (Winston) for structured, leveled logging.
 * - In Development: Human-readable, colorized console output.
 * - In Production: Structured JSON console output, suitable for log aggregators.
 */
const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default Logger;