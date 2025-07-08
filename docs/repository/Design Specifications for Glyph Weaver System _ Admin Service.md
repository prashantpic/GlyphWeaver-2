# Software Design Specification (SDS): Glyph Weaver System & Admin Service

## 1. Introduction

This document provides the detailed software design for the **Glyph Weaver System & Admin Service** (`REPO-GLYPH-SYSTEM`). This microservice is the administrative and operational core of the Glyph Weaver backend ecosystem.

Its primary responsibilities are:
1.  **Remote Game Configuration:** Providing a secure API for internal staff to manage live game settings (feature flags, event parameters, store items) without requiring new deployments.
2.  **Player Data Privacy Management:** Offering endpoints to orchestrate the fulfillment of player data subject rights requests (e.g., access, deletion) in compliance with privacy laws like GDPR and CCPA.
3.  **System Health Monitoring:** Exposing a consolidated health check endpoint that reports the status of this service and its critical downstream dependencies.
4.  **Auditing:** Creating a secure, tamper-evident log of all administrative actions performed through its API.

This service is built using Node.js, Express.js, and TypeScript, with MongoDB as its data store.

## 2. System Architecture

The service adheres to a clean, layered architecture to promote separation of concerns, testability, and maintainability.

-   **Presentation Layer:** Exposes RESTful API endpoints using Express.js. It is responsible for handling HTTP requests, performing initial validation, and delegating tasks to the Application Layer. It includes controllers and security middleware.
-   **Application Layer:** Contains the core use case logic. It orchestrates domain entities and repositories to fulfill application-specific tasks (e.g., "update a configuration," "process a data deletion request"). It is completely independent of the web framework.
-   **Domain Layer:** Represents the core business logic and rules of the service. It includes domain entities (`GameConfiguration`) and repository interfaces, forming the heart of the service's responsibilities.
-   **Infrastructure Layer:** Implements external-facing concerns. This includes the concrete implementation of repositories using Mongoose for MongoDB interaction and clients for communicating with other services.

**Key Design Patterns:**
*   **RESTful API:** For client-server and service-to-service communication.
*   **Dependency Injection (DI):** To decouple layers and components, facilitating testing and maintainability. Interfaces are injected into dependent classes.
*   **Repository Pattern:** To abstract data persistence logic from the application and domain layers.
*   **Domain-Driven Design (DDD) Principles:** The `GameConfiguration` is modeled as an Aggregate Root, responsible for its own state and invariants.

## 3. Domain Layer Design

This layer contains the business objects and their rules.

### 3.1. Entities

#### 3.1.1. `GameConfiguration` Entity (`src/domain/entities/game-configuration.entity.ts`)
Represents a single, versioned game configuration setting. It is the aggregate root for all configuration operations.

**Properties:**
-   `_id: string`: Unique identifier.
-   `key: string`: The unique, human-readable key for the configuration (e.g., `event_lunar_new_year_active`).
-   `value: any`: The configuration value, which can be of any type (boolean, string, number, object).
-   `version: number`: A version number that is incremented on every update to prevent race conditions.
-   `description: string`: A human-readable description of what the configuration does.
-   `updatedAt: Date`: Timestamp of the last update.
-   `lastUpdatedBy: string`: Identifier of the administrator or system that performed the last update.

**Methods:**
-   `constructor(props)`: Initializes a new `GameConfiguration` instance.
-   `updateValue(newValue: any, updatedBy: string): void`:
    -   Sets the new `value`.
    -   Increments the `version`.
    -   Updates `updatedAt` to the current time.
    -   Sets `lastUpdatedBy` to the provided actor ID.
-   `getValue(): any`: Returns the current `value`.

### 3.2. Repository Interfaces

#### 3.2.1. `IGameConfigurationRepository` (`src/domain/repositories/game-configuration.repository.ts`)
Defines the contract for data persistence of `GameConfiguration` entities.

**Methods:**
-   `findByKey(key: string): Promise<GameConfiguration | null>`: Retrieves a configuration entity by its unique key.
-   `findAll(): Promise<GameConfiguration[]>`: Retrieves all configuration entities.
-   `save(config: GameConfiguration): Promise<void>`: Persists a `GameConfiguration` entity. This handles both creation and updates.

#### 3.2.2. `IAuditLogRepository` (`src/domain/repositories/audit-log.repository.ts`)
Defines the contract for creating audit log entries.

**Methods:**
-   `create(logData: { eventType: string; actorId: string; details: any; status: 'success' | 'failure', ipAddress?: string }): Promise<void>`: Creates and persists a new audit log entry.

## 4. Application Layer Design

This layer orchestrates the domain layer to execute specific application use cases.

### 4.1. `ConfigurationService` (`src/application/services/configuration.service.ts`)
Handles all business logic related to managing game configurations.

**Dependencies (injected via constructor):**
-   `configRepo: IGameConfigurationRepository`
-   `auditRepo: IAuditLogRepository`

