# Software Design Specification (SDS): Glyph Weaver Player Data Service

## 1. Introduction

This document provides the detailed software design specification for the **Glyph Weaver Player Data Service** (`REPO-GLYPH-PLAYER`). This microservice is the authoritative source for all player-related data, including profiles, progression, inventory, settings, and achievements. It is built using TypeScript on a Node.js/Express.js stack with MongoDB as the data store.

The design follows a layered architecture combined with Domain-Driven Design (DDD) principles to ensure a clear separation of concerns, maintainability, and scalability.

**Key Responsibilities:**
- Manage player profiles and settings (including accessibility options).
- Track detailed level-by-level progression (scores, stars, attempts).
- Maintain server-authoritative inventory for virtual currency and consumables.
- Orchestrate cloud save data synchronization and conflict resolution.
- Fulfill data privacy requests (access, deletion) in compliance with GDPR/CCPA.

---

## 2. Architecture Overview

The service is structured into four primary layers, promoting separation of concerns and testability.

-   **Presentation Layer:** Exposes the service's functionality via a RESTful API. It is responsible for handling HTTP requests, routing, input validation, and formatting responses.
-   **Application Layer:** Orchestrates use cases by coordinating the domain layer and infrastructure. It contains the application-specific business logic without being coupled to the core domain rules.
-   **Domain Layer:** The heart of the service. It contains the business models (Aggregates, Entities, Value Objects), core business rules, and repository interfaces. It is completely independent of other layers.
-   **Infrastructure Layer:** Implements external-facing concerns like database access, communication with other services, and connection management. It provides concrete implementations of the repository interfaces defined in the domain layer.

**Design Patterns:**
-   **Domain-Driven Design (DDD):** The design is centered around the `PlayerProfile` aggregate, which encapsulates a significant portion of the business logic.
-   **Layered Architecture:** Enforces separation of concerns.
-   **Repository Pattern:** Decouples the domain and application layers from the persistence mechanism (MongoDB).
-   **Dependency Injection:** Services and repositories will be injected into their dependents (e.g., controllers, other services) to promote loose coupling. This will be managed via constructor injection.

---

## 3. Configuration and Environment

### 3.1. `src/config/index.ts`
-   **Purpose:** To provide a single, type-safe, and centralized source for all application configuration loaded from environment variables.
-   **Logic:**
    -   Utilizes the `dotenv` library to load environment variables from a `.env` file during development.
    -   Exports a typed, frozen `config` object.
    -   The module should throw an error on startup if any required environment variables are missing.
-   **Required Environment Variables:**
    -   `PORT`: The port for the Express server to listen on (e.g., `3001`).
    -   `NODE_ENV`: The application environment (e.g., `development`, `production`, `test`).
    -   `MONGODB_URI`: The connection string for the MongoDB database.
    -   `JWT_SECRET`: A secret key for validating JWTs from an authentication service.
    -   `CORS_ORIGIN`: The allowed origin for CORS requests (e.g., `http://localhost:3000`).

---

## 4. Domain Layer

This layer contains the core business logic and models.

### 4.1. `PlayerProfile` Aggregate (`src/domain/aggregates/player-profile.aggregate.ts`)
The `PlayerProfile` is the aggregate root. All access and modification of related entities (Inventory, LevelProgress) must go through this aggregate to ensure business invariants are maintained.

-   **Properties:**
    -   `id: string`: Unique identifier.
    -   `username: string`: Player's chosen alias.
    -   `platformIds: { platform: string, id: string }[]`: Array of linked platform-specific IDs.
    -   `settings: UserSettings`: The player's preferences (Value Object).
    -   `inventory: Inventory`: The player's items and currency (Entity).
    -   `levelProgress: Map<string, LevelProgress>`: A map of `levelId` to `LevelProgress` entities.
    -   `createdAt: Date`, `updatedAt: Date`.
