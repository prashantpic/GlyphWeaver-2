// src/infrastructure/database/DbConnection.ts
import mongoose from 'mongoose';
import { logger } from '../logging/Logger';

let isConnected = false;

/**
 * Establishes a connection to the MongoDB database using the URI
 * from the MONGO_URI environment variable.
 */
export const connect = async (): Promise<void> => {
  if (isConnected) {
    logger.info('=> using existing database connection');
    return;
  }
  
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    logger.error('MONGO_URI environment variable not set.');
    throw new Error('Database connection string is missing.');
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    logger.info('MongoDB connected successfully.');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        isConnected = false;
        logger.warn('MongoDB disconnected.');
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
};