import mongoose from 'mongoose';
import { environmentConfig } from './environment';
import { logger } from '../utils/logger'; // Assuming logger.ts exists

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    logger.info('MongoDB is already connected.');
    return;
  }

  try {
    logger.info('Attempting MongoDB connection...');
    await mongoose.connect(environmentConfig.mongodbUri);
    isConnected = true;
    logger.info('MongoDB connected successfully.');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected.');
  });

  mongoose.connection.on('error', (error) => {
    isConnected = false;
    logger.error('MongoDB connection error after initial connection:', error);
  });
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) {
    logger.info('MongoDB is not connected.');
    return;
  }
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected successfully.');
};