-   **Methods:**
    -   `static create(dto: CreatePlayerDto): PlayerProfile`: Factory method to create a new player profile with default settings and inventory.
    -   `updateSettings(newSettings: UserSettings): void`: Replaces the current settings object with a new one.
    -   `updateLevelProgress(progressData: UpdateProgressDto): void`:
        -   Finds or creates a `LevelProgress` entity for the given `levelId`.
        -   Calls the `update` method on the `LevelProgress` entity.
        -   Enforces any aggregate-level rules related to progression.
    -   `creditCurrency(amount: number, currencyType: string): void`: Delegates to `inventory.credit()`.
    -   `debitCurrency(amount: number, currencyType: string): void`: Delegates to `inventory.debit()`, which enforces non-negative balance.
    -   `creditConsumable(itemKey: string, quantity: number): void`: Delegates to `inventory.credit()`.
    -   `debitConsumable(itemKey: string, quantity: number): void`: Delegates to `inventory.debit()`.
    -   `resolveSaveConflict(clientData: PlayerProfileSnapshot): PlayerProfile`: Implements `REQ-PDP-006`.
        -   Compares `updatedAt` timestamps. The most recent version wins.
        -   If timestamps are too close (e.g., < 5 seconds), it should trigger a more complex merge or flag for user-prompt. For the initial implementation, latest timestamp wins.
        -   Returns the resolved `PlayerProfile` instance.

### 4.2. `Inventory` Entity (`src/domain/entities/inventory.entity.ts`)
-   **Properties:**
    -   `balances: Map<string, number>`: A map of item/currency keys (e.g., 'glyphOrbs', 'hints') to their quantities.
-   **Methods:**
    -   `credit(key: string, amount: number): void`: Increases the balance of a given item/currency.
    -   `debit(key: string, amount: number): void`: Decreases the balance. Throws a `DomainException` if the resulting balance would be negative.

### 4.3. `LevelProgress` Entity (`src/domain/entities/level-progress.entity.ts`)
-   **Properties:**
    -   `levelId: string`: Identifier for the level.
    -   `bestScore: number`.
    -   `starsEarned: number`.
    -   `completionTime: number` (in seconds).
    -   `attempts: number`.
-   **Methods:**
    -   `update(dto: UpdateProgressDto): void`:
        -   Increments `attempts`.
        -   If `dto.score > this.bestScore`, update `bestScore`, `starsEarned`, `completionTime`.

### 4.4. `UserSettings` Value Object (`src/domain/value-objects/user-settings.value-object.ts`)
-   **Properties (all `readonly`):** `musicVolume`, `sfxVolume`, `colorblindMode`, `textSize`, `reducedMotion`, etc. as per `REQ-ACC-010`.
-   **Logic:** This class is immutable. A new instance is created for any change. It includes an `equals()` method for value-based comparison.

### 4.5. `IPlayerProfileRepository` Interface (`src/domain/repositories/iplayer-profile.repository.ts`)
-   **Purpose:** Defines the contract for persistence, decoupling the domain from MongoDB.
-   **Methods:**
    -   `findById(id: string): Promise<PlayerProfile | null>`
    -   `findByPlatformId(platform: string, id: string): Promise<PlayerProfile | null>`
    -   `save(playerProfile: PlayerProfile): Promise<void>`
    -   `delete(id: string): Promise<boolean>` (Returns true if deleted).

---

## 5. Infrastructure Layer

This layer contains concrete implementations for data persistence.

### 5.1. Database Connection (`src/infrastructure/database/mongo.connection.ts`)
-   **Purpose:** Manages the Mongoose connection lifecycle.
-   **Logic:**
    -   Exports a `connectDB` async function that uses `mongoose.connect()` with the URI from the config.
    -   Sets up listeners for `connected`, `error`, and `disconnected` events, logging them appropriately.
    -   Exports a `disconnectDB` function for graceful shutdown.

