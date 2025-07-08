import winston from 'winston';
import config from '../config';

const isProduction = process.env.NODE_ENV === 'production';

const format = isProduction
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    );

const transports = [
  new winston.transports.Console()
];

const logger = winston.createLogger({
  level: config.logLevel,
  format,
  transports,
  exitOnError: false,
});

export default logger;