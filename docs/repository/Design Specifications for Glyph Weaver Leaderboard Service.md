# Software Design Specification (SDS): Glyph Weaver Leaderboard Service

## 1. Introduction

### 1.1. Purpose

This document provides a detailed software design specification for the **Glyph Weaver Leaderboard Service**. This microservice is a core backend component responsible for managing all aspects of the game's competitive leaderboards. Its primary functions are to ingest, validate, and rank player scores, provide fast and reliable leaderboard data to the game client, and protect the integrity of the leaderboards through robust cheat detection and caching mechanisms.

### 1.2. Scope

The scope of this service includes:
- Providing RESTful API endpoints for score submission and leaderboard retrieval.
- Implementing server-side validation and anomaly detection for all submitted scores.
- Managing data persistence for leaderboard configurations and player scores using MongoDB.
- Utilizing a Redis cache to ensure high-performance reads for leaderboard data.
- Calculating player rankings based on score and defined tie-breaking rules.
- Logging all relevant activities for auditing and security purposes.

This service **does not** handle player authentication, user profile management, or in-app purchases; it consumes player identity information from other services.

### 1.3. Mapped Requirements
This SDS directly addresses the following requirements: `REQ-SCF-003`, `REQ-SCF-005`, `REQ-SCF-006`, `REQ-SCF-007`, `REQ-SCF-012`, `REQ-SEC-005`, `REQ-SEC-007`.

## 2. System Architecture

The Leaderboard Service is designed as a standalone microservice following a standard layered architecture, built on a Node.js, Express.js, and TypeScript stack.

### 2.1. Architectural Layers

- **API Presentation Layer:** Built with Express.js. This layer is responsible for defining RESTful API endpoints, handling HTTP requests and responses, validating incoming data (DTOs), and routing requests to the Application Layer.
- **Application Services Layer:** Contains the use case handlers (e.g., `SubmitScoreHandler`, `GetLeaderboardHandler`). This layer orchestrates the business logic, coordinating between the Domain models, repositories, and other services like caching and cheat detection.
- **Domain Layer:** The core of the service, containing the business logic and rules encapsulated in domain models (`Score`, `Leaderboard`). This layer is persistence-ignorant.
- **Infrastructure & Data Access Layer:** Implements data persistence using Mongoose and MongoDB (`ScoreRepository`), caching using Redis (`RedisCacheService`), and any communication with other services. It provides concrete implementations of the interfaces defined in the Application Layer.

### 2.2. Technology Stack

- **Runtime:** Node.js (v18.x or later)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **Cache:** Redis
- **Validation:** `class-validator`, `class-transformer`
- **Configuration:** `dotenv`, `zod`

## 3. API Specification (OpenAPI 3.0)

The service exposes the following RESTful API endpoints. All endpoints are prefixed with `/api/v1`.

### 3.1. Endpoints

---

**Submit a Score**
- **Endpoint:** `POST /scores`
- **Description:** Submits a player's score to a specific leaderboard. The request is validated, checked for anomalies, and then processed.
- **Request Body:** `SubmitScoreDto`
  json
  {
    "leaderboardId": "string (UUID)",
    "playerId": "string (UUID)",
    "scoreValue": "number",
    "tieBreakerValue": "number", // e.g., time in seconds (lower is better)
    "metadata": {
      "levelId": "string",
      "moves": "number"
    },
    "validationPayload": "string (HMAC or similar)"
  }
  
- **Responses:**
  - `202 Accepted`: Score accepted for processing.
  - `400 Bad Request`: Invalid request body or payload.
  - `403 Forbidden`: Score rejected by cheat detection.
  - `429 Too Many Requests`: Rate limit exceeded.

---

**Get Leaderboard View**
- **Endpoint:** `GET /leaderboards/:leaderboardId`
- **Description:** Retrieves a paginated view of a specific leaderboard. Utilizes caching for performance.
- **Path Parameters:**
  - `leaderboardId` (string, required): The unique identifier for the leaderboard.
- **Query Parameters:**
  - `limit` (number, optional, default: 50): The number of entries to return.
  - `offset` (number, optional, default: 0): The starting position for the entries.
- **Response:** `200 OK`
  json
  {
    "leaderboardId": "string",
    "totalEntries": "number",
    "lastRefreshed": "string (ISO 8601)",
    "entries": [
      {
        "rank": "number",
        "playerId": "string",
        "playerName": "string", // Name fetched/provided by another service
        "scoreValue": "number",
        "tieBreakerValue": "number",
        "submittedAt": "string (ISO 8601)"
      }
    ]
  }
  

