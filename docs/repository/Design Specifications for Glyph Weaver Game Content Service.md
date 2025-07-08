# Glyph Weaver Game Content Service - Software Design Specification

## 1. Introduction

### 1.1 Purpose
This document outlines the software design for the **Glyph Weaver Game Content Service**. This microservice is the authoritative source for all game design data, including level configurations, procedural generation rules, and core game entity definitions. It provides a RESTful API for the game client to fetch this content, enabling dynamic updates and a consistent gameplay experience.

### 1.2 Scope
The scope of this document is limited to the `REPO-GLYPH-GAMECONTENT` repository. This includes the design of its RESTful API, data models, application services, data access layer, and overall structure. It defines how game content such as Zones, Levels, Glyphs, Obstacles, and Puzzle Types are stored, managed, and served.

### 1.3 Technology Stack
-   **Language:** TypeScript
-   **Framework:** Node.js with Express.js
-   **Database:** MongoDB
-   **ODM:** Mongoose
-   **API Specification:** OpenAPI (Swagger)

## 2. Architectural Design

This service adopts a **Layered Architecture** to promote separation of concerns, maintainability, and testability.

-   **Presentation Layer (`src/api/`):** Exposes the service's functionality via RESTful API endpoints. It is responsible for handling HTTP requests and responses, routing, and input validation. It contains Express Controllers and Routers.
-   **Application Services Layer (`src/application/`):** Orchestrates the application's use cases. It contains the core business logic flow, calling upon domain models and repositories to fulfill requests from the Presentation Layer. It uses Data Transfer Objects (DTOs) to communicate with the presentation layer.
-   **Domain Logic Layer (`src/domain/`):** The heart of the service. It contains the Mongoose Models that define the structure, validation, and relationships of the core game content entities. It also includes the Repository interfaces that define the data access contract.
-   **Data Access & Infrastructure Layer (`src/infrastructure/`):** The concrete implementation of data persistence and external service communication. It includes Mongoose-based repository implementations and database connection management.

### 2.1 Design Patterns
-   **Repository Pattern:** Decouples the Application Services layer from the underlying data persistence mechanism (MongoDB/Mongoose).
-   **Service Layer Pattern:** Encapsulates business logic into cohesive services (e.g., `LevelService`).
-   **Data Transfer Object (DTO):** Provides a clean data contract for the API, separating the external representation of data from the internal domain models.
-   **Dependency Injection:** Services and controllers will receive their dependencies (like repositories) via their constructors, facilitating loose coupling and testability.

## 3. Data Models (Domain Layer)

All models will be implemented as Mongoose Schemas with timestamps (`createdAt`, `updatedAt`) enabled.

### 3.1 `Zone.model.ts`
Defines a game zone, a collection of levels with shared complexity parameters.
typescript
// src/domain/models/Zone.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IZone extends Document {
    name: string;
    description: string;
    unlockCondition: string; // e.g., 'complete_zone:zone_id' or 'player_level:10'
    gridMinSize: number;
    gridMaxSize: number;
    maxGlyphTypes: number;
}

const ZoneSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    unlockCondition: { type: String, required: true },
    gridMinSize: { type: Number, required: true },
    gridMaxSize: { type: Number, required: true },
    maxGlyphTypes: { type: Number, required: true },
}, { timestamps: true });

export default model<IZone>('Zone', ZoneSchema);


### 3.2 `Level.model.ts`
Defines a single game level, which can be either a hand-crafted design or a template for procedural generation.
typescript
// src/domain/models/Level.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ILevel extends Document {
    zoneId: Types.ObjectId;
    levelNumber: number;
    type: 'handcrafted' | 'procedural_template';
    gridSize: number;
    timeLimit?: number;
    moveLimit?: number;
    solutionPath?: object; // For handcrafted levels
    glyphs: Array<{ glyphId: Types.ObjectId; position: { x: number; y: number }; properties?: object }>;
    obstacles: Array<{ obstacleId: Types.ObjectId; position: { x: number; y: number }; }>;
    puzzleTypes: Array<Types.ObjectId>; // Ref to PuzzleType model
}

