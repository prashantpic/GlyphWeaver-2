# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the project metadata, dependencies, and scripts for the Player Data API service.  
**Template:** Node.js package.json  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Project Dependencies
    - NPM Scripts
    
**Requirement Ids:**
    
    
**Purpose:** To manage project dependencies (like express, mongoose, joi, typescript) and define scripts for running, building, and testing the application.  
**Logic Description:** This file will list 'express', 'mongoose', 'joi', 'jsonwebtoken', 'dotenv', 'cors', 'winston' as dependencies, and 'typescript', 'ts-node', '@types/*' as devDependencies. Scripts will include 'start', 'build', 'test', and 'dev'.  
**Documentation:**
    
    - **Summary:** Standard NPM package file for a TypeScript and Express.js project. It lists all necessary libraries for the API to function and provides convenient scripts for development and deployment.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration file for the project.  
**Template:** TypeScript tsconfig.json  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Settings
    
**Requirement Ids:**
    
    
**Purpose:** To configure the TypeScript compiler options, such as target ECMAScript version, module system, output directory, and strict type-checking rules.  
**Logic Description:** This file will set 'target' to 'es2020' or newer, 'module' to 'commonjs', 'outDir' to './dist', 'rootDir' to './src', and enable 'strict' mode. It will also define 'esModuleInterop' and 'resolveJsonModule' as true.  
**Documentation:**
    
    - **Summary:** Specifies the root files and the compiler options required to compile the TypeScript project into JavaScript.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/server.ts  
**Description:** The main entry point for the API server application.  
**Template:** Node.js Server Template  
**Dependency Level:** 3  
**Name:** server  
**Type:** Application  
**Relative Path:** server.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** main  
**Parameters:**
    
    
**Return Type:** void  
**Attributes:** private|async  
    
**Implemented Features:**
    
    - Server Initialization
    
**Requirement Ids:**
    
    
**Purpose:** To initialize and start the HTTP server, load configuration, establish database connections, and begin listening for incoming requests.  
**Logic Description:** This file imports the main 'app' from './app.ts' and the database connection logic. It loads environment variables using 'dotenv', connects to MongoDB, and then starts the Express server to listen on the configured port. It includes basic process signal handling for graceful shutdown.  
**Documentation:**
    
    - **Summary:** The bootstrap file for the Player Data API. It orchestrates the startup sequence: config loading, database connection, and server listening.
    
**Namespace:** GlyphWeaver.Backend.Api.Player  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/app.ts  
**Description:** Core Express.js application setup and middleware configuration.  
**Template:** Express App Template  
**Dependency Level:** 2  
**Name:** app  
**Type:** Application  
**Relative Path:** app.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** app  
**Type:** express.Application  
**Attributes:** private  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Middleware Pipeline
    - API Routing
    
**Requirement Ids:**
    
    
**Purpose:** To create the Express application instance, configure global middleware (CORS, body-parser, security headers), mount the main API router, and set up global error handling.  
**Logic Description:** Initializes an Express app. Applies middleware for CORS, JSON body parsing, and URL encoding. It then mounts the main router from './api/index.ts' under a base path like '/api/v1'. Finally, it registers the global error handling middleware.  
**Documentation:**
    
    - **Summary:** This file configures the Express.js application, defining the request processing pipeline and integrating all API routes.
    
**Namespace:** GlyphWeaver.Backend.Api.Player  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/core/config/index.ts  
**Description:** Centralized configuration management for the application.  
**Template:** Node.js Config Template  
**Dependency Level:** 0  
**Name:** config  
**Type:** Configuration  
**Relative Path:** core/config/index.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** port  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** mongodbUri  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** jwtSecret  
**Type:** string  
**Attributes:** public|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment Variable Loading
    
**Requirement Ids:**
    
    
**Purpose:** To load environment-specific configuration from .env files and process.env, providing a single, strongly-typed source of configuration for the rest of the application.  
**Logic Description:** Uses the 'dotenv' library to load environment variables. It exports a frozen object containing validated configuration values like the port, MongoDB connection URI, and JWT secret. It will throw an error if essential variables are missing.  
**Documentation:**
    
    - **Summary:** This module centralizes access to all application configuration, ensuring that settings are loaded securely and consistently from environment variables.
    
