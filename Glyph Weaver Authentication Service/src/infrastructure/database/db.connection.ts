import mongoose from 'mongoose';
import Logger from './logger';

/**
 * Manages the connection to the MongoDB database using Mongoose.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    Logger.error('MONGODB_URI is not defined in environment variables.');
    throw new Error('MONGODB_URI is not defined.');
  }

  try {
    // Enable Mongoose debugging in development environment
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }
    
    await mongoose.connect(mongoUri);

    Logger.info('✅ Successfully connected to MongoDB database.');

    mongoose.connection.on('error', (err) => {
      Logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      Logger.warn('MongoDB connection disconnected.');
    });

  } catch (error) {
    Logger.error(`❌ Could not connect to MongoDB: ${error}`);
    // Re-throw the error to be caught by the bootstrap function in index.ts
    throw error;
  }
};