const LevelSchema: Schema = new Schema({
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    levelNumber: { type: Number, required: true },
    type: { type: String, enum: ['handcrafted', 'procedural_template'], required: true, index: true },
    gridSize: { type: Number, required: true },
    timeLimit: { type: Number },
    moveLimit: { type: Number },
    solutionPath: { type: Object },
    glyphs: [{
        glyphId: { type: Schema.Types.ObjectId, ref: 'Glyph', required: true },
        position: { x: Number, y: Number },
        properties: { type: Object }
    }],
    obstacles: [{
        obstacleId: { type: Schema.Types.ObjectId, ref: 'Obstacle', required: true },
        position: { x: Number, y: Number }
    }],
    puzzleTypes: [{ type: Schema.Types.ObjectId, ref: 'PuzzleType' }]
}, { timestamps: true });

LevelSchema.index({ zoneId: 1, levelNumber: 1 }, { unique: true });

export default model<ILevel>('Level', LevelSchema);


### 3.3 `ProceduralInstance.model.ts`
Stores a snapshot of a procedurally generated level to ensure reproducibility.
typescript
// src/domain/models/ProceduralInstance.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IProceduralInstance extends Document {
    baseLevelId: Types.ObjectId; // Ref to the template Level
    generationSeed: string;
    generationParameters: object;
    gridConfig: object; // Full generated level layout
    solutionPath: object;
}

const ProceduralInstanceSchema: Schema = new Schema({
    baseLevelId: { type: Schema.Types.ObjectId, ref: 'Level', required: true },
    generationSeed: { type: String, required: true },
    generationParameters: { type: Object, required: true },
    gridConfig: { type: Object, required: true },
    solutionPath: { type: Object, required: true },
}, { timestamps: true });

export default model<IProceduralInstance>('ProceduralInstance', ProceduralInstanceSchema);


### 3.4 `Glyph.model.ts`
Catalog of all possible glyph types and their properties.
typescript
// src/domain/models/Glyph.model.ts
// ... (Similar structure for Glyph, Obstacle, PuzzleType, Tutorial)
const GlyphSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ['standard', 'mirror', 'linked', 'catalyst'] },
    colorCode: { type: String, required: true },
    symbol: { type: String, required: true },
    interactionRules: { type: Object, required: true },
    accessibilityPattern: { type: String, required: true },
});


### 3.5 `Obstacle.model.ts`
Catalog of all possible obstacle types and their behaviors.
typescript
// src/domain/models/Obstacle.model.ts
const ObstacleSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['blocker', 'shifting'] },
    movementPattern: { type: Object }, // For 'shifting' type
    interactionRules: { type: Object, required: true },
});


### 3.6 `PuzzleType.model.ts`
Catalog of all puzzle mechanics.
typescript
// src/domain/models/PuzzleType.model.ts
const PuzzleTypeSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    validationRules: { type: Object, required: true },
});


## 4. API Specification (Presentation Layer)

The API will be versioned under `/api/v1/`.

### 4.1 `/content-catalogs`
-   **Endpoint:** `GET /api/v1/content-catalogs`
-   **Description:** Fetches all core game design definitions in a single call for client-side caching.
-   **Response (200 OK):**
    json
    {
      "glyphs": [ /* Array of Glyph objects */ ],
      "obstacles": [ /* Array of Obstacle objects */ ],
      "puzzleTypes": [ /* Array of PuzzleType objects */ ]
    }
    

### 4.2 `/zones`
-   **Endpoint:** `GET /api/v1/zones`
-   **Description:** Retrieves a list of all game zones.
-   **Response (200 OK):** `Array<ZoneSummaryDto>`

-   **Endpoint:** `GET /api/v1/zones/:id`
-   **Description:** Retrieves detailed information for a single zone.
-   **Response (200 OK):** `ZoneDetailDto`

