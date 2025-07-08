import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MongooseLevelRepository } from './infrastructure/repositories/MongooseLevelRepository';
import { LevelService } from './application/services/level.service';
import { LevelController } from './api/controllers/level.controller';
import { createLevelRoutes } from './api/routes/levels.routes';

// --- Dependency Injection / Service Wiring ---
// This would typically be handled by a DI container library
const levelRepository = new MongooseLevelRepository();
const levelService = new LevelService(levelRepository);
const levelController = new LevelController(levelService);

// --- Express App Setup ---
const app: Express = express();

// --- Core Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- API Routes ---
const v1Router = express.Router();
v1Router.use('/levels', createLevelRoutes(levelController));
// Other routers (zones, catalogs, etc.) would be added here in the future
// e.g. v1Router.use('/zones', createZoneRoutes(zoneController));

app.use('/api/v1', v1Router);

// --- Health Check Endpoint ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// --- Global Error Handling Middleware ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log error stack for debugging
  
  // Respond with a generic 500 error
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// --- 404 Not Found Handler ---
app.use((req: Request, res: Response) => {
    res.status(404).json({ status: 'error', message: 'Not Found' });
});


export default app;