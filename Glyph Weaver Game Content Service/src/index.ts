import 'dotenv/config';
import app from './app';
import { connectDB } from './infrastructure/database/connection';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[server]: Server is running at http://localhost:${PORT}`);
    });

    const gracefulShutdown = () => {
      console.log('Received kill signal, shutting down gracefully.');
      server.close(() => {
        console.log('Closed out remaining connections.');
        mongoose.connection.close(false).then(() => {
          console.log('MongoDb connection closed.');
          process.exit(0);
        });
      });
    };

    // Listen for TERM signal .e.g. kill
    process.on('SIGTERM', gracefulShutdown);
    // Listen for INT signal e.g. Ctrl-C
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('[server]: Failed to start server:', error);
    process.exit(1);
  }
};

startServer();