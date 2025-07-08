# Software Design Specification (SDS) for REPO-GLYPH-SYSTEM

## 1. Introduction

### 1.1. Purpose
This document provides a detailed software design specification for the **System API Endpoint** (`REPO-GLYPH-SYSTEM`). This microservice is a core part of the Glyph Weaver backend, responsible for providing system health status and managing dynamic game configurations. It exposes public endpoints for monitoring, client-facing endpoints for fetching configurations, and secure administrative endpoints for managing these configurations.

### 1.2. Scope
The scope of this document is limited to the `REPO-GLYPH-SYSTEM` repository. It covers the design of its RESTful API, services, data models, repositories, and configurations. It details the implementation of the following key features:
- **System Health Check:** An unauthenticated endpoint for monitoring tools (`REQ-8-007`, `REQ-AMOT-008`).
- **Remote Configuration Fetching:** An authenticated endpoint for the game client to retrieve dynamic game settings (`REQ-8-023`).
- **Remote Configuration Management:** Secure, role-based administrative endpoints to view and update game configurations (`REQ-AMOT-009`).

### 1.3. Technology Stack
- **Language:** TypeScript
- **Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Joi
- **Authentication:** JSON Web Tokens (JWT)
- **Environment:** Docker (for containerization)

---

## 2. System Architecture & Design Patterns

The service will be built following a **Layered Architecture** to ensure separation of concerns, maintainability, and testability.

- **Presentation Layer (`controllers`, `routes`, `validation`, `dtos`):** Handles HTTP requests, input validation, and response formatting. It is the entry point to the API.
- **Application Services Layer (`services`):** Orchestrates business logic, coordinates data access, and interacts with other services or repositories.
- **Data Access Layer (`repositories`, `models`):** Manages all communication with the MongoDB database, abstracting data persistence logic.

Key design patterns to be used:
- **Repository Pattern:** To decouple the application services from the underlying data source (MongoDB).
- **Service Layer Pattern:** To encapsulate use-case-specific business logic.
- **Dependency Injection (DI):** Services and repositories will be designed to receive their dependencies (e.g., via constructors), facilitating loose coupling and easier testing with mocks.
- **Middleware (Express.js):** Used extensively for cross-cutting concerns like authentication, authorization, validation, and error handling.

---

## 3. High-Level Component Diagram

mermaid
graph TD
    subgraph Client/Admin
        A[Game Client]
        B[Monitoring Tool]
        C[Admin Panel]
    end

    subgraph REPO-GLYPH-SYSTEM
        subgraph Presentation
            D[Routes]
            E[Controllers]
            F[Middleware]
        end

        subgraph Application
            G[Services]
        end

        subgraph Data
            H[Repositories]
            I[Models]
        end
    end

    subgraph External
        J[MongoDB Database]
        K[Audit Log Service]
    end

    A -- "GET /api/v1/system/config (JWT Auth)" --> D
    B -- "GET /api/v1/system/health" --> D
    C -- "GET/PUT /api/v1/admin/config (JWT & Admin Auth)" --> D
    
    D --> E
    E --> G
    D -- "Uses" --> F
    
    G -- "Uses" --> H
    G -- "Calls" --> K

    H -- "Uses" --> I
    I -- "Maps to" --> J



---

## 4. Detailed Component Specification

### 4.1. Configuration (`src/config/`)