---

**Get Player Rank**
- **Endpoint:** `GET /leaderboards/:leaderboardId/rank/:playerId`
- **Description:** Retrieves the specific rank and score for a single player on a given leaderboard.
- **Path Parameters:**
  - `leaderboardId` (string, required): The unique identifier for the leaderboard.
  - `playerId` (string, required): The unique identifier for the player.
- **Response:** `200 OK`
  json
  {
    "rank": "number",
    "playerId": "string",
    "playerName": "string",
    "scoreValue": "number",
    "tieBreakerValue": "number",
    "submittedAt": "string (ISO 8601)"
  }
  
  - `404 Not Found`: Player has no score on this leaderboard.

## 4. Data Models and Persistence

### 4.1. Mongoose Schemas

#### 4.1.1. `score.schema.ts`
Defines the structure for documents in the `scores` collection.

typescript
import { Schema, model, Document } from 'mongoose';

export interface IScoreDocument extends Document {
  leaderboardId: string;
  playerId: string;
  scoreValue: number;
  tieBreakerValue: number; // For sorting when scores are equal. Lower is better.
  metadata: Record<string, any>;
  submittedAt: Date;
  isSuspicious: boolean;
  suspicionReason?: string;
}

const scoreSchema = new Schema<IScoreDocument>({
  leaderboardId: { type: String, required: true, index: true },
  playerId: { type: String, required: true },
  scoreValue: { type: Number, required: true },
  tieBreakerValue: { type: Number, required: true },
  metadata: { type: Schema.Types.Mixed, required: false },
  submittedAt: { type: Date, default: Date.now, required: true },
  isSuspicious: { type: Boolean, default: false },
  suspicionReason: { type: String, required: false },
}, { timestamps: true });

// Compound index for efficient ranking queries (REQ-SCF-012)
scoreSchema.index({ leaderboardId: 1, scoreValue: -1, tieBreakerValue: 1, submittedAt: 1 });
// Index for fetching a player's best score on a leaderboard
scoreSchema.index({ leaderboardId: 1, playerId: 1 });

export const ScoreModel = model<IScoreDocument>('Score', scoreSchema);


#### 4.1.2. `leaderboard.schema.ts` (For configuration, if stored in DB)
Defines leaderboard configurations.

typescript
import { Schema, model, Document } from 'mongoose';

export interface ILeaderboardDocument extends Document {
  name: string;
  scope: 'global' | 'event';
  resetCycle: 'daily' | 'weekly' | 'none';
  tieBreakingFields: string[]; // e.g., ['completionTime', 'moves']
  //... other config fields
}

// Schema definition...


### 4.2. Repositories

#### 4.2.1. `IScoreRepository.ts`
Defines the contract for score persistence.

typescript
import { Score } from '../domain/models/score.model';

export interface IScoreRepository {
  add(score: Score): Promise<void>;
  getRankedScores(leaderboardId: string, limit: number, offset: number): Promise<Score[]>;
  getPlayerRank(leaderboardId: string, playerId: string): Promise<{ rank: number; score: Score } | null>;
}


#### 4.2.2. `score.repository.ts`
The Mongoose implementation of `IScoreRepository`.

- **`add(score)`**: Creates a new `ScoreModel` document and saves it.
- **`getRankedScores(...)`**: Queries `ScoreModel` using `find({ leaderboardId, isSuspicious: false })`, sorts by the primary index (`scoreValue: -1`, `tieBreakerValue: 1`), and uses `.skip(offset).limit(limit)`.
- **`getPlayerRank(...)`**: A more complex query. It could first find the player's best score, then use `countDocuments` to find how many other players have a better score.

## 5. Caching Strategy

The service will implement a **cache-aside** strategy for leaderboard reads to ensure high performance and reduce database load, as required by `REQ-SCF-012` and `REQ-SCF-006`.

- **Technology:** Redis.
- **Cached Data:** Fully formatted `LeaderboardViewDto` objects.
- **Cache Key Structure:** `leaderboard:<leaderboardId>:limit:<limit>:offset:<offset>`
- **Time-To-Live (TTL):** A short TTL (e.g., 60 seconds) will be used to ensure data freshness while still providing significant performance benefits.
- **Cache Invalidation:** The cache for a specific leaderboard (`leaderboard:<leaderboardId>:*`) will be invalidated (deleted) whenever a new, valid score is successfully submitted to that leaderboard. This will be a "wildcard" deletion to clear all paginated views for that leaderboard.

## 6. Core Business Logic