**Namespace:** GlyphWeaver.Backend.Core.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/core/middleware/auth.middleware.ts  
**Description:** Express middleware to authenticate requests using JWT.  
**Template:** Express Middleware Template  
**Dependency Level:** 1  
**Name:** authMiddleware  
**Type:** Middleware  
**Relative Path:** core/middleware/auth.middleware.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** authenticate  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - JWT Validation
    - User Context Attachment
    
**Requirement Ids:**
    
    
**Purpose:** To protect routes by validating the JSON Web Token (JWT) present in the 'Authorization' header and attaching the decoded user payload to the request object for downstream use.  
**Logic Description:** Extracts the 'Bearer' token from the 'Authorization' header. Uses the 'jsonwebtoken' library and the JWT secret from config to verify the token. If valid, it decodes the payload (containing player ID) and attaches it to 'req.user'. If invalid or missing, it sends a 401 Unauthorized error.  
**Documentation:**
    
    - **Summary:** An authentication middleware that secures API endpoints by ensuring a valid JWT is provided with the request.
    
**Namespace:** GlyphWeaver.Backend.Core.Middleware  
**Metadata:**
    
    - **Category:** Security
    
- **Path:** src/core/middleware/errorHandler.middleware.ts  
**Description:** Global error handling middleware for the Express application.  
**Template:** Express Middleware Template  
**Dependency Level:** 1  
**Name:** errorHandler  
**Type:** Middleware  
**Relative Path:** core/middleware/errorHandler.middleware.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** handleErrors  
**Parameters:**
    
    - err: Error
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** void  
**Attributes:** public  
    
**Implemented Features:**
    
    - Centralized Error Handling
    - Standardized Error Response
    
**Requirement Ids:**
    
    
**Purpose:** To catch all errors thrown from controllers and services, log them, and send a standardized JSON error response to the client, preventing stack traces from leaking.  
**Logic Description:** This middleware function checks if the error is a known custom ApiError type to use its status code and message. For unknown errors, it logs the full error and returns a generic 500 Internal Server Error response to avoid exposing implementation details.  
**Documentation:**
    
    - **Summary:** A final middleware in the request pipeline that centralizes error handling, ensuring consistent and secure error responses are sent to clients.
    
**Namespace:** GlyphWeaver.Backend.Core.Middleware  
**Metadata:**
    
    - **Category:** CrossCutting
    
- **Path:** src/core/errors/ApiError.ts  
**Description:** Custom base error class for API-specific errors.  
**Template:** TypeScript Class  
**Dependency Level:** 0  
**Name:** ApiError  
**Type:** Model  
**Relative Path:** core/errors/ApiError.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** statusCode  
**Type:** number  
**Attributes:** public  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - statusCode: number
    - message: string
    
**Return Type:** void  
**Attributes:** public  
    
**Implemented Features:**
    
    - Custom Error Handling
    
**Requirement Ids:**
    
    
**Purpose:** To provide a standard way of representing errors that should result in a specific HTTP status code, allowing the global error handler to respond appropriately.  
**Logic Description:** A simple class that extends the built-in 'Error' class and adds a 'statusCode' property. This allows services to throw errors like 'throw new ApiError(404, 'Player not found')'.  
**Documentation:**
    
    - **Summary:** A base class for creating structured API errors with associated HTTP status codes.
    
**Namespace:** GlyphWeaver.Backend.Core.Errors  
**Metadata:**
    
    - **Category:** CrossCutting
    
- **Path:** src/data/database.ts  
**Description:** Manages the connection to the MongoDB database.  
**Template:** Node.js Module  
**Dependency Level:** 1  
**Name:** database  
**Type:** Infrastructure  
**Relative Path:** data/database.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** connectDB  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Database Connection
    
**Requirement Ids:**
    
    
**Purpose:** To establish and manage the connection to the MongoDB instance using Mongoose, based on the URI provided in the application configuration.  
**Logic Description:** Imports 'mongoose' and the database URI from the config module. The 'connectDB' function uses 'mongoose.connect()' to establish the connection, with appropriate options for modern MongoDB servers. It includes logging for successful connections and connection errors.  
**Documentation:**
    
    - **Summary:** This module encapsulates all logic related to initializing the connection to the MongoDB database.
    
