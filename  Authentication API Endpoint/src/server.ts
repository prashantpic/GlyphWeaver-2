import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import http from 'http';
import https from 'https';
import fs from 'fs';

import { AppConfig } from './config';
import { authRoutes } from './api/routes/auth.routes';
import { globalErrorHandler } from './api/middleware/error.handler';
import { NotFoundError } from './utils/errors';

// Initialize Express app
const app = express();

// --- Core Middleware ---
// Set security-related HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors({ origin: AppConfig.CORS_ORIGIN }));

// Parse incoming JSON requests
app.use(express.json());

// --- API Routes ---
app.use('/api/v1/auth', authRoutes);

// --- Not Found Handler ---
// Handles requests to routes that do not exist
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// --- Global Error Handler ---
// This must be the last middleware added to the stack
app.use(globalErrorHandler);

// --- Server Initialization ---
let server: http.Server | https.Server;

if (AppConfig.NODE_ENV === 'production' && AppConfig.SSL_CERT_PATH && AppConfig.SSL_KEY_PATH) {
  try {
    const options = {
      key: fs.readFileSync(AppConfig.SSL_KEY_PATH),
      cert: fs.readFileSync(AppConfig.SSL_CERT_PATH),
    };
    server = https.createServer(options, app);
  } catch (err) {
    console.error('Error loading SSL certificates. Falling back to HTTP.', err);
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
}

const runningServer = server.listen(AppConfig.PORT, () => {
  const protocol = AppConfig.NODE_ENV === 'production' ? 'HTTPS' : 'HTTP';
  console.log(`✅ Server is running in ${AppConfig.NODE_ENV} mode on port ${AppConfig.PORT} using ${protocol}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server');
  runningServer.close(() => {
    console.info('HTTP server closed');
  });
});