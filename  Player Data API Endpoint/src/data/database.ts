import mongoose from 'mongoose';
import { config } from '../core/config';
import { logger } from '../core/utils/logger'; // Assuming a logger utility is created

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * The application will exit if the connection fails.
 */
export const connectDB = async (): Promise<void> => {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected.');
    });

    await mongoose.connect(config.mongodbUri);

  } catch (error) {
    logger.error('Could not connect to MongoDB:', error);
    process.exit(1);
  }
};