**Namespace:** GlyphWeaver.Backend.Data  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/data/models/playerProfile.model.ts  
**Description:** Mongoose schema and model definition for the PlayerProfile entity.  
**Template:** Mongoose Model  
**Dependency Level:** 0  
**Name:** PlayerProfileModel  
**Type:** Model  
**Relative Path:** data/models/playerProfile.model.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - DDD-Aggregate
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Player Data Schema
    
**Requirement Ids:**
    
    - REQ-8-004
    - REQ-PDP-002
    
**Purpose:** To define the structure, validation rules, and data types for player profile documents stored in the 'playerprofiles' MongoDB collection.  
**Logic Description:** Defines a Mongoose Schema for the player profile. Includes fields like 'platformId', 'username', 'lastLogin', and an embedded 'userSettings' object for audio/accessibility preferences. It adds timestamps ('createdAt', 'updatedAt') automatically.  
**Documentation:**
    
    - **Summary:** Represents the PlayerProfile aggregate root in the database, defining its schema using Mongoose.
    
**Namespace:** GlyphWeaver.Backend.Data.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/data/models/levelProgress.model.ts  
**Description:** Mongoose schema and model definition for the LevelProgress entity.  
**Template:** Mongoose Model  
**Dependency Level:** 0  
**Name:** LevelProgressModel  
**Type:** Model  
**Relative Path:** data/models/levelProgress.model.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Level Progress Schema
    
**Requirement Ids:**
    
    - REQ-8-004
    - REQ-PDP-002
    
**Purpose:** To define the structure for storing a player's progress on a specific level, including stars, score, and completion time.  
**Logic Description:** Defines a Mongoose Schema with fields like 'userId', 'levelId', 'starsEarned', 'bestScore', and 'completionTime'. It includes a compound index on 'userId' and 'levelId' for efficient lookups.  
**Documentation:**
    
    - **Summary:** Represents a player's progress on a single game level, defining its schema using Mongoose.
    
**Namespace:** GlyphWeaver.Backend.Data.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/data/models/playerInventory.model.ts  
**Description:** Mongoose schema and model for the PlayerInventory, tracking consumables and virtual currency.  
**Template:** Mongoose Model  
**Dependency Level:** 0  
**Name:** PlayerInventoryModel  
**Type:** Model  
**Relative Path:** data/models/playerInventory.model.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Player Inventory Schema
    
**Requirement Ids:**
    
    - REQ-8-004
    - REQ-PDP-004
    - REQ-8-017
    
**Purpose:** To define the structure for storing a player's inventory, such as the balance of virtual currency ('Glyph Orbs') and the quantity of consumable items like hints and undos.  
**Logic Description:** Defines a Mongoose Schema with fields like 'userId', 'itemType' (e.g., 'currency', 'hint'), 'itemId', and 'quantity'. A compound unique index on 'userId' and 'itemId' ensures each player has one entry per item type.  
**Documentation:**
    
    - **Summary:** Represents a player's inventory of virtual items and currencies, defining its schema using Mongoose.
    
**Namespace:** GlyphWeaver.Backend.Data.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/data/repositories/player.repository.ts  
**Description:** Data access repository for PlayerProfile entities.  
**Template:** TypeScript Repository  
**Dependency Level:** 1  
**Name:** PlayerRepository  
**Type:** Repository  
**Relative Path:** data/repositories/player.repository.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** playerModel  
**Type:** mongoose.Model<IPlayerProfile>  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** findById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<IPlayerProfile | null>  
**Attributes:** public  
    - **Name:** updateSettings  
**Parameters:**
    
    - id: string
    - settings: ISettingsDto
    
**Return Type:** Promise<IPlayerProfile | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Player Data CRUD
    
**Requirement Ids:**
    
    
**Purpose:** To encapsulate all database query logic for PlayerProfile documents, abstracting the data access from the application services.  
**Logic Description:** This class will have methods for finding a player by their ID, creating a new player, updating their profile information, and specifically updating their settings sub-document. It interacts directly with the 'PlayerProfileModel'.  
**Documentation:**
    
    - **Summary:** Provides a clean, collection-like interface for accessing and manipulating PlayerProfile data in MongoDB.
    