**Methods:**
-   `async getConfigurationByKey(key: string): Promise<any>`: Fetches a single configuration value by its key.
-   `async getAllConfigurations(): Promise<GameConfiguration[]>`: Fetches all game configurations.
-   `async updateConfiguration(key: string, newValue: any, actorId: string, ipAddress: string): Promise<void>`:
    1.  Fetch the `GameConfiguration` entity using `configRepo.findByKey(key)`.
    2.  If not found, throw a `NotFoundException`.
    3.  Create a details object for auditing containing the old value.
    4.  Call the entity's `config.updateValue(newValue, actorId)` method.
    5.  Save the updated entity using `configRepo.save(config)`.
    6.  Create a successful audit log entry using `auditRepo.create()` with `eventType: 'CONFIG_UPDATE'`, the actor's ID, IP address, and details including the key and the old/new values.
    7.  If any step fails, catch the error and create a failure audit log entry.

### 4.2. `PlayerDataRequestService` (`src/application/services/player-data-request.service.ts`)
Orchestrates the fulfillment of player data subject rights requests (e.g., GDPR/CCPA).

**Dependencies (injected via constructor):**
-   `auditRepo: IAuditLogRepository`
-   `playerServiceClient: IPlayerServiceClient` (An HTTP client for the Player microservice)

**Methods:**
-   `async processDataDeletionRequest(playerId: string, actorId: string, ipAddress: string): Promise<{ success: boolean; message: string }>`:
    1.  **This service does not delete data itself.** It orchestrates the action.
    2.  Make a secure, internal API call to the Player Service's deletion endpoint (e.g., `DELETE /internal/players/:playerId`).
    3.  On success, create a successful audit log using `auditRepo.create()` with `eventType: 'PLAYER_DATA_DELETE_REQUEST'`.
    4.  On failure, create a failure audit log and return an appropriate error message.
-   `async processDataAccessRequest(playerId: string, actorId: string, ipAddress: string): Promise<{ success:boolean; data: any }>`:
    1.  Make a secure, internal API call to the Player Service's data access endpoint (e.g., `GET /internal/players/:playerId/data-export`).
    2.  On success, create a successful audit log with `eventType: 'PLAYER_DATA_ACCESS_REQUEST'`. Return the fetched data.
    3.  On failure, create a failure audit log.

### 4.3. `SystemHealthService` (`src/application/services/system-health.service.ts`)
Consolidates the health status of this service and its critical dependencies.

**Dependencies:**
-   `mongoose.connection`: To check database connectivity.
-   `downstreamServices`: A configuration array of services to ping (e.g., `{ name: 'PlayerService', url: 'http://player-service/api/v1/health' }`).

**Methods:**
-   `async getSystemHealth(): Promise<SystemHealth>`:
    1.  Initialize a health report object.
    2.  Check the status of the local MongoDB connection. Add it to the report.
    3.  Concurrently, send `GET` requests to the health check endpoint of each configured downstream service.
    4.  Aggregate all results.
    5.  Determine the `overallStatus`: 'UP' if all checks pass, 'DEGRADED' if non-critical services fail, 'DOWN' if critical services (like DB) fail.
    6.  Return the final health report.

## 5. Infrastructure Layer Design

This layer provides concrete implementations of external-facing concerns.

### 5.1. Database (Mongoose)

#### 5.1.1. `GameConfigurationModel` (`src/infrastructure/database/mongoose/models/game-configuration.model.ts`)
**Mongoose Schema:**
-   `key: { type: String, required: true, unique: true, index: true }`
-   `value: { type: Schema.Types.Mixed, required: true }`
-   `version: { type: Number, required: true, default: 1 }`
-   `description: { type: String, required: false }`
-   `lastUpdatedBy: { type: String, required: true }`
-   `timestamps: true` (to automatically manage `createdAt` and `updatedAt`)

#### 5.1.2. `AuditLogModel` (`src/infrastructure/database/mongoose/models/audit-log.model.ts`)
**Mongoose Schema:**
-   `eventType: { type: String, required: true, index: true }`
-   `actorId: { type: String, required: true, index: true }`
-   `details: { type: Schema.Types.Mixed }`
-   `status: { type: String, required: true, enum: ['success', 'failure'] }`
-   `ipAddress: { type: String }`
-   `timestamp: { type: Date, default: Date.now, index: true }`
-   **Note:** This collection can be configured as a MongoDB Time Series collection for performance if log volume is high.

### 5.2. Repository Implementations

#### 5.2.1. `MongoGameConfigurationRepository` (`src/infrastructure/database/mongoose/repositories/game-configuration.repository.impl.ts`)
Implements `IGameConfigurationRepository` using the `GameConfigurationModel`.
-   `findByKey(key)`: Uses `GameConfigurationModel.findOne({ key })`.
-   `findAll()`: Uses `GameConfigurationModel.find()`.
-   `save(config)`: Uses `GameConfigurationModel.findOneAndUpdate({ key: config.key }, { ...configData }, { new: true, upsert: true })`. This handles both create and update atomically. A mapper function will convert the domain entity to a plain object for Mongoose.

