# Software Design Specification (SDS): Player Data API Endpoint

## 1. Introduction

### 1.1. Purpose
This document provides a detailed software design specification for the **Player Data API Endpoint** (`REPO-GLYPH-PLAYER`). This service is a core component of the Glyph Weaver backend, responsible for managing all server-authoritative player data. Its primary functions include managing player profiles and settings, tracking and synchronizing game progress, handling server-side inventory for virtual goods, and fulfilling data privacy requests in compliance with regulations like GDPR and CCPA.

### 1.2. Scope
The scope of this document is limited to the design and implementation of the `REPO-GLYPH-PLAYER` repository. This includes:
- RESTful API endpoints for player profiles, progress, inventory, and data privacy.
- Application services that orchestrate the business logic for these features.
- Data access repositories for interacting with the MongoDB database.
- Data models (Mongoose schemas) for player-related data.
- Core middleware for authentication, validation, and error handling.

This service will be consumed by the `REPO-GLYPH-CLIENT-UNITY` and will interact with other backend services as needed (e.g., an implicit IAP service for crediting purchases to inventory).

## 2. System Architecture
This service adopts a **Layered Architecture** to ensure a clean separation of concerns, enhance maintainability, and improve testability.

*   **Presentation Layer (`/api/**/*.controller.ts`, `/api/**/*.router.ts`):** Implemented using Express.js controllers and routers. This layer is responsible for handling HTTP requests, validating incoming data transfer objects (DTOs), and formatting HTTP responses. It delegates all business logic to the Application Services Layer.
*   **Application Services Layer (`/services/*.service.ts`, `/api/**/*.service.ts`):** This layer contains the core application and business logic. It orchestrates use cases by coordinating with repositories and other services. It is completely decoupled from the HTTP-specific concerns of the presentation layer.
*   **Data Access Layer (`/data/repositories/*.ts`, `/data/models/*.ts`):** This layer handles all communication with the MongoDB database. It uses the **Repository Pattern** to abstract data persistence logic from the Application Services Layer. Mongoose models define the data schemas and are used exclusively within this layer.

**Dependencies Flow:** Presentation -> Application Services -> Data Access.

## 3. API Specification

All endpoints are prefixed with `/api/v1`. All protected endpoints require a valid JWT in the `Authorization: Bearer <token>` header.

### 3.1. Player Profile & Settings (`/player`)
Manages the player's own profile and settings.

---

#### **GET /player/me**
-   **Description:** Retrieves the complete profile and settings for the authenticated player.
-   **Authentication:** Required (JWT).
-   **Request:** None.
-   **Success Response (200 OK):**
    json
    {
      "id": "uuid-player-123",
      "username": "PlayerAlias",
      "platformId": "platform-specific-id",
      "totalScore": 15200,
      "lastLogin": "2023-10-27T10:00:00Z",
      "settings": {
        "colorblindMode": "none",
        "textSize": 16,
        "reducedMotion": false,
        "inputMethod": "swipe",
        "musicVolume": 0.8,
        "sfxVolume": 1.0,
        "locale": "en",
        "analyticsConsent": true
      }
    }
    
-   **Error Response (404 Not Found):** If the player profile does not exist for the authenticated user ID.

---

#### **PUT /player/me/settings**
-   **Description:** Updates the settings for the authenticated player.
-   **Authentication:** Required (JWT).
-   **Request Body (`UpdateSettingsDto`):**
    json
    {
      "colorblindMode": "deuteranopia",
      "textSize": 18,
      "musicVolume": 0.5
    }
    
    *Validation (Joi):* All fields are optional. `colorblindMode` must be a string. `textSize`, `musicVolume`, `sfxVolume` must be numbers within a valid range (e.g., 0-1). `reducedMotion`, `analyticsConsent` must be booleans.
-   **Success Response (200 OK):** Returns the updated player profile object (same as `GET /player/me`).
-   **Error Response (400 Bad Request):** If the request body fails validation.

---

### 3.2. Player Progress (`/progress`)
Manages synchronization of level completion and scores.

---

#### **GET /progress**
-   **Description:** Retrieves all level progress records for the authenticated player.
-   **Authentication:** Required (JWT).
-   **Request:** None.
-   **Success Response (200 OK):**
    json
    {
      "progress": [
        {
          "levelId": "uuid-level-001",
          "isProcedural": false,
          "bestScore": 5000,
          "starsEarned": 3,
          "completionTime": 120,
          "lastAttempt": "2023-10-26T18:00:00Z"
        }
      ]
    }
    
---