**Namespace:** GlyphWeaver.Backend.Data.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/services/audit.service.ts  
**Description:** Service responsible for logging critical audit events.  
**Template:** TypeScript Service  
**Dependency Level:** 1  
**Name:** AuditService  
**Type:** Service  
**Relative Path:** services/audit.service.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** logDataPrivacyAction  
**Parameters:**
    
    - playerId: string
    - action: 'access' | 'deletion'
    - details: object
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Audit Logging
    
**Requirement Ids:**
    
    - REQ-SEC-012
    
**Purpose:** To provide a centralized service for other parts of the application to log important, security-sensitive actions, such as handling a GDPR data deletion request.  
**Logic Description:** This service will contain methods corresponding to different audit events. For example, 'logDataPrivacyAction' will create a new document in an 'auditlogs' collection, recording the player ID, the action taken, a timestamp, and any relevant details. It's designed to be called by other services like 'DataPrivacyService'.  
**Documentation:**
    
    - **Summary:** A cross-cutting service for creating and storing audit trail records for security and compliance purposes.
    
**Namespace:** GlyphWeaver.Backend.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/api/progress/progress.service.ts  
**Description:** Application service to handle player progress synchronization.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** ProgressService  
**Type:** Service  
**Relative Path:** api/progress/progress.service.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - Service Layer Pattern
    
**Members:**
    
    - **Name:** levelProgressRepository  
**Type:** LevelProgressRepository  
**Attributes:** private  
    - **Name:** playerRepository  
**Type:** PlayerRepository  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** getFullProgress  
**Parameters:**
    
    - playerId: string
    
**Return Type:** Promise<FullProgressDto>  
**Attributes:** public  
    - **Name:** synchronizeProgress  
**Parameters:**
    
    - playerId: string
    - syncData: SyncProgressDto
    
**Return Type:** Promise<FullProgressDto>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Player Progress Fetching
    - Player Progress Synchronization
    
**Requirement Ids:**
    
    - REQ-PDP-001
    - REQ-PDP-002
    - REQ-PDP-005
    - REQ-PDP-006
    
**Purpose:** To orchestrate the logic for retrieving a player's complete game progress and for synchronizing progress data received from the client.  
**Logic Description:** The 'getFullProgress' method will fetch all related 'LevelProgress' documents for a player. The 'synchronizeProgress' method will receive a payload from the client (representing the chosen data after a potential cloud save conflict) and will update or create 'LevelProgress' documents accordingly. It will use a 'last-write-wins' approach based on timestamps provided by the client, as the client handles the conflict UI.  
**Documentation:**
    
    - **Summary:** This service acts as a facade for all operations related to managing and synchronizing a player's level-by-level game progress.
    
**Namespace:** GlyphWeaver.Backend.Api.Progress  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/api/progress/progress.controller.ts  
**Description:** Express controller for handling player progress API requests.  
**Template:** Express Controller  
**Dependency Level:** 3  
**Name:** ProgressController  
**Type:** Controller  
**Relative Path:** api/progress/progress.controller.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** progressService  
**Type:** ProgressService  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** handleGetFullProgress  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** handleSynchronizeProgress  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Progress API Endpoint Handling
    
**Requirement Ids:**
    
    - REQ-PDP-001
    - REQ-PDP-002
    
**Purpose:** To expose endpoints for fetching and synchronizing player progress, delegating the core logic to the ProgressService.  
**Logic Description:** This controller defines async handler functions for GET and POST requests. It extracts the authenticated player ID from 'req.user', calls the corresponding method on the 'ProgressService', and sends the returned data as a JSON response with a 200 status code. It uses a try-catch block to pass errors to the global error handler.  
**Documentation:**
    
    - **Summary:** The presentation layer component for the player progress resource. It manages HTTP requests and responses, interacting with the ProgressService.
    
**Namespace:** GlyphWeaver.Backend.Api.Progress  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/progress/progress.router.ts  
**Description:** Express router for the /progress API endpoints.  
**Template:** Express Router  
**Dependency Level:** 4  
**Name:** progressRouter  
**Type:** Router  
**Relative Path:** api/progress/progress.router.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Progress API Routing
    
