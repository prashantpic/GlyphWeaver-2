# Software Design Specification (SDS): Glyph Weaver Analytics Ingestion Service

## 1. Introduction

This document provides a detailed software design specification for the **Glyph Weaver Analytics Ingestion Service** (`REPO-GLYPH-ANALYTICS`). This microservice is responsible for receiving, validating, enriching, and persisting high-volume telemetry and analytics data from the game client. Its design prioritizes high throughput, reliability, and a "fire-and-forget" API contract for the client.

The service will be built using a layered architecture with Node.js, Express.js, and TypeScript, persisting data to a MongoDB database.

## 2. System Architecture & Design Principles

### 2.1. Architectural Style
- **Microservice:** The service is a self-contained component within the larger Glyph Weaver backend ecosystem, focused solely on analytics ingestion.
- **Layered Architecture:** The codebase is structured into distinct layers to enforce separation of concerns, enhance maintainability, and improve testability.
  - **Presentation Layer:** Handles HTTP requests and responses (Controllers, Routes).
  - **Application Layer:** Orchestrates the core business logic (Services, DTOs).
  - **Domain Layer:** Defines the core data structures and business rules (Models, Repository Interfaces).
  - **Infrastructure Layer:** Implements external-facing concerns like database access (Repositories, DB Schemas, Connections).

### 2.2. Design Patterns & Principles
- **Fire-and-Forget API:** The primary API endpoint will immediately validate the request format and return a `202 Accepted` status. This acknowledges receipt and allows the game client to proceed without waiting for the data to be fully processed and stored, ensuring minimal impact on client performance.
- **Repository Pattern:** Decouples the application logic from the data persistence mechanism (MongoDB). The application will interact with an `IAnalyticsEventRepository` interface, with a concrete `MongoAnalyticsEventRepository` provided at runtime.
- **Dependency Injection (DI):** Dependencies (e.g., repositories, services) will be injected into components (typically via constructors) to promote loose coupling and facilitate testing with mocks.
- **Data Transfer Objects (DTOs):** DTOs will be used at the API boundary (`presentation` layer) to define a clear contract for incoming data and to facilitate request validation.
- **Asynchronous Operations:** All I/O-bound operations (database writes) will be fully asynchronous using `async/await` to ensure the Node.js event loop is never blocked.
- **Batch Processing:** The core ingestion logic is designed to process events in batches to maximize database write efficiency using MongoDB's `insertMany` operation.

## 3. Technology Stack

- **Runtime:** Node.js (v18.x or later LTS)
- **Language:** TypeScript (v5.x)
- **Web Framework:** Express.js (v4.x)
- **Database:** MongoDB (v6.x or later)
- **ODM (Object Data Mapper):** Mongoose (v7.x or later)
- **Validation:** Zod (for request body validation)
- **Security:** Helmet, CORS
- **Configuration:** dotenv
- **Logging:** Pino (for structured, high-performance logging)

## 4. Core Components Specification

### 4.1. Configuration (`src/config/index.ts`)
- **Purpose:** To load, validate, and provide a single, typed source of truth for all environment variables.
- **Implementation:**
  - Uses `dotenv` to load variables from a `.env` file for local development.
  - Defines a `Zod` schema to validate the presence and type of required environment variables (`PORT`, `MONGO_URI`, `MONGO_DB_NAME`, `NODE_ENV`, `CORS_ORIGIN`).
  - Exports a read-only, validated `config` object.

typescript
// src/config/index.ts (Conceptual)
import dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().url(),
  MONGO_DB_NAME: z.string().min(1),
  CORS_ORIGIN: z.string().url().default('*'),
});

export const config = envSchema.parse(process.env);


### 4.2. Domain Layer

#### 4.2.1. Analytics Event Model (`src/domain/models/AnalyticsEvent.ts`)
- **Purpose:** To define the canonical structure of an analytics event within the system.
- **Interface Definition:**
typescript
// src/domain/models/AnalyticsEvent.ts
export interface AnalyticsEvent {
  id: string; // UUID generated on the server
  sessionId: string;
  userId: string | null; // Null for anonymous users
  eventName: string;
  clientTimestamp: Date;
  serverTimestamp: Date;
  clientVersion: string; // e.g., "1.0.2"
  payload: Record<string, any>;
  geo: {
    country?: string;
    region?: string;
    city?: string;
  } | null;
}


#### 4.2.2. Analytics Event Repository Interface (`src/domain/repositories/IAnalyticsEventRepository.ts`)
- **Purpose:** To define the contract for data persistence, decoupling the application from MongoDB.
- **Interface Definition:**
typescript
// src/domain/repositories/IAnalyticsEventRepository.ts
import { AnalyticsEvent } from '../models/AnalyticsEvent';

