# Glyph Weaver - Software Design Specification
## Repository: REPO-GLYPH-LEADERBOARD

---

### 1. Introduction

This document outlines the software design for the **Leaderboard API Endpoint** of the Glyph Weaver backend system. This service is responsible for all operations related to player leaderboards, including score submission, validation against cheating, and retrieval of ranked data. It is designed to be performant, scalable, and secure, utilizing caching for frequently accessed data and robust server-side validation.

**Key Features:**
-   Submission of player scores for specific levels or events.
-   Server-side validation and cheat detection.
-   Retrieval of global and event-based leaderboards.
-   Retrieval of player-specific rank views.
-   Caching mechanism for high-performance reads.
-   Comprehensive audit logging for all critical operations.

---

### 2. System Architecture

The Leaderboard API follows a **Layered Architecture** to ensure a clear separation of concerns, maintainability, and testability.

-   **Presentation Layer (`leaderboard.routes.ts`, `leaderboard.controller.ts`, DTOs, Validators):** Responsible for handling HTTP requests and responses. It defines the API contract, validates incoming data, and routes requests to the Application Layer. It is completely unaware of the business logic details.
-   **Application Services Layer (`*.service.ts`):** Contains the core application logic. It orchestrates the business use cases by coordinating domain logic, repositories, and other services. It's the entry point for all business operations like submitting a score or fetching a leaderboard.
-   **Data Access Layer (`*.repository.ts`, `*.model.ts`):** Manages all data persistence operations. It abstracts the MongoDB database interactions using the Repository Pattern, providing a clean, domain-focused interface to the Application Layer.
-   **Infrastructure Layer (`cache.provider.ts`):** Handles external concerns and integrations, most notably the Redis caching provider.

**Design Patterns:**
-   **Dependency Injection (DI):** Used throughout the application to decouple components. Services and controllers will depend on interfaces (`ILeaderboardService`, `IScoreRepository`, etc.) rather than concrete implementations, allowing for easy mocking and testing.
-   **Repository Pattern:** Abstracts the data store, centralizing data access logic and decoupling the application services from MongoDB-specific implementation details.
-   **Service Layer Pattern:** Encapsulates the core business logic for each use case, providing a clear boundary for the application's operations.

---

### 3. API Endpoint Definitions

All endpoints are prefixed with `/api/v1/leaderboards`. Authentication is required for all endpoints and will be handled by a JWT authentication middleware that attaches a `user` object (containing `userId`) to the `Request` object.

File: `leaderboard.routes.ts`

