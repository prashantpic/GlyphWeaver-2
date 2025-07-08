import app from './app';
import config from './config';
import mongoose from 'mongoose';

/**
 * The main entry point for the application.
 * This function initializes the database connection and starts the Express server.
 */
const startServer = async () => {
  try {
    // Recommended by Mongoose to prepare for future changes.
    mongoose.set('strictQuery', true);

    // Connect to the MongoDB database using the URI from config.
    await mongoose.connect(config.MONGODB_URI);
    console.log('Successfully connected to MongoDB.');

    // Start the Express server, listening on the configured port.
    app.listen(config.PORT, () => {
      console.log(`Server is running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or start server:', error);
    // Exit the process with an error code if initialization fails.
    process.exit(1);
  }
};

// Handle database connection errors after initial connection.
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Execute the server startup logic.
startServer();