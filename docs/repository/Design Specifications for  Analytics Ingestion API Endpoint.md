# Software Design Specification (SDS) for Analytics Ingestion API

## 1. Introduction

### 1.1. Purpose

This document provides a detailed software design specification for the **Analytics Ingestion API Endpoint (`REPO-GLYPH-ANALYTICS`)**. This service is a core component of the Glyph Weaver backend, responsible for receiving, validating, and persisting all analytics events generated by the game client. Its primary design goals are high availability, high throughput, and data integrity.

### 1.2. Scope

The scope of this SDS is limited to the `REPO-GLYPH-ANALYTICS` microservice. This includes:
- A RESTful API endpoint for receiving batched analytics events.
- Validation logic for all incoming data.
- An application service to orchestrate the ingestion process.
- A data access layer to persist the events into a MongoDB database.
- All necessary configuration and boilerplate for a standalone Node.js/Express.js/TypeScript application.

This service will initially persist data directly to MongoDB. The design must be decoupled to allow future integration with a message queue system (e.g., AWS SQS, RabbitMQ) with minimal changes to the controller and validation layers.

### 1.3. Technology Stack

-   **Language:** TypeScript
-   **Framework:** Express.js
-   **Database:** MongoDB with Mongoose ODM
-   **Validation:** Joi
-   **Environment Management:** dotenv

## 2. System Architecture

The service adheres to a clean, layered architecture to promote separation of concerns, testability, and maintainability.

-   **API (Presentation) Layer:** Contains Express.js routers, controllers, and middleware. It is responsible for handling HTTP requests, routing, and input validation.
-   **Application Services Layer:** Contains the core business logic for the use case. It orchestrates operations, taking validated data from the API layer and using the Data Access layer for persistence.
-   **Infrastructure (Data Access) Layer:** Contains repositories and data models (Mongoose schemas). It abstracts all database interactions.

**Data Flow:**
`HTTP Request` -> `Express Router` -> `Validation Middleware` -> `Controller` -> `Application Service` -> `Repository` -> `MongoDB`

## 3. Detailed Component Specification

This section details the design of each file within the repository.

### 3.1. Project Configuration

#### 3.1.1. `package.json`
**Purpose:** Manages project dependencies and defines run scripts.
**Specification:**
-   **`dependencies`**:
    -   `express`: Web server framework.
    -   `mongoose`: MongoDB Object Data Mapper.
    -   `joi`: Schema validation library.
    -   `dotenv`: Environment variable loader.
    -   `cors`: Cross-Origin Resource Sharing middleware.
-   **`devDependencies`**:
    -   `typescript`: Language transpiler.
    -   `ts-node`: TypeScript execution environment for development.
    -   `nodemon`: Monitors for file changes and restarts the server.
    -   `@types/*`: Type definitions for all dependencies.
-   **`scripts`**:
    -   `"build": "tsc"`: Compiles TypeScript to JavaScript.
    -   `"start": "node dist/index.js"`: Runs the compiled application.
    -   `"dev": "nodemon src/index.ts"`: Runs the application in development mode with auto-reloading.

#### 3.1.2. `tsconfig.json`
**Purpose:** Configures the TypeScript compiler (`tsc`).
**Specification:**
-   **`compilerOptions`**:
    -   `"target": "ES2020"`
    -   `"module": "CommonJS"`
    -   `"outDir": "./dist"`
    -   `"rootDir": "./src"`
    -   `"strict": true`
    -   `"esModuleInterop": true`
    -   `"resolveJsonModule": true`
    -   `"skipLibCheck": true`
    -   `"forceConsistentCasingInFileNames": true`

### 3.2. Application Configuration

#### 3.2.1. `src/config/index.ts`
**Purpose:** Provides a single, type-safe source for all application configuration variables.
**Specification:**
-   Loads environment variables from a `.env` file using `dotenv`.
-   Defines and exports a frozen `config` object.
-   **Properties**:
    -   `port: number` (Default: 3001)
    -   `mongodbUri: string`
    -   `corsOrigin: string` (Default: '*')
-   **Logic**: Throws a runtime error if `MONGODB_URI` is not defined, preventing the application from starting without a database connection string.

### 3.3. Infrastructure Layer (Data Access)

#### 3.3.1. `src/infrastructure/data/models/raw-analytics-event.model.ts`
**Purpose:** Defines the Mongoose schema and model for storing a raw analytics event.
**Specification:**
-   **`IRawAnalyticsEvent` Interface**: Defines the TypeScript type for a document.
    typescript
    interface IRawAnalyticsEvent extends Document {
      sessionId: string;
      playerId?: string;
      eventName: string;
      eventTimestamp: Date;
      payload: Record<string, any>;
      createdAt: Date;
    }
    