### 5.2. Mongoose Model (`src/infrastructure/models/player-profile.model.ts`)
-   **Purpose:** Defines the data structure for the `playerprofiles` collection in MongoDB.
-   **Schema Definition (`PlayerProfileSchema`):**
    -   Will use sub-schemas for `UserSettings`, `Inventory` (as a flexible Map), and `LevelProgress` (as a Map).
    -   `username: { type: String, required: true, unique: true }`
    -   `platformIds: [{ platform: String, id: String }]` (with an index)
    -   `levelProgress: { type: Map, of: LevelProgressSchema }`
    -   `inventory: { type: Map, of: Number, default: {} }`
    -   `settings: UserSettingsSchema`
    -   `isDeleted: { type: Boolean, default: false, index: true }`
    -   Includes `timestamps: true` option.
    -   Exports the compiled Mongoose model: `export const PlayerProfileModel = mongoose.model('PlayerProfile', PlayerProfileSchema);`

### 5.3. Repository Implementation (`src/infrastructure/repositories/player-profile.repository.ts`)
-   **Purpose:** Implements `IPlayerProfileRepository` using Mongoose.
-   **Logic:**
    -   Injects the `PlayerProfileModel`.
    -   `findById`: Uses `PlayerProfileModel.findById()`. If a document is found, it must be mapped from the plain JS object to a `PlayerProfile` domain aggregate instance (a "hydration" process).
    -   `save`: Maps the `PlayerProfile` aggregate instance to a plain JS object suitable for Mongoose (`toPersistence` method on the aggregate). Uses `PlayerProfileModel.findByIdAndUpdate()` with `{ upsert: true, new: true }`.
    -   `delete`: Implements a soft delete by setting `isDeleted: true` on the document.

---

## 6. Application Layer

This layer contains the use case orchestrators (services).

### 6.1. `PlayerService` (`src/application/services/player.service.ts`)
-   **Dependencies:** `IPlayerProfileRepository`.
-   **Methods:**
    -   `getPlayerProfile(playerId: string): Promise<PlayerProfileDto>`: Fetches the aggregate via repository and maps it to a DTO.
    -   `updatePlayerSettings(playerId: string, settingsDto: UserSettingsDto): Promise<void>`:
        1.  Fetches `PlayerProfile` aggregate.
        2.  Creates a new `UserSettings` value object from the DTO.
        3.  Calls `playerProfile.updateSettings(newSettings)`.
        4.  Calls `repository.save(playerProfile)`.
    -   `updatePlayerProgress(playerId: string, progressDto: UpdateProgressDto): Promise<LevelProgressDto>`: Similar flow to above, calling the aggregate's `updateLevelProgress` method.

### 6.2. `CloudSaveService` (`src/application/services/cloud-save.service.ts`)
-   **Dependencies:** `IPlayerProfileRepository`.
-   **Methods:**
    -   `synchronize(playerId: string, clientSnapshot: PlayerProfileSnapshot): Promise<SyncResultDto>`:
        1.  Fetches the current server-side `PlayerProfile` aggregate.
        2.  Calls `playerProfile.resolveSaveConflict(clientSnapshot)` to get the resolved state.
        3.  Saves the resolved `PlayerProfile` back to the repository.
        4.  Returns a `SyncResultDto` containing the fully resolved player data for the client to adopt.

### 6.3. `PrivacyService` (`src/application/services/privacy.service.ts`)
-   **Dependencies:** `IPlayerProfileRepository`.
-   **Methods:**
    -   `exportData(playerId: string): Promise<PlayerProfileDto>` (`REQ-SEC-012`):
        1.  Fetches the `PlayerProfile` aggregate.
        2.  Maps it to a comprehensive DTO containing all associated data.
        3.  Returns the DTO.
    -   `deleteData(playerId: string): Promise<void>` (`REQ-SEC-012`):
        1.  Fetches the `PlayerProfile` aggregate to ensure it exists.
        2.  Calls `repository.delete(playerId)`.
        3.  Logs the deletion action for auditing purposes.

---

## 7. Presentation Layer (API Endpoints)