**Requirement Ids:**
    
    
**Purpose:** To define the specific HTTP routes for the player progress resource, such as 'GET /' and 'POST /sync', and map them to the controller's handler functions.  
**Logic Description:** Creates a new Express Router instance. It uses the 'authMiddleware' to protect all routes. It defines a 'GET /' route to get all progress and a 'POST /sync' route to update progress, linking them to the appropriate methods in the 'ProgressController'.  
**Documentation:**
    
    - **Summary:** This file sets up the routing table for all endpoints related to player progress.
    
**Namespace:** GlyphWeaver.Backend.Api.Progress  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/data-privacy/dataPrivacy.service.ts  
**Description:** Application service for handling data privacy requests (GDPR/CCPA).  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** DataPrivacyService  
**Type:** Service  
**Relative Path:** api/data-privacy/dataPrivacy.service.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - Service Layer Pattern
    
**Members:**
    
    - **Name:** playerRepository  
**Type:** PlayerRepository  
**Attributes:** private  
    - **Name:** auditService  
**Type:** AuditService  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** requestDataExport  
**Parameters:**
    
    - playerId: string
    
**Return Type:** Promise<PlayerDataExportDto>  
**Attributes:** public  
    - **Name:** requestDataDeletion  
**Parameters:**
    
    - playerId: string
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Data Access Request Handling
    - Data Deletion Request Handling
    
**Requirement Ids:**
    
    - REQ-SEC-012
    - REQ-SEC-014
    - REQ-8-018
    
**Purpose:** To provide the business logic for fulfilling user requests for data access and deletion, ensuring compliance with privacy regulations.  
**Logic Description:** The 'requestDataExport' method will gather all data associated with a player ID from various repositories (Player, Progress, Inventory) and compile it. The 'requestDataDeletion' method will perform a soft or hard delete of the player's data, depending on policy. Both methods will log the action using the 'AuditService'.  
**Documentation:**
    
    - **Summary:** Encapsulates the logic for processing data subject rights requests under GDPR and CCPA, ensuring all related data is gathered or deleted correctly.
    
**Namespace:** GlyphWeaver.Backend.Api.DataPrivacy  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/api/data-privacy/dataPrivacy.controller.ts  
**Description:** Express controller for data privacy endpoints.  
**Template:** Express Controller  
**Dependency Level:** 3  
**Name:** DataPrivacyController  
**Type:** Controller  
**Relative Path:** api/data-privacy/dataPrivacy.controller.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** dataPrivacyService  
**Type:** DataPrivacyService  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** handleRequestAccess  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** handleRequestDeletion  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Data Privacy API Endpoint Handling
    
**Requirement Ids:**
    
    - REQ-SEC-012
    - REQ-8-018
    
**Purpose:** To expose secure endpoints for users to initiate data access or deletion requests, delegating the logic to the DataPrivacyService.  
**Logic Description:** This controller defines handlers for POST requests to '/access' and '/deletion'. It uses the authenticated player ID from the JWT to ensure users can only request their own data. It calls the service layer and returns an appropriate success response (e.g., the data export for access, or a 204 No Content for deletion).  
**Documentation:**
    
    - **Summary:** The presentation layer for data privacy requests, managing HTTP interactions and invoking the appropriate service logic.
    
**Namespace:** GlyphWeaver.Backend.Api.DataPrivacy  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/data-privacy/dataPrivacy.router.ts  
**Description:** Express router for the /data-privacy API endpoints.  
**Template:** Express Router  
**Dependency Level:** 4  
**Name:** dataPrivacyRouter  
**Type:** Router  
**Relative Path:** api/data-privacy/dataPrivacy.router.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Data Privacy API Routing
    
**Requirement Ids:**
    
    
**Purpose:** To define the specific HTTP routes for data privacy requests, such as 'POST /access' and 'POST /deletion', and map them to the controller.  
**Logic Description:** Creates an Express Router. Applies the 'authMiddleware' to all routes. It maps the POST routes to the handler functions in 'DataPrivacyController', ensuring that only authenticated users can make these requests.  
**Documentation:**
    
    - **Summary:** This file sets up the routing table for all endpoints related to data privacy and GDPR/CCPA compliance.
    