-   **`rawAnalyticsEventSchema`**: A Mongoose Schema instance.
    -   `sessionId`: `String`, required.
    -   `playerId`: `String`, optional.
    -   `eventName`: `String`, required, indexed.
    -   `eventTimestamp`: `Date`, required, indexed.
    -   `payload`: `Schema.Types.Mixed`, required.
-   **Options**: `{ timestamps: { createdAt: true, updatedAt: false } }` to automatically add `createdAt`.
-   **Indexes**: A compound index on `{ eventTimestamp: -1, eventName: 1 }` for efficient time-based queries.
-   **Export**: Exports the compiled Mongoose model: `mongoose.model<IRawAnalyticsEvent>('RawAnalyticsEvent', rawAnalyticsEventSchema)`.

#### 3.3.2. `src/infrastructure/data/repositories/raw-analytics-event.repository.ts`
**Purpose:** Provides a data access layer for persisting raw analytics events to the database.
**Specification:**
typescript
import { Model } from 'mongoose';
import { IRawAnalyticsEvent } from '../models/raw-analytics-event.model';
import { IngestEventsRequestDto } from '../../../application/dtos/ingest-events-request.dto';

// Interface for the repository (for DI and testing)
export interface IRawAnalyticsEventRepository {
  saveBatch(ingestRequest: IngestEventsRequestDto): Promise<void>;
}

export class RawAnalyticsEventRepository implements IRawAnalyticsEventRepository {
  private readonly analyticsEventModel: Model<IRawAnalyticsEvent>;

  constructor(analyticsEventModel: Model<IRawAnalyticsEvent>) {
    this.analyticsEventModel = analyticsEventModel;
  }

  /**
   * Transforms and inserts a batch of analytics events into the database.
   * @param ingestRequest - The DTO containing the session/player info and array of events.
   */
  public async saveBatch(ingestRequest: IngestEventsRequestDto): Promise<void> {
    // 1. Map the DTO to the Mongoose model format.
    //    Combine sessionId and playerId with each individual event.
    const documentsToInsert = ingestRequest.events.map(event => ({
      sessionId: ingestRequest.sessionId,
      playerId: ingestRequest.playerId,
      eventName: event.eventName,
      eventTimestamp: new Date(event.eventTimestamp),
      payload: event.payload,
    }));

    // 2. Use insertMany for efficient bulk insertion.
    await this.analyticsEventModel.insertMany(documentsToInsert, { ordered: false });
    // Note: { ordered: false } allows valid events in a batch to be inserted even if others fail.
  }
}


### 3.4. Application Services Layer

#### 3.4.1. `src/application/dtos/analytics-event.dto.ts`
**Purpose:** Defines the expected structure of a single analytics event sent by the client.
**Specification:**
typescript
export interface AnalyticsEventDto {
  eventName: string;
  eventTimestamp: string; // ISO 8601 format
  payload: Record<string, any>;
}


#### 3.4.2. `src/application/dtos/ingest-events-request.dto.ts`
**Purpose:** Defines the shape of the entire JSON body sent to the analytics ingestion endpoint.
**Specification:**
typescript
import { AnalyticsEventDto } from './analytics-event.dto';

export interface IngestEventsRequestDto {
  sessionId: string;
  playerId?: string; // Player ID is optional for anonymous/pre-login events
  events: AnalyticsEventDto[];
}


#### 3.4.3. `src/application/services/analytics-ingestion.service.ts`
**Purpose:** Orchestrates the persistence of incoming analytics data.
**Specification:**
typescript
import { IRawAnalyticsEventRepository } from '../../infrastructure/data/repositories/raw-analytics-event.repository';
import { IngestEventsRequestDto } from '../dtos/ingest-events-request.dto';

// Interface for the service (for DI and testing)
export interface IAnalyticsIngestionService {
  ingestEvents(ingestRequest: IngestEventsRequestDto): Promise<void>;
}

export class AnalyticsIngestionService implements IAnalyticsIngestionService {
  private readonly rawAnalyticsEventRepository: IRawAnalyticsEventRepository;

  constructor(rawAnalyticsEventRepository: IRawAnalyticsEventRepository) {
    this.rawAnalyticsEventRepository = rawAnalyticsEventRepository;
  }