export interface IAnalyticsEventRepository {
  /**
   * Persists a batch of analytics events to the data store.
   * @param events - An array of AnalyticsEvent domain models.
   */
  addBatch(events: AnalyticsEvent[]): Promise<void>;
}


### 4.3. Application Layer

#### 4.3.1. Ingestion DTOs and Validation (`src/application/dtos/IngestEvents.dto.ts`)
- **Purpose:** To define the API contract and validation rules for incoming client data.
- **Implementation:**
  - Uses `Zod` to create robust, self-documenting validation schemas.
typescript
// src/application/dtos/IngestEvents.dto.ts
import { z } from 'zod';

export const IncomingEventSchema = z.object({
  eventName: z.string().min(1).max(100),
  clientTimestamp: z.string().datetime(), // ISO 8601 format
  clientVersion: z.string().min(1),
  payload: z.record(z.any()),
});

export const IngestEventsDtoSchema = z.object({
  events: z.array(IncomingEventSchema).min(1).max(500), // Batches of 1 to 500 events
});

export type IngestEventsDto = z.infer<typeof IngestEventsDtoSchema>;


#### 4.3.2. Analytics Ingestion Service (`src/application/services/AnalyticsIngestion.service.ts`)
- **Purpose:** Orchestrates the validation, enrichment, and persistence of event batches.
- **Class Definition:**
typescript
// src/application/services/AnalyticsIngestion.service.ts (Conceptual)
export class AnalyticsIngestionService {
  constructor(
    private readonly analyticsEventRepository: IAnalyticsEventRepository,
    // private readonly geoIpService: IGeoIpService, // Optional for enrichment
  ) {}

  public async ingestEventBatch(
    ingestDto: IngestEventsDto,
    metadata: { ipAddress: string; userId?: string; sessionId: string }
  ): Promise<void> {
    const serverTimestamp = new Date();
    // const geo = await this.geoIpService.lookup(metadata.ipAddress); // Optional

    const eventsToSave: AnalyticsEvent[] = ingestDto.events.map(e => ({
      id: crypto.randomUUID(),
      sessionId: metadata.sessionId,
      userId: metadata.userId || null,
      eventName: e.eventName,
      clientTimestamp: new Date(e.clientTimestamp),
      serverTimestamp,
      clientVersion: e.clientVersion,
      payload: e.payload, // Further sanitization can be added here
      geo: null, // Populate with `geo` if service is used
    }));

    await this.analyticsEventRepository.addBatch(eventsToSave);
  }
}

### 4.4. Infrastructure Layer

#### 4.4.1. MongoDB Connection (`src/infrastructure/database/mongo.connection.ts`)
- **Purpose:** Manages the Mongoose database connection lifecycle.
- **Implementation:** Exports a single `connectDB` function that uses `mongoose.connect()` with the URI from the config file. Includes event listeners for `connected`, `error`, and `disconnected` states, logging each event appropriately. This function is called once at application startup.

#### 4.4.2. Mongoose Schema (`src/infrastructure/database/schemas/AnalyticsEvent.schema.ts`)
- **Purpose:** Maps the `AnalyticsEvent` domain model to a MongoDB collection.
- **Schema Definition:**
typescript
// src/infrastructure/database/schemas/AnalyticsEvent.schema.ts
import { Schema, model } from 'mongoose';

const analyticsEventSchema = new Schema({
  _id: { type: String, required: true }, // Using string UUIDs
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true, sparse: true }, // sparse index for nullable field
  eventName: { type: String, required: true, index: true },
  clientTimestamp: { type: Date, required: true },
  serverTimestamp: { type: Date, required: true, index: true },
  clientVersion: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  geo: {
    country: String,
    region: String,
    city: String,
  },
}, {
  timestamps: { createdAt: 'serverTimestamp', updatedAt: false }, // Reuse serverTimestamp as createdAt
  versionKey: false,
  _id: false,
});

// Compound index for common analytical queries
analyticsEventSchema.index({ eventName: 1, serverTimestamp: -1 });

export const AnalyticsEventModel = model('AnalyticsEvent', analyticsEventSchema);


#### 4.4.3. Mongo Repository Implementation (`src/infrastructure/repositories/MongoAnalyticsEvent.repository.ts`)
- **Purpose:** The concrete implementation of `IAnalyticsEventRepository`.
- **Class Definition:**
typescript
// src/infrastructure/repositories/MongoAnalyticsEvent.repository.ts (Conceptual)
export class MongoAnalyticsEventRepository implements IAnalyticsEventRepository {
  public async addBatch(events: AnalyticsEvent[]): Promise<void> {
    try {
      // Mongoose insertMany is highly optimized for bulk writes.
      await AnalyticsEventModel.insertMany(events, { ordered: false });
    } catch (error) {
      // Log the error. `ordered: false` ensures valid events in a failed batch are still inserted.
      console.error('Failed to insert event batch', error);
      // Depending on requirements, could push failed events to a dead-letter queue.
      throw new Error('Database insertion failed for one or more events.');
    }
  }
}