#### **POST /progress/sync**
-   **Description:** Synchronizes a batch of level progress data from the client. The client is responsible for resolving conflicts before sending data. This endpoint uses a "last write wins" based on the provided data.
-   **Authentication:** Required (JWT).
-   **Request Body (`SyncProgressDto`):**
    json
    {
      "progress": [
        {
          "levelId": "uuid-level-002",
          "isProcedural": false,
          "bestScore": 4500,
          "starsEarned": 2,
          "completionTime": 150,
          "lastAttempt": "2023-10-27T11:00:00Z"
        },
        {
          "levelId": "uuid-proc-level-abc",
          "isProcedural": true,
          "bestScore": 6000,
          "starsEarned": 3,
          "completionTime": 200,
          "lastAttempt": "2023-10-27T12:00:00Z"
        }
      ]
    }
    
    *Validation (Joi):* The body must contain a `progress` array. Each object in the array must have `levelId` (string), `isProcedural` (boolean), `bestScore` (number), etc.
-   **Success Response (200 OK):** Returns the full, updated list of player progress (same as `GET /progress`).

---

### 3.3. Player Inventory (`/inventory`)
Manages server-authoritative virtual currency and consumables.

---

#### **GET /inventory**
-   **Description:** Retrieves the server-authoritative inventory (virtual currency, hints, undos) for the authenticated player.
-   **Authentication:** Required (JWT).
-   **Request:** None.
-   **Success Response (200 OK):**
    json
    {
      "inventory": [
        {
          "itemId": "currency_glyph_orbs",
          "type": "currency",
          "quantity": 500
        },
        {
          "itemId": "consumable_hint",
          "type": "consumable",
          "quantity": 10
        }
      ]
    }
    
-   **Error Response (404 Not Found):** If the player's inventory records cannot be found.

---

### 3.4. Data Privacy (`/data-privacy`)
Provides endpoints for GDPR/CCPA compliance.

---

#### **POST /data-privacy/access**
-   **Description:** Initiates a request for an export of the authenticated user's personal data.
-   **Authentication:** Required (JWT).
-   **Request:** None.
-   **Success Response (200 OK):**
    json
    {
      "message": "Data export request received. The data will be sent to your registered email address.",
      "exportData": {
        "profile": { "...": "..." },
        "progress": [ { "...": "..." } ],
        "inventory": [ { "...": "..." } ],
        "iapHistory": [ { "...": "..." } ]
      }
    }
    
    *Note: The actual data might be sent via email for security, with the response simply confirming receipt.*
---

#### **POST /data-privacy/delete**
-   **Description:** Initiates a request for the deletion of the authenticated user's personal data. This is an irreversible action.
-   **Authentication:** Required (JWT).
-   **Request:** None.
-   **Success Response (202 Accepted):**
    json
    {
      "message": "Your data deletion request has been received and is being processed. This action is irreversible.",
      "scheduledAt": "2023-10-27T14:00:00Z"
    }
    

## 4. Data Models (Mongoose Schemas)

### 4.1. `playerProfile.model.ts`
Corresponds to `REQ-PDP-002` and `REQ-8-004`.
typescript
// Mongoose Schema Definition
const UserSettingsSchema = new Schema({
    colorblindMode: { type: String, required: true, default: 'none' },
    textSize: { type: Number, required: true, default: 16 },
    reducedMotion: { type: Boolean, required: true, default: false },
    musicVolume: { type: Number, required: true, default: 1.0 },
    sfxVolume: { type: Number, required: true, default: 1.0 },
    locale: { type: String, required: true, default: 'en' },
    analyticsConsent: { type: Boolean, required: true, default: true },
    // ... other settings
});

const PlayerProfileSchema = new Schema({
    // _id will be the primary user ID
    platformId: { type: String, index: true, unique: true, sparse: true },
    username: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // For custom accounts
    lastLogin: { type: Date },
    userSettings: { type: UserSettingsSchema, required: true },
    isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export const PlayerProfileModel = mongoose.model('PlayerProfile', PlayerProfileSchema);


### 4.2. `levelProgress.model.ts`
Corresponds to `REQ-PDP-002`.
typescript
const LevelProgressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'PlayerProfile', required: true },
    levelId: { type: String, required: true }, // Can be UUID for handcrafted or a generated ID
    isProcedural: { type: Boolean, required: true, default: false },
    starsEarned: { type: Number, required: true, min: 0, max: 3, default: 0 },
    completionTime: { type: Number }, // in seconds
    bestScore: { type: Number, required: true, default: 0 },
    lastAttempt: { type: Date, required: true },
}, { timestamps: true });

// Ensure a player has only one progress record per level
LevelProgressSchema.index({ userId: 1, levelId: 1 }, { unique: true });

export const LevelProgressModel = mongoose.model('LevelProgress', LevelProgressSchema);


### 4.3. `playerInventory.model.ts`
Corresponds to `REQ-PDP-004` and `REQ-8-017`.
typescript
const PlayerInventorySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'PlayerProfile', required: true },
    itemId: { type: String, required: true }, // e.g., 'currency_glyph_orbs', 'consumable_hint'
    itemType: { type: String, required: true, enum: ['currency', 'consumable'] },
    quantity: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true });

PlayerInventorySchema.index({ userId: 1, itemId: 1 }, { unique: true });

export const PlayerInventoryModel = mongoose.model('PlayerInventory', PlayerInventorySchema);


