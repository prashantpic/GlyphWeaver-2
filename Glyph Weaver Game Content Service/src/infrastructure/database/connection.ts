import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database using the URI from environment variables.
 * Also sets up event listeners for the connection lifecycle.
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 */
export const connectDB = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('MONGO_URI is not defined in environment variables.');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
    } catch (err) {
        console.error('Initial MongoDB connection error:', err);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
    console.log('[db]: MongoDB connected successfully.');
});

mongoose.connection.on('error', (err) => {
    console.error('[db]: MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('[db]: MongoDB disconnected.');
});