### 6.1. Use Case: Submit Score (`submitScore.handler.ts`)

1.  **Input:** `SubmitScoreCommand` containing the `SubmitScoreDto`.
2.  **Validation:** The controller layer validates the DTO structure.
3.  **Cheat Detection:** The handler calls `cheatDetectionService.isScoreAnomalous(command)`.
    - **Logic:** `isScoreAnomalous` will perform checks as per `REQ-SEC-005`:
      - **Sanity Check:** Compare `scoreValue` against a known maximum possible score for the level (this info may need to be fetched from a Game Content service or be part of the leaderboard config).
      - **Payload Integrity:** Re-calculate a checksum/HMAC on the server using a shared secret and critical game state variables from the `metadata` and compare it with the `validationPayload` from the client.
      - **Velocity Check:** (Optional/Future) Check against the player's submission history to flag impossibly fast progression.
4.  **Processing:**
    - **If Anomalous:** Log the event with the reason to an audit/suspicion log (`REQ-SEC-007`). Return a `403 Forbidden` error to the client.
    - **If Valid:**
      a. Create a `Score` domain entity.
      b. Persist the `Score` entity using `scoreRepository.add()`.
      c. Asynchronously invalidate the relevant leaderboard cache keys in Redis using `cacheService.del()`. The key pattern to delete will be `leaderboard:<leaderboardId>:*`.
      d. Log the successful submission to an audit log.
      e. Return `202 Accepted`.

### 6.2. Use Case: Get Leaderboard (`getLeaderboard.handler.ts`)

1.  **Input:** `GetLeaderboardQuery` with `leaderboardId`, `limit`, `offset`.
2.  **Cache Check:** Construct the cache key and attempt to fetch data from `cacheService.get()`.
3.  **Processing:**
    - **Cache Hit:** If data is found, parse and return it directly.
    - **Cache Miss:**
      a. Call `scoreRepository.getRankedScores(...)` to fetch the sorted list of `Score` entities from MongoDB.
      b. Transform the `Score` entities into `LeaderboardEntryDto` objects. This may involve fetching player names from another service if not included in the score metadata.
      c. Construct the final `LeaderboardViewDto` response object, including the `lastRefreshed` timestamp.
      d. Asynchronously store the DTO in Redis using `cacheService.set()` with the defined TTL.
      e. Return the DTO.

### 6.3. Ranking Logic (`REQ-SCF-007`)

The primary sorting mechanism is handled by the compound index on the `scores` collection: `{ leaderboardId: 1, scoreValue: -1, tieBreakerValue: 1, submittedAt: 1 }`. This ensures that for any given leaderboard, scores are ranked:
1.  By `scoreValue` in descending order.
2.  For tied scores, by `tieBreakerValue` (e.g., completion time) in ascending order.
3.  For further ties, by `submittedAt` in ascending order (first to achieve the score ranks higher).

## 7. Configuration (`config/index.ts`)

The service will load configuration from environment variables. A `.env` file will be used for local development.

- `PORT`: The port for the Express server to listen on.
- `MONGO_URI`: The connection string for the MongoDB database.
- `REDIS_URL`: The connection URL for the Redis instance.
- `LOG_LEVEL`: The logging verbosity (e.g., 'info', 'debug').
- `CLIENT_SECRET`: A shared secret key used for generating and validating the `validationPayload` checksum.
- `CORS_ORIGIN`: The allowed origin for CORS requests (the game client's domain).

## 8. Logging and Auditing

- **Application Logging:** A structured logger (like Winston) will be used for standard application logs (info, warn, error). Logs will be in JSON format for easy parsing by log aggregators.
- **Audit Logging (`REQ-SEC-007`):** A dedicated `AuditLogService` will be used to log critical security-relevant events to a separate, secure log stream or collection.
  - **`score.submitted.success`**: `playerId`, `leaderboardId`, `scoreValue`, `ipAddress`, `timestamp`.
  - **`score.submitted.suspicious`**: `playerId`, `leaderboardId`, `scoreValue`, `reason`, `submittedPayload`, `ipAddress`, `timestamp`.
  - **`player.moderated`**: `adminId`, `playerId`, `action` (e.g., 'excluded_from_leaderboard'), `reason`, `timestamp`.

## 9. Error Handling

A global Express error-handling middleware will be implemented. It will catch all errors and format a consistent JSON error response.

**Standard Error Response:**
json
{
  "statusCode": 4xx | 5xx,
  "message": "A descriptive error message",
  "error": "Short error code, e.g., 'BadRequest'"
}
