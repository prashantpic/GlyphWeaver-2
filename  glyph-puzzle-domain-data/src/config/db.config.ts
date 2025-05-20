import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not defined.');
    process.exit(1);
}

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: MONGODB_DB_NAME,
            // Mongoose 6+ default these to true/false as appropriate,
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true, // not needed in Mongoose 6+
            // useFindAndModify: false, // not needed in Mongoose 6+
        });
        console.log('MongoDB connected successfully.');

        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected.');
        });

    } catch (error) {
        console.error(`MongoDB connection failed: ${(error as Error).message}`);
        process.exit(1);
    }
};