#### 4.1.1. `src/config/index.ts`
- **Purpose:** To load and provide type-safe access to all environment variables.
- **Implementation:**
    - Use the `dotenv` library to load variables from a `.env` file in development.
    - Export a single, frozen `config` object.
    - Validate that all required environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`) are present at startup and throw an error if any are missing.
- **Exported `config` Object:**
    typescript
    interface AppConfig {
        port: number;
        mongoUri: string;
        jwtSecret: string;
        nodeEnv: 'development' | 'production' | 'test';
    }
    

### 4.2. Data Layer (`src/models/`, `src/repositories/`)

#### 4.2.1. `src/models/game-config.model.ts`
- **Purpose:** Defines the Mongoose schema and model for storing game configurations.
- **Schema `GameConfigurationSchema`:**
    - `key`: `String`, `required: true`, `unique: true`, `trim: true`, `index: true`. The unique identifier for the config (e.g., 'featureFlags', 'eventSettings').
    - `value`: `mongoose.Schema.Types.Mixed`, `required: true`. A flexible field to store any JSON object.
    - `lastUpdatedBy`: `String`, `required: false`. Identifier of the admin who last updated this config.
    - `timestamps`: `true`. Automatically adds `createdAt` and `updatedAt` fields.
- **Interface `IGameConfig`:**
    typescript
    import { Document } from 'mongoose';
    
    export interface IGameConfig extends Document {
        key: string;
        value: any;
        lastUpdatedBy?: string;
        createdAt: Date;
        updatedAt: Date;
    }
    
- **Export:** The compiled Mongoose model: `export default mongoose.model<IGameConfig>('GameConfiguration', GameConfigurationSchema);`

#### 4.2.2. `src/repositories/interfaces/igame.config.repository.ts`
- **Purpose:** Defines the contract for game configuration data access.
- **Interface `IGameConfigRepository`:**
    typescript
    import { IGameConfig } from '../../models/game-config.model';

    export interface IGameConfigRepository {
        findByKey(key: string): Promise<IGameConfig | null>;
        findAll(): Promise<IGameConfig[]>;
        update(key: string, value: any, updatedBy: string): Promise<IGameConfig | null>;
    }
    

#### 4.2.3. `src/repositories/game.config.repository.ts`
- **Purpose:** Implements the `IGameConfigRepository` using Mongoose.
- **Class `GameConfigRepository`:**
    - Implements `IGameConfigRepository`.
    - **`findByKey(key)`:** Use `GameConfigModel.findOne({ key })`.
    - **`findAll()`:** Use `GameConfigModel.find({})`.
    - **`update(key, value, updatedBy)`:** Use `GameConfigModel.findOneAndUpdate({ key }, { value, lastUpdatedBy: updatedBy }, { new: true, runValidators: true })`.

### 4.3. Application Services Layer (`src/services/`)

#### 4.3.1. `src/services/interfaces/iaudit.logging.service.ts`
- **Purpose:** To define the contract for a dependency that will be provided by another service/repository. This service is responsible for logging administrative actions.
- **Interface `IAuditLoggingService`:**
    typescript
    export interface IAuditLoggingService {
        logAdminAction(data: {
            actorId: string;
            action: 'CONFIG_UPDATE' | 'OTHER_ADMIN_ACTION';
            target: { type: 'config'; id: string };
            details?: any;
        }): Promise<void>;
    }
    
- **Note:** The concrete implementation of this interface resides outside this repository but will be injected into `ConfigurationService`.

#### 4.3.2. `src/services/configuration.service.ts`
- **Purpose:** Encapsulates all business logic for system health and configurations.
- **Class `ConfigurationService`:**
    - **Constructor:**
        typescript
        constructor(
            private readonly gameConfigRepository: IGameConfigRepository,
            private readonly auditLogService: IAuditLoggingService
        ) {}
        
    - **Method `getSystemHealth()`:**
        - Check `mongoose.connection.readyState`.
        - `1` means connected.
        - Return `{ status: 'ok', timestamp: new Date().toISOString(), checks: { database: 'connected' } }`.
        - If not connected, return `{ status: 'error', ... }`.
    - **Method `getLiveConfiguration()`:**
        - Call `this.gameConfigRepository.findAll()`.
        - Transform the returned array of documents into a single key-value object: `{ [config.key]: config.value, ... }`.
        - This provides a clean, flat object for the game client.
    - **Method `getAllConfigurations()`:**
        - Call and return the result of `this.gameConfigRepository.findAll()`. This is for the admin panel which may need more metadata.
    - **Method `updateConfiguration(key, value, adminId)`:**
        - Fetch the existing configuration using `this.gameConfigRepository.findByKey(key)` to get the old value for auditing.
        - If it doesn't exist, throw a `NotFound` error.
        - Call `this.gameConfigRepository.update(key, value, adminId)`.
        - If update is successful, call `this.auditLogService.logAdminAction()` with all required details, including the old and new values in the `details` object.
        - Return the updated configuration document.

### 4.4. Presentation Layer (`src/dtos/`, `src/validation/`, `src/controllers/`, `src/routes/`)

#### 4.4.1. `src/dtos/update-config.dto.ts`
- **Purpose:** Defines the API contract for the update request body.
- **Class `UpdateConfigDto`:**
    typescript
    import { IsObject } from 'class-validator'; // or just use a simple interface

    export class UpdateConfigDto {
        @IsObject()
        value: object;
    }
    

#### 4.4.2. `src/validation/config.validation.ts`
- **Purpose:** Defines Joi schemas for request validation.
- **Exported const `updateConfigSchema`:**
    typescript
    import Joi from 'joi';
    
    export const updateConfigSchema = Joi.object({
        value: Joi.object().required()
    });
    

#### 4.4.3. `src/controllers/system.controller.ts`
- **Purpose:** Handles public-facing system requests.
- **Class `SystemController`:**
    - **Constructor:** Injects `ConfigurationService`.
    - **`getHealth(req, res, next)`:** Calls `service.getSystemHealth()` and sends a `200 OK` response with the result. Uses a try-catch to pass errors to `next()`.
    - **`getConfig(req, res, next)`:** Calls `service.getLiveConfiguration()` and sends a `200 OK` response.

#### 4.4.4. `src/controllers/admin.config.controller.ts`
- **Purpose:** Handles secure administrative requests.
- **Class `AdminConfigController`:**
    - **Constructor:** Injects `ConfigurationService`.
    - **`getAll(req, res, next)`:** Calls `service.getAllConfigurations()` and sends a `200 OK` response.
    - **`update(req, res, next)`:**
        - Extracts `key` from `req.params`.
        - Extracts `value` from `req.body`.
        - Extracts admin user ID from `req.user.id` (which will be populated by auth middleware).
        - Calls `service.updateConfiguration(key, value, adminId)`.
        - Sends a `200 OK` response with the updated configuration.

#### 4.4.5. Routes (`src/routes/`)
- **`system.routes.ts`:**
    - `router.get('/health', systemController.getHealth)`
    - `router.get('/config', authMiddleware, systemController.getConfig)`
    - **Note:** `authMiddleware` will be a shared middleware to verify a valid JWT.
- **`admin.config.routes.ts`:**
    - `router.get('/', adminConfigController.getAll)`
    - `router.put('/:key', validationMiddleware(updateConfigSchema), adminConfigController.update)`
    - The entire router will be protected by `authMiddleware` and `adminRoleMiddleware` in the main router file.
- **`index.ts` (Aggregator):**
    - `router.use('/system', systemRoutes)`
    - `router.use('/admin/config', authMiddleware, adminRoleMiddleware, adminConfigRoutes)`

### 4.5. Application Core (`src/app.ts`, `src/server.ts`)

#### 4.5.1. `src/app.ts`
- **Purpose:** Bootstrap and configure the Express application.
- **Implementation:**
    1.  Create `express()` app instance.
    2.  Use `cors()`.
    3.  Use `express.json()`.
    4.  Use a request logging middleware (e.g., `morgan` in dev).
    5.  Mount the main router from `src/routes` at `/api/v1`.
    6.  Add a 404 handler for unmatched routes.
    7.  Add a global error handler middleware that standardizes error responses.

#### 4.5.2. `src/server.ts`
- **Purpose:** Application entry point.
- **Implementation:**
    1.  Load config from `src/config`.
    2.  Define a `startServer` async function.
    3.  Inside `startServer`, connect to MongoDB using `mongoose.connect(config.mongoUri)`.
    4.  On successful connection, start the server using `app.listen(config.port)`. Log a success message.
    5.  Handle Mongoose connection errors and `process.exit(1)` on failure.
    6.  Call `startServer()`.

---

## 5. Testing Strategy

- **Unit Tests (Jest):**
    - **Services:** Test business logic in `ConfigurationService` by mocking the `IGameConfigRepository` and `IAuditLoggingService`.
    - **Repositories:** Can be tested with an in-memory MongoDB instance (`mongodb-memory-server`) to verify Mongoose queries.
    - **Controllers:** Test controller logic by mocking the service layer and `req`/`res` objects.
- **Integration Tests (Jest + Supertest):**
    - Test the full request-response cycle for each endpoint, including middleware (validation, auth).
    - Requires a running test database.
- **Scripts in `package.json`:**
    - `test`: Runs all unit and integration tests.
    - `test:unit`: Runs only unit tests.
    - `test:integration`: Runs only integration tests.
    - `test:coverage`: Runs tests and generates a coverage report.

This detailed specification provides a clear blueprint for generating the code for the `REPO-GLYPH-SYSTEM`, ensuring all requirements are met and the architecture is sound.