### 4.5. Presentation Layer

#### 4.5.1. Validation Middleware (`src/presentation/middleware/validator.middleware.ts`)
- **Purpose:** A generic Express middleware to validate request bodies against a Zod schema.
- **Implementation:** Creates a higher-order function that takes a Zod schema. The returned middleware function validates `req.body` against the schema. On failure, it calls `next()` with a formatted validation error. On success, it calls `next()`.

#### 4.5.2. Analytics Controller (`src/presentation/controllers/Analytics.controller.ts`)
- **Purpose:** To handle the HTTP logic for the ingestion endpoint.
- **Class Definition:**
typescript
// src/presentation/controllers/Analytics.controller.ts (Conceptual)
export class AnalyticsController {
  constructor(private readonly analyticsIngestionService: AnalyticsIngestionService) {}

  public ingestEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as IngestEventsDto;
      const metadata = {
        ipAddress: req.ip,
        userId: req.user?.id, // Assumes an auth middleware might attach a user object
        sessionId: req.headers['x-session-id'] as string,
      };

      // No await here for fire-and-forget. The service call is async, but we don't wait for it to complete.
      this.analyticsIngestionService.ingestEventBatch(dto, metadata);
      
      res.status(202).send();
    } catch (error) {
      next(error);
    }
  };
}


#### 4.5.3. Analytics Routes (`src/presentation/routes/analytics.routes.ts`)
- **Purpose:** To define the routing for the service.
- **Implementation:**
  - Creates an `express.Router()`.
  - Defines the route: `router.post('/', validationMiddleware(IngestEventsDtoSchema), analyticsController.ingestEvents)`.
  - Exports the configured router.

### 4.6. Application Entrypoint (`src/index.ts`)
- **Purpose:** To bootstrap and run the entire microservice.
- **Logic:**
  1.  Load `config`.
  2.  Initialize services and repositories (dependency injection).
  3.  Call `connectDB()`.
  4.  Create the Express app.
  5.  Apply global middleware: `helmet()`, `cors(options)`, `express.json()`, request logger (`pino-http`).
  6.  Mount the main API router: `app.use('/api/v1/analytics', analyticsRouter)`.
  7.  Add a 404 handler for unknown routes.
  8.  Add a global error handling middleware that logs the error and sends a standardized JSON response.
  9.  Start the server via `app.listen()`.

## 5. API Endpoint Specification

### POST `/api/v1/analytics/events`

- **Description:** Ingests a batch of analytics events.
- **Request Headers:**
  - `Content-Type: application/json`
  - `X-Session-ID: <string>` (Required) - A client-generated unique ID for the game session.
  - `Authorization: Bearer <token>` (Optional) - If the user is authenticated, allowing the backend to associate events with a `userId`.
- **Request Body:**
  json
  {
    "events": [
      {
        "eventName": "level_start",
        "clientTimestamp": "2023-10-27T10:00:00.123Z",
        "clientVersion": "1.0.3",
        "payload": {
          "levelId": "REQ-CGLE-003",
          "attemptNumber": 1
        }
      },
      {
        "eventName": "setting_changed",
        "clientTimestamp": "2023-10-27T10:01:15.456Z",
        "clientVersion": "1.0.3",
        "payload": {
          "settingName": "reducedMotion",
          "newValue": true
        }
      }
    ]
  }
  
- **Success Response:**
  - **Code:** `202 Accepted`
  - **Body:** Empty.
- **Error Responses:**
  - **Code:** `400 Bad Request` - If the request body fails validation (e.g., missing fields, wrong types).
  - **Code:** `500 Internal Server Error` - If an unexpected server-side error occurs.

## 6. Security & Logging

- **Security:**
  - **Transport:** All endpoints will be served over HTTPS (handled by the load balancer/ingress).
  - **Headers:** `helmet` will be used to set various security-related HTTP headers.
  - **CORS:** `cors` middleware will be configured to only allow requests from authorized client origins.
  - **Rate Limiting:** `express-rate-limit` will be applied to the ingestion endpoint to prevent abuse (e.g., 100 requests per minute per IP).
  - **Input Validation:** All incoming data will be strictly validated using `Zod` schemas.
- **Logging:**
  - **Library:** `pino` will be used for structured, performant JSON logging.
  - **Request Logging:** A middleware (`pino-http`) will log every incoming request and its response status code and latency.
  - **Application Logging:** Service-level and repository-level events, especially errors, will be logged with context.
  - **Log Levels:** `info` for successful operations, `warn` for non-critical issues, and `error` for exceptions. Logs will be written to `stdout` to be collected by the cloud platform's logging service (e.g., AWS CloudWatch).