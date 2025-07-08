import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';
import logger from './utils/logger';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import { setupSwagger } from './docs/swagger';
import mainRouter from './routes';

const app = express();

// --- Middleware Pipeline (Order is crucial) ---

// 1. Configure CORS
const corsOptions = {
    origin: config.corsOrigin ? config.corsOrigin.split(',') : '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};
app.use(cors(corsOptions));

// 2. Apply security headers
app.use(helmet());

// 3. Parse JSON request bodies
app.use(express.json());

// 4. Apply global rate limiting
app.use(rateLimitMiddleware);

// 5. Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// --- Routing ---
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/', mainRouter);

// --- API Documentation ---
setupSwagger(app);

// --- Error Handling (must be at the end) ---

// 1. Not Found Handler (for unmatched routes)
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// 2. Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;