### 7.1. General
-   **Base Path:** `/api/v1`
-   **Authentication:** All endpoints will be protected by a JWT authentication middleware that verifies the token and attaches `req.user = { id: '...' }` to the request object.

### 7.2. Player Routes (`/players`)
-   **File:** `src/presentation/routes/player.routes.ts`
-   **Controller:** `src/presentation/controllers/player.controller.ts`

| Method | Path                               | Description                                     | Request Body DTO      | Success Response       |
| :----- | :--------------------------------- | :---------------------------------------------- | :-------------------- | :--------------------- |
| `GET`  | `/:playerId/profile`               | Get a player's full profile data.               | N/A                   | `200 OK` `PlayerProfileDto` |
| `PUT`  | `/:playerId/settings`              | Update a player's settings.                     | `UserSettingsDto`     | `204 No Content`       |
| `POST` | `/:playerId/progress`              | Submit progress for a completed level.          | `UpdateProgressDto`   | `200 OK` `LevelProgressDto` |
| `POST` | `/:playerId/inventory/debit`       | Spend a consumable or virtual currency.         | `InventoryDebitDto`   | `204 No Content`       |
| `POST` | `/:playerId/sync`                  | Synchronize client data with the server.        | `PlayerProfileSnapshot`| `200 OK` `SyncResultDto` |

### 7.3. Privacy Routes (`/privacy`)
-   **File:** `src/presentation/routes/privacy.routes.ts`
-   **Controller:** `src/presentation/controllers/privacy.controller.ts`

| Method | Path       | Description                                  | Request Body DTO | Success Response     |
| :----- | :--------- | :------------------------------------------- | :--------------- | :------------------- |
| `POST` | `/export`  | Request an export of the user's data.        | N/A              | `200 OK` `PlayerProfileDto` |
| `DELETE`| `/delete`  | Request deletion of the user's account/data. | N/A              | `204 No Content`     |

---

## 8. Data Transfer Objects (DTOs)

DTOs will be defined as TypeScript interfaces or classes in the `src/application/dtos/` directory.

-   `PlayerProfileDto`: Represents the full player state sent to the client.
-   `UserSettingsDto`: Subset of `UserSettings` for update requests.
-   `UpdateProgressDto`: Contains `levelId`, `score`, `starsEarned`, `completionTime`.
-   `InventoryDebitDto`: Contains `itemKey` and `quantity`.
-   `SyncResultDto`: Contains the fully resolved `PlayerProfileDto` after a sync operation.

---

## 9. Cross-Cutting Concerns

### 9.1. Error Handling
-   A global error handling middleware will be the last middleware added to the Express app in `server.ts`.
-   It will catch errors passed via `next(error)`.
-   It will check the error type (`instanceof`) to set the appropriate HTTP status code.
-   **Custom Errors:**
    -   `DomainException`: For business rule violations (400 Bad Request).
    -   `NotFoundException`: For resources not found (404 Not Found).
    -   `ValidationException`: For invalid input DTOs (422 Unprocessable Entity).
    -   `UnauthorizedException`: For auth failures (401 Unauthorized).
-   The response format will be `{ "statusCode": number, "message": string, "details"?: any }`.

### 9.2. Logging
-   A logger instance (e.g., Winston) will be configured and used throughout the application, especially in services and controllers, to log key events, errors, and debug information.
-   Request/response logging middleware can be added for debugging in development.

---

## 10. Testing Strategy

-   **Unit Tests (`*.spec.ts`):**
    -   Focus on the Domain Layer (Aggregates, Entities) to test business logic in isolation.
    -   Test Application Layer services by mocking the repository interfaces (`jest.mock`).
-   **Integration Tests (`*.test.ts`):**
    -   Test API endpoints using `supertest`.
    -   These tests will run against an in-memory MongoDB instance (`mongodb-memory-server`) to test the full flow from controller to database without external dependencies.
    -   Focus on verifying request validation, correct service orchestration, and response formatting.