  /**
   * Processes a validated batch of analytics events by delegating to the repository.
   * @param ingestRequest The validated DTO of events to be ingested.
   */
  public async ingestEvents(ingestRequest: IngestEventsRequestDto): Promise<void> {
    // Note: This is the decoupling point. In a future version, this implementation
    // could be changed to push events to a message queue (e.g., SQS, RabbitMQ)
    // instead of calling the repository directly.
    // The rest of the application (controller, etc.) would remain unchanged.
    
    await this.rawAnalyticsEventRepository.saveBatch(ingestRequest);
  }
}


### 3.5. API (Presentation) Layer

#### 3.5.1. `src/api/validation/analytics.validator.ts`
**Purpose:** Defines Joi validation schemas for the analytics ingestion request body.
**Specification:**
typescript
import Joi from 'joi';

const eventSchema = Joi.object({
  eventName: Joi.string().min(3).max(100).required(),
  eventTimestamp: Joi.date().iso().required(),
  payload: Joi.object().required(),
});

export const ingestEventsSchema = Joi.object({
  sessionId: Joi.string().guid({ version: 'uuidv4' }).required(),
  playerId: Joi.string().allow(null, ''), // Allow optional or empty player ID
  events: Joi.array().items(eventSchema).min(1).max(100).required(), // Batch up to 100 events
});


#### 3.5.2. `src/api/middleware/validation.middleware.ts`
**Purpose:** Provides a reusable Express middleware for validating request bodies using Joi.
**Specification:**
typescript
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => 
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      // Pass a structured error to the global error handler
      const validationError = new Error(`Validation failed: ${error.details.map(d => d.message).join(', ')}`);
      (validationError as any).statusCode = 400; // Attach status code
      return next(validationError);
    }
    next();
};


#### 3.5.3. `src/api/controllers/analytics.controller.ts`
**Purpose:** Acts as the entry point for API requests related to analytics ingestion.
**Specification:**
typescript
import { Request, Response, NextFunction } from 'express';
import { IAnalyticsIngestionService } from '../../application/services/analytics-ingestion.service';
import { IngestEventsRequestDto } from '../../application/dtos/ingest-events-request.dto';

export class AnalyticsController {
  private readonly analyticsIngestionService: IAnalyticsIngestionService;

  constructor(analyticsIngestionService: IAnalyticsIngestionService) {
    this.analyticsIngestionService = analyticsIngestionService;
  }

  // Use an arrow function to preserve 'this' context when used as a route handler
  public ingestEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ingestRequest = req.body as IngestEventsRequestDto;
      await this.analyticsIngestionService.ingestEvents(ingestRequest);
      // 202 Accepted is appropriate as we may process asynchronously in the future
      res.status(202).send();
    } catch (error) {
      next(error); // Pass error to the global error handler
    }
  };
}


#### 3.5.4. `src/api/routes/analytics.routes.ts`
**Purpose:** Configures the routing for the analytics API.
**Specification:**
typescript
import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { ingestEventsSchema } from '../validation/analytics.validator';
import { IAnalyticsIngestionService } from '../../application/services/analytics-ingestion.service';

// This function will create and return the router, allowing for dependency injection
export const createAnalyticsRouter = (analyticsIngestionService: IAnalyticsIngestionService): Router => {
  const router = Router();
  const analyticsController = new AnalyticsController(analyticsIngestionService);

  router.post(
    '/events',
    validateRequest(ingestEventsSchema),
    analyticsController.ingestEvents
  );

  return router;
};


### 3.6. Application Entry Point

#### 3.6.1. `src/index.ts`
**Purpose:** Bootstraps and runs the entire analytics API service.
**Specification:**
typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from './config';

// Import services, repos, models, and routes
import RawAnalyticsEventModel from './infrastructure/data/models/raw-analytics-event.model';
import { RawAnalyticsEventRepository } from './infrastructure/data/repositories/raw-analytics-event.repository';
import { AnalyticsIngestionService } from './application/services/analytics-ingestion.service';
import { createAnalyticsRouter } from './api/routes/analytics.routes';

const app: Express = express();

// --- Middleware ---
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// --- Dependency Injection (Manual) ---
const rawAnalyticsEventRepository = new RawAnalyticsEventRepository(RawAnalyticsEventModel);
const analyticsIngestionService = new AnalyticsIngestionService(rawAnalyticsEventRepository);
const analyticsRouter = createAnalyticsRouter(analyticsIngestionService);

// --- Routes ---
app.use('/api/v1/analytics', analyticsRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// --- Global Error Handler ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: { message } });
});


// --- Server Startup ---
const startServer = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Successfully connected to MongoDB.');
    
    app.listen(config.port, () => {
      console.log(`Analytics API server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or start server', error);
    process.exit(1);
  }
};

startServer();