### 4.3 `/levels`
-   **Endpoint:** `GET /api/v1/levels/zone/:zoneId`
-   **Description:** Retrieves a summary list of all hand-crafted levels within a specific zone.
-   **Response (200 OK):** `Array<LevelSummaryDto>`

-   **Endpoint:** `GET /api/v1/levels/:id`
-   **Description:** Retrieves the full configuration for a single hand-crafted level or a procedural template.
-   **Response (200 OK):** `LevelDetailDto`

### 4.4 `/procedural-instances`
-   **Endpoint:** `POST /api/v1/procedural-instances`
-   **Description:** Logs a new procedurally generated level instance. Fulfills `REQ-CGLE-011`.
-   **Request Body:** `CreateProceduralInstanceDto`
    json
    {
      "baseLevelId": "...",
      "generationSeed": "...",
      "generationParameters": { ... },
      "gridConfig": { ... },
      "solutionPath": { ... }
    }
    
-   **Response (201 Created):** `{ "id": "...", "message": "Instance created successfully." }`

-   **Endpoint:** `GET /api/v1/procedural-instances/:id`
-   **Description:** Retrieves a previously saved procedural instance for reproducibility.
-   **Response (200 OK):** `ProceduralInstanceDto`

## 5. Application Services and Infrastructure

### 5.1 Services (`src/application/services/`)
-   **`LevelService`**:
    -   `getLevelById(id: string)`: Fetches a level by its ID from the repository and maps it to a DTO.
    -   `getLevelsByZone(zoneId: string)`: Fetches all level summaries for a zone.
-   **`ZoneService`**: Handles business logic for fetching zone data.
-   **`ContentCatalogService`**:
    -   `getFullCatalog()`: Fetches all glyphs, obstacles, and puzzle types from their respective repositories and aggregates them into a single DTO.
-   **`ProceduralInstanceService`**:
    -   `createInstance(data: CreateProceduralInstanceDto)`: Validates input and creates a new procedural instance record in the database.

### 5.2 Repositories (`src/infrastructure/repositories/`)
Concrete Mongoose implementations of repository interfaces will be created for each domain model: `MongooseLevelRepository`, `MongooseZoneRepository`, `MongooseProceduralInstanceRepository`, etc. They will encapsulate all Mongoose query logic.

### 5.3 Database (`src/infrastructure/database/`)
-   **`connection.ts`**: Contains a `connectDB` function that reads `MONGO_URI` from environment variables (`.env` file) and uses `mongoose.connect()`. It will handle connection events (`connected`, `error`) for logging.

### 5.4 Error Handling
A global error-handling middleware will be defined in `src/app.ts`. It will catch errors passed via `next(error)` from controllers, log them, and send a standardized JSON error response to the client (e.g., `{ status: 'error', message: 'Internal Server Error' }`).

## 6. Data Transfer Objects (DTOs)
DTOs will be defined in `src/application/dtos/` to ensure a stable API contract.

-   **`ZoneSummaryDto`**: `{ id, name, unlockCondition }`
-   **`LevelSummaryDto`**: `{ id, levelNumber, type }`
-   **`LevelDetailDto`**: Contains the full, client-safe level configuration, omitting sensitive data like solutions unless explicitly part of the DTO's purpose.
-   **`ContentCatalogDto`**: `{ glyphs: [...], obstacles: [...], puzzleTypes: [...] }`

## 7. Testing Strategy

-   **Unit Tests:** Jest will be used.
    -   Services will be tested with mocked repositories.
    -   Controllers will be tested with mocked services to verify routing and response formatting.
    -   Domain model validations will be tested.
-   **Integration Tests:**
    -   Tests will run against an in-memory MongoDB server (e.g., `mongodb-memory-server`) to test the full flow from service to repository to database without network calls.
    -   API endpoints will be tested using a library like `supertest`.