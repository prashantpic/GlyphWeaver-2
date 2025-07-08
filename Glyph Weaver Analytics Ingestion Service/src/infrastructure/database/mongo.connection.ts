import mongoose from 'mongoose';
import { config } from '../../config';
import { logger } from '../../utils/logger';

/**
 * Establishes and manages the connection to the MongoDB database using Mongoose.
 */
export const connectDB = async (): Promise<void> => {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected successfully.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(err, 'MongoDB connection error.');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected.');
  });

  try {
    await mongoose.connect(config.MONGO_URI, {
      dbName: config.MONGO_DB_NAME,
      // Mongoose 6+ has these on by default and they are recommended
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
  } catch (error) {
    logger.fatal(error, 'Failed to connect to MongoDB at startup.');
    process.exit(1);
  }
};