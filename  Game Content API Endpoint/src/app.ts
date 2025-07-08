import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import proceduralLevelsRouter from './api/v1/procedural-levels';

// Create the main Express application instance.
const app: Express = express();

// --- Global Middleware ---
// Enable Cross-Origin Resource Sharing for all origins.
app.use(cors());
// Parse incoming requests with JSON payloads.
app.use(express.json());

// --- API Routers ---
// Mount the feature-specific router for procedural levels.
app.use('/api/v1/procedural-levels', proceduralLevelsRouter);

// --- Health Check Endpoint ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// --- Global Error Handling Middleware ---
// This middleware must be last, after all other app.use() and routes calls.
// It catches any errors passed by next(error) from anywhere in the application.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);

  // Avoid sending stack traces or detailed error messages to the client in production.
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;