#### 5.2.2. `MongoAuditLogRepository` (`src/infrastructure/database/mongoose/repositories/audit-log.repository.impl.ts`)
Implements `IAuditLogRepository` using the `AuditLogModel`.
-   `create(logData)`: Creates a new `AuditLogModel` instance and calls `.save()`.

## 6. Presentation Layer Design (REST API)

### 6.1. API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint                                | Controller              | Required Role        | Description                                                               |
| :----- | :-------------------------------------- | :---------------------- | :------------------- | :------------------------------------------------------------------------ |
| `GET`  | `/health`                               | `HealthController`      | `Public`             | Returns the consolidated health status of the backend systems.            |
| `GET`  | `/configs`                              | `ConfigurationController` | `ADMIN` or `SUPPORT` | Retrieves all game configuration settings.                                |
| `GET`  | `/configs/:key`                         | `ConfigurationController` | `ADMIN` or `SUPPORT` | Retrieves a single game configuration setting by its key.                 |
| `PUT`  | `/configs/:key`                         | `ConfigurationController` | `ADMIN`              | Updates a game configuration setting. The request body contains the new value. |
| `POST` | `/player-data/access-request`           | `PlayerDataController`  | `SUPPORT`            | Initiates a player data access request. Body: `{ "playerId": "..." }`.    |
| `POST` | `/player-data/delete-request`           | `PlayerDataController`  | `SUPPORT`            | Initiates a player data deletion request. Body: `{ "playerId": "..." }`.  |

### 6.2. Middleware (`src/presentation/http/middlewares/`)

#### 6.2.1. `auth.middleware.ts`
-   **`authenticate` function:**
    -   Extracts the JWT from the `Authorization: Bearer <token>` header.
    -   If no token is present, returns a `401 Unauthorized` error.
    -   Verifies the JWT using `jsonwebtoken.verify()` and the `JWT_SECRET`.
    -   On successful verification, decodes the payload (containing `userId` and `roles`) and attaches it to `req.user`.
    -   If verification fails, returns a `401 Unauthorized` error.
-   **`authorize(requiredRoles: string[])` function:**
    -   This is a middleware factory. It returns an Express `RequestHandler`.
    -   The returned handler checks if `req.user.roles` contains at least one of the roles in the `requiredRoles` array.
    -   If the user has a required role, it calls `next()`.
    -   If not, it returns a `403 Forbidden` error.

#### 6.2.2. Error Handling Middleware
A global error handler middleware will be the last middleware added to the Express app.
-   It will take 4 arguments: `(err, req, res, next)`.
-   It will log the error for debugging purposes.
-   It will inspect the error type. If it's a known application error (e.g., `NotFoundException`), it will send the corresponding status code.
-   Otherwise, it will default to a `500 Internal Server Error` response with a generic message to avoid leaking implementation details.

### 6.3. Routing
The `src/presentation/http/routes/index.ts` file will instantiate and configure routers for each controller, applying the authentication and authorization middleware as needed.

Example for configuration routes:
typescript
// src/presentation/http/routes/configuration.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { configurationController } from '../controllers'; // Assuming DI container provides this

const router = Router();

router.get('/', authenticate, authorize(['ADMIN', 'SUPPORT']), configurationController.getAll);
router.get('/:key', authenticate, authorize(['ADMIN', 'SUPPORT']), configurationController.getByKey);
router.put('/:key', authenticate, authorize(['ADMIN']), configurationController.update);

export default router;


## 7. Configuration and Environment

The service will be configured via environment variables, managed by `src/config/index.ts`.

**Required Environment Variables:**
-   `NODE_ENV`: `development`, `staging`, or `production`.
-   `PORT`: The port for the server to listen on (e.g., `3005`).
-   `DATABASE_URL`: The MongoDB connection string.
-   `JWT_SECRET`: A long, random string for signing JSON Web Tokens.
-   `CORS_ORIGIN`: The allowed origin for CORS requests (e.g., an admin panel URL).
-   `PLAYER_SERVICE_URL`: The base URL for the Player microservice.
-   `LEADERBOARD_SERVICE_URL`: The base URL for the Leaderboard microservice.
-   ... (and other downstream service health check URLs).

## 8. Core Dependencies (`package.json`)

-   **Production:** `express`, `mongoose`, `jsonwebtoken`, `dotenv`, `cors`, `helmet`, `axios` (for downstream calls).
-   **Development:** `typescript`, `ts-node`, `nodemon`, `@types/express`, `@types/node`, `@types/mongoose`, `@types/jsonwebtoken`, `jest`, `supertest`.