### 4.4. `auditLog.model.ts` (Implicit)
Corresponds to `REQ-SEC-012` logging requirement.
typescript
const AuditLogSchema = new Schema({
    timestamp: { type: Date, required: true, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'PlayerProfile' },
    ipAddress: { type: String },
    eventType: { type: String, required: true, enum: ['DATA_ACCESS_REQUEST', 'DATA_DELETION_REQUEST'] },
    details: { type: Schema.Types.Mixed, required: true },
});

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1 });

export const AuditLogModel = mongoose.model('AuditLog', AuditLogSchema);


## 5. Detailed Component Specification

### 5.1. Core Middleware

#### `auth.middleware.ts`
-   **`authenticate(req, res, next)`:**
    -   Extract token from `Authorization: Bearer <token>` header.
    -   If no token, throw `ApiError(401, 'Authentication token is required')`.
    -   Use `jwt.verify(token, config.jwtSecret)` to validate the token.
    -   On successful verification, attach the decoded payload (e.g., `{ id: 'player-uuid' }`) to `req.user`.
    -   If verification fails, throw `ApiError(401, 'Invalid or expired token')`.
    -   Call `next()` on success, or `next(error)` on failure.

#### `errorHandler.middleware.ts`
-   **`handleErrors(err, req, res, next)`:**
    -   Check if `err instanceof ApiError`. If so, use `err.statusCode` and `err.message` for the response.
    -   If it's a Joi validation error, format it and send a 400 status.
    -   For any other error type, log the full error (using a logger like Winston) and send a generic `500 Internal Server Error` response.
    -   The response format should be consistent: `{ "error": { "message": "..." } }`.

### 5.2. Data Privacy Components (`/api/data-privacy`)

#### `dataPrivacy.service.ts`
-   **`class DataPrivacyService`:**
    -   `constructor(playerRepository, levelProgressRepository, playerInventoryRepository, auditService)`
    -   **`async requestDataExport(playerId)`:**
        1.  Fetch data from `playerRepository.findById(playerId)`.
        2.  Fetch data from `levelProgressRepository.findByPlayerId(playerId)`.
        3.  Fetch data from `playerInventoryRepository.findByPlayerId(playerId)`.
        4.  Compile all data into a `PlayerDataExportDto`.
        5.  Call `auditService.logDataPrivacyAction(playerId, 'access', { status: 'success' })`.
        6.  Return the DTO.
    -   **`async requestDataDeletion(playerId)`:**
        1.  Find the player using `playerRepository.findById(playerId)`. If not found, throw `ApiError(404)`.
        2.  Set `isDeleted = true` on the player profile (soft delete).
        3.  (Optional based on policy) Hard delete associated `LevelProgress` and `PlayerInventory` records.
        4.  Call `auditService.logDataPrivacyAction(playerId, 'deletion', { status: 'initiated' })`.
        5.  Return void.

### 5.3. Progress Synchronization Components (`/api/progress`)

#### `progress.service.ts`
-   **`class ProgressService`:**
    -   `constructor(levelProgressRepository)`
    -   **`async getFullProgress(playerId)`:**
        -   Call `this.levelProgressRepository.findByPlayerId(playerId)`.
        -   Format the result into the response DTO.
    -   **`async synchronizeProgress(playerId, syncData)`:**
        1.  Validate `syncData` payload structure.
        2.  Iterate through each `progress` record in `syncData`.
        3.  For each record, call `this.levelProgressRepository.upsertProgress(playerId, progressRecord)`.
        4.  After the loop, call `getFullProgress(playerId)` to return the fresh, complete state.

#### `levelProgress.repository.ts` (Implicit)
-   **`class LevelProgressRepository`:**
    -   **`async upsertProgress(playerId, progressRecord)`:**
        -   Uses `LevelProgressModel.findOneAndUpdate()` with the `{ upsert: true, new: true }` option.
        -   The query condition will be `{ userId: playerId, levelId: progressRecord.levelId }`.
        -   The update payload will contain `bestScore`, `starsEarned`, etc.
        -   It can include a condition to only update if the new `bestScore` is higher than the existing one, providing server-side sanity checking.

### 5.4. Inventory Components (`/api/inventory`)

#### `inventory.service.ts`
-   **`class InventoryService`:**
    -   `constructor(inventoryRepository)`
    -   **`async getPlayerInventory(playerId)`:**
        -   Call `this.inventoryRepository.findByPlayerId(playerId)`.
        -   Format the results into the response DTO.
    -   **`async updatePlayerInventory(playerId, updates)`:**
        -   *This method is crucial for server-authoritative logic.*
        -   It would likely be called internally by other services (e.g., IAP, Rewards).
        -   For each update, it would find the relevant inventory item and use MongoDB's `$inc` operator to atomically update the quantity, preventing race conditions.
        -   `await PlayerInventoryModel.findOneAndUpdate({ userId, itemId }, { $inc: { quantity: changeAmount } })`.