| Method | Endpoint                                  | Middleware                                     | Controller Method         | Description                                                                                                                                                                                                                                     |
| :----- | :---------------------------------------- | :--------------------------------------------- | :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/:leaderboardKey`                        | `jwtAuth`                                      | `getLeaderboard`          | Retrieves a paginated view of a leaderboard. Supports `limit` and `offset` query parameters.                                                                                                                                                    |
| `POST` | `/:leaderboardKey/scores`                 | `jwtAuth`, `validate(submitScoreSchema)`       | `submitScore`             | Submits a player's score for the specified leaderboard. The player ID is extracted from the JWT token. The request body is validated against the `submitScoreSchema`.                                                                            |
| `GET`  | `/:leaderboardKey/rank/me`                | `jwtAuth`                                      | `getPlayerRank`           | Retrieves the authenticated player's specific rank and score for a given leaderboard, along with a small number of their neighbors (e.g., 2 above, 2 below).                                                                                         |
| `POST` | `/admin/players/:userId/exclude`          | `jwtAuth`, `adminOnly`                         | `excludePlayer`           | **Admin-only endpoint.** Excludes a player from all leaderboards. This is a punitive action for verified cheating. The `adminOnly` middleware will verify the JWT token has an 'admin' role.                                                              |

---

### 4. Component Design

#### 4.1. Presentation Layer

##### 4.1.1. `controllers/leaderboard.controller.ts`

**Purpose:** To handle the HTTP request/response cycle for leaderboard operations, delegating business logic to the `LeaderboardService`.

**Class: `LeaderboardController`**
-   **Dependencies:** `ILeaderboardService` (injected via constructor).
-   **Methods:**
    -   `public async getLeaderboard(req, res, next)`:
        1.  Extract `leaderboardKey` from `req.params`.
        2.  Extract `limit` (default: 50) and `offset` (default: 0) from `req.query`, parsing them as integers.
        3.  Call `this.leaderboardService.getLeaderboardView(leaderboardKey, { limit, offset })`.
        4.  Send the returned DTO as a 200 OK JSON response.
        5.  Wrap logic in a try/catch block, passing errors to `next`.
    -   `public async submitScore(req, res, next)`:
        1.  Extract `leaderboardKey` from `req.params`.
        2.  Extract `userId` from `req.user` (populated by JWT middleware).
        3.  Extract `submission: SubmitScoreDto` from `req.body`.
        4.  Call `this.leaderboardService.processScoreSubmission(leaderboardKey, userId, submission)`.
        5.  Send the returned rank object as a 201 Created JSON response.
        6.  Wrap in try/catch.
    -   `public async getPlayerRank(req, res, next)`:
        1.  Extract `leaderboardKey` from `req.params`.
        2.  Extract `userId` from `req.user`.
        3.  Call `this.leaderboardService.getPlayerRankView(leaderboardKey, userId)`.
        4.  Send the returned DTO as a 200 OK JSON response.
        5.  Wrap in try/catch.
    -   `public async excludePlayer(req, res, next)`:
        1.  Extract `userId` to exclude from `req.params`.
        2.  Call `this.leaderboardService.excludePlayerFromLeaderboards(userId)`.
        3.  Send a 204 No Content response on success.
        4.  Wrap in try/catch.

##### 4.1.2. `validation/leaderboard.validator.ts`

**Purpose:** To define request validation schemas using Joi.

**Schema: `submitScoreSchema`**
-   Uses `Joi.object()` to define the schema.
-   `score`: `Joi.number().integer().min(0).required()`
-   `completionTime`: `Joi.number().integer().min(0).required()`
-   `moves`: `Joi.number().integer().min(1).required()`
-   `validationHash`: `Joi.string().hex().length(64).required()` (Assuming SHA-256)

#### 4.2. Application Services Layer

##### 4.2.1. `services/leaderboard.service.ts`

**Purpose:** To orchestrate all leaderboard business logic.

**Class: `LeaderboardService` implements `ILeaderboardService`**
-   **Dependencies:** `IScoreRepository`, `ILeaderboardRepository`, `IPlayerRepository`, `ICheatDetectionService`, `ICacheProvider`, `IAuditService`.
-   **Methods:**
    -   `public async getLeaderboardView(leaderboardKey, options)`:
        1.  Generate a cache key, e.g., `leaderboard:${leaderboardKey}:l:${options.limit}:o:${options.offset}`.
        2.  Attempt to `this.cacheProvider.get(cacheKey)`. If found, parse and return the cached DTO.
        3.  If cache miss:
            a. Fetch leaderboard definition: `const leaderboard = await this.leaderboardRepository.findByKeyName(leaderboardKey)`. If not found, throw `NotFoundException`.
            b. Fetch scores: `const scores = await this.scoreRepository.findByLeaderboard(leaderboard._id, options, leaderboard.tieBreakingFields)`.
            c. Fetch player IDs from scores: `const playerIds = scores.map(s => s.userId)`.
            d. Fetch player info: `const players = await this.playerRepository.findManyByIds(playerIds)`.
            e. Construct `LeaderboardEntryDto[]` by mapping scores and enriching with player info.
            f. Construct `LeaderboardViewDto`.
            g. `await this.cacheProvider.set(cacheKey, JSON.stringify(dto), 300)` (5-minute TTL).
            h. Return the DTO.
    -   `public async processScoreSubmission(leaderboardKey, userId, submission)`:
        1.  Fetch `leaderboard` definition from `leaderboardRepository`.
        2.  Check if the score is valid: `const isValid = await this.cheatDetectionService.isScoreValid(submission, leaderboard, userId)`.
        3.  Log the submission attempt: `await this.auditService.logScoreSubmission(...)`.
        4.  If `!isValid`, throw `ForbiddenException('Invalid score submission.')` and log suspicious activity with `this.auditService.logSuspiciousActivity(...)`.
        5.  If valid, create the score document: `await this.scoreRepository.create(...)`.
        6.  Invalidate cache keys associated with this leaderboard (e.g., using a pattern `leaderboard:${leaderboardKey}:*`).
        7.  Fetch the player's new rank: `const rank = await this.scoreRepository.getPlayerRank(leaderboard._id, userId)`.
        8.  Return `{ rank }`.
    -   `public async getPlayerRankView(leaderboardKey, userId)`:
        1.  Fetch `leaderboard` definition.
        2.  Fetch player's rank using `this.scoreRepository.getPlayerRank()`.
        3.  If rank is found, fetch their score and a few neighbors (e.g., ranks `rank-2` to `rank+2`) using `this.scoreRepository.findByLeaderboard()` with appropriate offset/limit.
        4.  Enrich with player data and format a DTO. Return it.
        5.  If rank not found, throw `NotFoundException`.
    -   `public async excludePlayerFromLeaderboards(userId)`:
        1.  Call `this.playerRepository.setLeaderboardExclusion(userId, true)`.
        2.  Log this administrative action via `IAuditService`.

##### 4.2.2. `services/cheatDetection.service.ts`

**Purpose:** To validate score submissions against cheating.

**Class: `CheatDetectionService` implements `ICheatDetectionService`**
-   **Dependencies:** `ILevelRepository` (from another domain, to be injected).
-   **Methods:**
    -   `public async isScoreValid(submission, leaderboard, userId)`:
        1.  **Checksum Validation:** Re-calculate a hash on the server. `const expectedHash = crypto.createHmac('sha256', process.env.SCORE_SECRET).update(`${userId}|${leaderboard.keyName}|${submission.score}`).digest('hex');`. Compare `expectedHash` with `submission.validationHash`. If they don't match, return `false`.
        2.  **Score Bounding:** If the leaderboard is for a specific level (`leaderboard.associatedLevelId`), fetch the level's `maxPossibleScore` from `levelRepository`. If `submission.score > maxPossibleScore`, return `false`.
        3.  **Progression Speed (Future):** Future logic could compare the timestamp with the player's previous submission to detect impossibly fast progress.
        4.  If all checks pass, return `true`.

##### 4.2.3. `services/audit.service.ts`

**Purpose:** To create structured audit logs.

**Class: `AuditService` implements `IAuditService`**
-   **Dependencies:** `IAuditLogRepository`.
-   **Methods:**
    -   `public async logScoreSubmission(details)`: Creates an `AuditLog` document with `eventType: 'SCORE_SUBMISSION'` and persists it via the repository.
    -   `public async logSuspiciousActivity(details)`: Creates an `AuditLog` document with `eventType: 'SUSPICIOUS_ACTIVITY'` and persists it.

#### 4.3. Data Access Layer

##### 4.3.1. `models/playerScore.model.ts`

**Purpose:** Mongoose schema for the `playerScores` collection.
-   **Schema Fields:**
    -   `leaderboardId`: `Schema.Types.ObjectId`, `ref: 'Leaderboard'`, `required: true`, `index: true`
    -   `userId`: `Schema.Types.ObjectId`, `ref: 'PlayerProfile'`, `required: true`, `index: true`
    -   `scoreValue`: `Number`, `required: true`
    -   `metadata`: `{ completionTime: Number, moves: Number }`
    -   `timestamp`: `Date`, `default: Date.now`
-   **Indexes:**
    -   `{ leaderboardId: 1, scoreValue: -1, 'metadata.completionTime': 1, timestamp: 1 }` (Primary ranking index)
    -   `{ userId: 1, leaderboardId: 1 }` (To quickly find a user's scores on a leaderboard)

##### 4.3.2. `models/leaderboard.model.ts`

**Purpose:** Mongoose schema for the `leaderboards` collection.
-   **Schema Fields:**
    -   `keyName`: `String`, `required: true`, `unique: true`, `index: true`
    -   `name`: `String`, `required: true`
    -   `scope`: `String`, `enum: ['global', 'event']`, `required: true`
    -   `tieBreakingFields`: `[{ field: String, order: Number }]` (e.g., `[{ field: 'metadata.completionTime', order: 1 }, { field: 'timestamp', order: 1 }]`)
    -   `associatedLevelId`: `Schema.Types.ObjectId`, `ref: 'Level'`
    -   `isActive`: `Boolean`, `default: true`

##### 4.3.3. `repositories/*.repository.ts`

These classes will be straightforward implementations of the Repository Pattern using their respective Mongoose models. They will contain methods for CRUD operations and specific queries needed by the `LeaderboardService`.

-   **`ScoreRepository`:**
    -   `create`: Saves a new score.
    -   `findByLeaderboard`: Queries using `sort()`, `skip()`, `limit()`. The `sort` object will be dynamically constructed based on the `tieBreakingFields` from the leaderboard definition.
    -   `getPlayerRank`: Uses `countDocuments({ leaderboardId, scoreValue: { $gt: userScore } })` plus logic for tie-breaking to calculate the rank.
-   **`LeaderboardRepository`:**
    -   `findByKeyName`: Simple `findOne` query.
-   **`PlayerRepository`:**
    -   `findManyByIds`: Uses `find({ _id: { $in: userIds } })`.
    -   `setLeaderboardExclusion`: Updates the `isExcludedFromLeaderboards: true` flag on a `PlayerProfile` document.

#### 4.4. Infrastructure Layer

##### 4.4.1. `providers/cache.provider.ts`

**Purpose:** To provide a simple interface for Redis caching.

**Class: `CacheProvider` implements `ICacheProvider`**
-   **Dependencies:** `ioredis` library.
-   **Methods:**
    -   `constructor`: Initializes the `ioredis` client using connection details from environment variables (`process.env.REDIS_URL`).
    -   `get(key)`: Calls `this.redisClient.get(key)`.
    -   `set(key, value, ttlSeconds)`: Calls `this.redisClient.set(key, value, 'EX', ttlSeconds)`.
    -   `invalidate(key)`: Calls `this.redisClient.del(key)`. It can also support pattern-based deletion (`KEYS` followed by `DEL`) for invalidating all paginated views of a leaderboard, though this should be used cautiously in production. A better approach is using Redis Sets to track keys for a given leaderboard.

---

### 5. Interfaces

File: `interfaces/leaderboard.interfaces.ts`

This file will define all the contracts for services and repositories to facilitate dependency injection and testing.

typescript
// Example Interfaces

export interface ILeaderboardService {
  getLeaderboardView(leaderboardKey: string, options: { limit: number, offset: number }): Promise<LeaderboardViewDto>;
  processScoreSubmission(leaderboardKey: string, userId: string, submission: SubmitScoreDto): Promise<{ rank: number }>;
  getPlayerRankView(leaderboardKey: string, userId: string): Promise<LeaderboardEntryDto>;
  excludePlayerFromLeaderboards(userId: string): Promise<void>;
}

export interface IScoreRepository {
  create(scoreData: Partial<IPlayerScore>): Promise<IPlayerScore>;
  findByLeaderboard(leaderboardId: string, options: { limit: number, offset: number }, tieBreakingFields: any[]): Promise<IPlayerScore[]>;
  getPlayerRank(leaderboardId: string, userId: string): Promise<number | null>;
}

export interface ICacheProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidateByPattern(pattern: string): Promise<void>;
}

// ... other interfaces for ICheatDetectionService, ILeaderboardRepository, IPlayerRepository, IAuditService