**Namespace:** GlyphWeaver.Backend.Api.DataPrivacy  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/inventory/inventory.service.ts  
**Description:** Application service to handle player inventory (virtual currency, consumables).  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** InventoryService  
**Type:** Service  
**Relative Path:** api/inventory/inventory.service.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - Service Layer Pattern
    
**Members:**
    
    - **Name:** inventoryRepository  
**Type:** PlayerInventoryRepository  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** getPlayerInventory  
**Parameters:**
    
    - playerId: string
    
**Return Type:** Promise<PlayerInventoryDto>  
**Attributes:** public  
    - **Name:** updatePlayerInventory  
**Parameters:**
    
    - playerId: string
    - updates: InventoryUpdateDto[]
    
**Return Type:** Promise<PlayerInventoryDto>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Server-authoritative inventory management
    
**Requirement Ids:**
    
    - REQ-PDP-004
    - REQ-8-017
    
**Purpose:** To manage server-authoritative inventory items like virtual currency and consumables, providing a single source of truth for these balances.  
**Logic Description:** This service orchestrates reads and writes to the PlayerInventory collection. The 'updatePlayerInventory' method will handle transactions to increment or decrement item quantities, ensuring atomicity where possible (e.g., using Mongoose session transactions for complex updates). This is critical for server-authoritative items.  
**Documentation:**
    
    - **Summary:** Provides the business logic for managing a player's virtual currency and consumable items in a secure, server-authoritative manner.
    
**Namespace:** GlyphWeaver.Backend.Api.Inventory  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/api/inventory/inventory.controller.ts  
**Description:** Express controller for player inventory API endpoints.  
**Template:** Express Controller  
**Dependency Level:** 3  
**Name:** InventoryController  
**Type:** Controller  
**Relative Path:** api/inventory/inventory.controller.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** inventoryService  
**Type:** InventoryService  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** handleGetInventory  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Inventory API Endpoint Handling
    
**Requirement Ids:**
    
    - REQ-PDP-004
    
**Purpose:** To expose endpoints for fetching and potentially updating a player's server-authoritative inventory.  
**Logic Description:** This controller defines async handler functions for inventory-related routes. It extracts the authenticated player ID and passes requests to the 'InventoryService'. It formats the service's response and sends it back to the client.  
**Documentation:**
    
    - **Summary:** The presentation layer for the player inventory resource, managing HTTP requests and invoking the InventoryService.
    
**Namespace:** GlyphWeaver.Backend.Api.Inventory  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/inventory/inventory.router.ts  
**Description:** Express router for the /inventory API endpoints.  
**Template:** Express Router  
**Dependency Level:** 4  
**Name:** inventoryRouter  
**Type:** Router  
**Relative Path:** api/inventory/inventory.router.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Inventory API Routing
    
**Requirement Ids:**
    
    
**Purpose:** To define the HTTP routes for the player inventory resource, such as 'GET /', and map them to the inventory controller.  
**Logic Description:** Creates a new Express Router. It applies the 'authMiddleware' to all routes. It defines a 'GET /' route to fetch the player's inventory and maps it to the 'handleGetInventory' method in the 'InventoryController'.  
**Documentation:**
    
    - **Summary:** This file sets up the routing table for all endpoints related to player inventory.
    
**Namespace:** GlyphWeaver.Backend.Api.Inventory  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/index.ts  
**Description:** Main API router that aggregates all feature-specific routers.  
**Template:** Express Router  
**Dependency Level:** 5  
**Name:** mainApiRouter  
**Type:** Router  
**Relative Path:** api/index.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Route Aggregation
    
**Requirement Ids:**
    
    
**Purpose:** To create a single main router for the API by importing and mounting all the feature-specific routers (player, progress, inventory, data-privacy).  
**Logic Description:** Creates an Express Router. It imports the routers from './player/player.router', './progress/progress.router', etc. It then uses 'router.use()' to mount each feature router under its own path, e.g., 'router.use('/player', playerRouter)'.  
**Documentation:**
    
    - **Summary:** Aggregates all the individual resource routers into a single, modular main router for the application.
    
**Namespace:** GlyphWeaver.Backend.Api  
**Metadata:**
    
    - **Category:** Presentation
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableCustomAccountSystem
  - enableServerAuthoritativeInventory
  
- **Database Configs:**
  
  - MONGODB_URI
  


---

