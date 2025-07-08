# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the Node.js project, its dependencies (Express, Mongoose, TypeScript, etc.), and scripts for building, running, and testing the service.  
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
    
    - Project Dependency Management
    
**Requirement Ids:**
    
    - REQ-8-002
    
**Purpose:** Manages project metadata and dependencies for the Player Data Service.  
**Logic Description:** This file will list production dependencies like express, mongoose, cors, dotenv, and development dependencies like typescript, ts-node, nodemon, jest, supertest. It will also contain scripts for 'start', 'build', 'dev', and 'test'.  
**Documentation:**
    
    - **Summary:** Standard npm package file for the microservice, defining its structure and dependencies.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration for the project. Specifies compiler options like target ECMAScript version, module system, strict type-checking, and output directory.  
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
    
    - TypeScript Compilation
    
**Requirement Ids:**
    
    - REQ-8-002
    
**Purpose:** Configures how the TypeScript code is transpiled into JavaScript.  
**Logic Description:** Key settings will include 'target': 'es2020', 'module': 'commonjs', 'rootDir': './src', 'outDir': './dist', 'esModuleInterop': true, 'strict': true, and 'experimentalDecorators': true if needed for DI frameworks.  
**Documentation:**
    
    - **Summary:** Specifies the root files and the compiler options required to compile the TypeScript project.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/index.ts  
**Description:** The main entry point for the Player Data Service application. It initializes the server, connects to the database, and starts listening for incoming requests.  
**Template:** Node.js Express Entry Point  
**Dependency Level:** 4  
**Name:** index  
**Type:** ApplicationEntry  
**Relative Path:** index.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** bootstrap  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** private|async  
    
**Implemented Features:**
    
    - Application Bootstrap
    
**Requirement Ids:**
    
    - REQ-8-002
    
**Purpose:** To start the microservice, setting up all necessary components and connections.  
**Logic Description:** This file will import the server from 'presentation/server.ts' and the database connection logic from 'infrastructure/database/mongo.connection.ts'. It will call the database connection function and then start the Express server on a configured port, handling any startup errors gracefully.  
**Documentation:**
    
    - **Summary:** Initializes and starts the Player Data microservice.
    
**Namespace:** GlyphWeaver.Backend.Player  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/config/index.ts  
**Description:** Centralized configuration management. Loads environment variables from a .env file and provides a typed configuration object to the rest of the application.  
**Template:** Node.js Config Module  
**Dependency Level:** 0  
**Name:** config  
**Type:** Configuration  
**Relative Path:** config/index.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** env  
**Type:** object  
**Attributes:** public|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment Configuration
    
**Requirement Ids:**
    
    - REQ-8-002
    
**Purpose:** To provide a single, type-safe source for all application configuration.  
**Logic Description:** Uses a library like 'dotenv' to load variables from a '.env' file. It exports a frozen object containing typed properties for PORT, MONGODB_URI, JWT_SECRET, and other necessary configuration values, ensuring required variables are present at startup.  
**Documentation:**
    
    - **Summary:** Loads and exports all environment-specific configurations for the application.
    
**Namespace:** GlyphWeaver.Backend.Player.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/domain/aggregates/player-profile.aggregate.ts  
**Description:** The root aggregate for the Player domain. Encapsulates the player's profile, settings, inventory, and progress, enforcing all business rules and invariants.  
**Template:** TypeScript DDD Aggregate  
**Dependency Level:** 1  
**Name:** PlayerProfile  
**Type:** AggregateRoot  
**Relative Path:** domain/aggregates/player-profile.aggregate.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - DomainDrivenDesign
    - Aggregate
    
**Members:**
    
    - **Name:** _id  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** username  
**Type:** string  
**Attributes:** private  
    - **Name:** settings  
**Type:** UserSettings  
**Attributes:** private  
    - **Name:** inventory  
**Type:** Inventory  
**Attributes:** private  
    - **Name:** progress  
**Type:** Map<string, LevelProgress>  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** create  
**Parameters:**
    
    - createDto: object
    
**Return Type:** PlayerProfile  
**Attributes:** public|static  
    - **Name:** updateLevelProgress  
**Parameters:**
    
    - levelId: string
    - progressData: object
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** updateSettings  
**Parameters:**
    
    - newSettings: UserSettings
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** creditCurrency  
**Parameters:**
    
    - amount: number
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** debitCurrency  
**Parameters:**
    
    - amount: number
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** resolveSaveConflict  
**Parameters:**
    
    - cloudData: object
    
**Return Type:** object  
**Attributes:** public  
    
**Implemented Features:**
    
    - Player State Management
    - Business Rule Enforcement
    - Save Conflict Resolution Logic
    
**Requirement Ids:**
    
    - REQ-PDP-002
    - REQ-PDP-004
    - REQ-PDP-006
    - REQ-ACC-010
    
**Purpose:** To model the core Player entity and enforce all business logic related to its state changes.  
**Logic Description:** This class will be the heart of the domain. It will contain methods that modify the player's state while ensuring invariants are maintained (e.g., currency cannot go below zero). The 'updateLevelProgress' method will handle logic for updating scores and star ratings. The 'resolveSaveConflict' method will implement the logic from REQ-PDP-006, comparing timestamps and returning the resolved state. All state changes should be private, exposed only through public methods that enforce rules.  
**Documentation:**
    
    - **Summary:** Represents a player in the game, acting as the aggregate root for all player-related data and business logic.
    
**Namespace:** GlyphWeaver.Backend.Player.Domain.Aggregates  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/entities/level-progress.entity.ts  
**Description:** Represents a player's progress on a single level. It is an entity within the PlayerProfile aggregate.  
**Template:** TypeScript DDD Entity  
**Dependency Level:** 0  
**Name:** LevelProgress  
**Type:** Entity  
**Relative Path:** domain/entities/level-progress.entity.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - DomainDrivenDesign
    - Entity
    
**Members:**
    
    - **Name:** levelId  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** bestScore  
**Type:** number  
**Attributes:** public  
    - **Name:** starsEarned  
**Type:** number  
**Attributes:** public  
    - **Name:** completionTime  
**Type:** number  
**Attributes:** public  
    - **Name:** attempts  
**Type:** number  
**Attributes:** public  
    
**Methods:**
    
    - **Name:** update  
**Parameters:**
    
    - newScore: number
    - newTime: number
    
**Return Type:** void  
**Attributes:** public  
    
**Implemented Features:**
    
    - Level Progress Tracking
    
**Requirement Ids:**
    
    - REQ-PDP-002
    
**Purpose:** To encapsulate the state and behavior of a player's progress on a specific level.  
**Logic Description:** A simple entity class holding properties for level progress. The 'update' method will contain logic to check if the new score is higher than the best score and update properties accordingly.  
**Documentation:**
    
    - **Summary:** Models the progress data for one level, including score, stars, and completion time.
    
**Namespace:** GlyphWeaver.Backend.Player.Domain.Entities  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/entities/inventory.entity.ts  
**Description:** Represents the player's inventory of virtual currency and consumable items. It is an entity within the PlayerProfile aggregate.  
**Template:** TypeScript DDD Entity  
**Dependency Level:** 0  
**Name:** Inventory  
**Type:** Entity  
**Relative Path:** domain/entities/inventory.entity.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - DomainDrivenDesign
    - Entity
    
**Members:**
    
    - **Name:** glyphOrbs  
**Type:** number  
**Attributes:** private  
    - **Name:** hints  
**Type:** number  
**Attributes:** private  
    - **Name:** undos  
**Type:** number  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** addCurrency  
**Parameters:**
    
    - amount: number
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** spendCurrency  
**Parameters:**
    
    - amount: number
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** addConsumable  
**Parameters:**
    
    - type: string
    - quantity: number
    
**Return Type:** void  
**Attributes:** public  
    
**Implemented Features:**
    
    - Virtual Currency Management
    - Consumable Item Management
    
**Requirement Ids:**
    
    - REQ-PDP-004
    - REQ-8-004
    
**Purpose:** To manage the balances of server-authoritative items and currency for a player.  
**Logic Description:** This class will hold inventory quantities. Methods like 'spendCurrency' will throw a custom DomainException if the balance is insufficient, ensuring business rules are enforced. This provides a single place to manage all inventory-related logic.  
**Documentation:**
    
    - **Summary:** Encapsulates the player's virtual currency and consumable items, managing all balance modifications.
    
**Namespace:** GlyphWeaver.Backend.Player.Domain.Entities  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/value-objects/user-settings.value-object.ts  
**Description:** Represents the player's settings, including audio and accessibility options. As a value object, it is immutable.  
**Template:** TypeScript DDD ValueObject  
**Dependency Level:** 0  
**Name:** UserSettings  
**Type:** ValueObject  
**Relative Path:** domain/value-objects/user-settings.value-object.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - DomainDrivenDesign
    - ValueObject
    
**Members:**
    
    - **Name:** musicVolume  
**Type:** number  
**Attributes:** public|readonly  
    - **Name:** sfxVolume  
**Type:** number  
**Attributes:** public|readonly  
    - **Name:** colorblindMode  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** textSize  
**Type:** number  
**Attributes:** public|readonly  
    - **Name:** reducedMotion  
**Type:** boolean  
**Attributes:** public|readonly  
    
**Methods:**
    
    - **Name:** equals  
**Parameters:**
    
    - other: UserSettings
    
**Return Type:** boolean  
**Attributes:** public  
    
**Implemented Features:**
    
    - Accessibility Settings Storage
    - Audio Settings Storage
    
**Requirement Ids:**
    
    - REQ-ACC-010
    - REQ-PDP-002
    
**Purpose:** To immutably hold a player's configuration preferences.  
**Logic Description:** A class with a constructor that initializes all readonly properties. It will have an 'equals' method to compare two UserSettings objects by value, which is a key characteristic of a Value Object.  
**Documentation:**
    
    - **Summary:** Models the collection of user-configurable settings as an immutable value object.
    
**Namespace:** GlyphWeaver.Backend.Player.Domain.ValueObjects  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/repositories/iplayer-profile.repository.ts  
**Description:** Interface defining the contract for data persistence operations related to the PlayerProfile aggregate.  
**Template:** TypeScript Repository Interface  
**Dependency Level:** 2  
**Name:** IPlayerProfileRepository  
**Type:** RepositoryInterface  
**Relative Path:** domain/repositories/iplayer-profile.repository.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - RepositoryPattern
    - DependencyInversion
    
**Members:**
    
    
**Methods:**
    
    - **Name:** findById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<PlayerProfile | null>  
**Attributes:** public  
    - **Name:** findByUsername  
**Parameters:**
    
    - username: string
    
**Return Type:** Promise<PlayerProfile | null>  
**Attributes:** public  
    - **Name:** save  
**Parameters:**
    
    - playerProfile: PlayerProfile
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** delete  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Data Persistence Contract
    
**Requirement Ids:**
    
    - REQ-PDP-002
    - REQ-SEC-012
    
**Purpose:** To decouple the domain logic from the specific data persistence technology.  
**Logic Description:** This TypeScript interface will define the methods that any PlayerProfile repository implementation must have. It ensures that the application layer can work with player data without knowing about MongoDB or Mongoose.  
**Documentation:**
    
    - **Summary:** Defines the contract for storing and retrieving PlayerProfile aggregates.
    
**Namespace:** GlyphWeaver.Backend.Player.Domain.Repositories  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/application/services/player.service.ts  
**Description:** Application service that orchestrates use cases related to player profile management, such as creation, updates, and fetching player data.  
**Template:** TypeScript Application Service  
**Dependency Level:** 3  
**Name:** PlayerService  
**Type:** Service  
**Relative Path:** application/services/player.service.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - ServiceLayerPattern
    - DependencyInjection
    
**Members:**
    
    - **Name:** playerProfileRepository  
**Type:** IPlayerProfileRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getPlayerById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<PlayerProfileDto>  
**Attributes:** public|async  
    - **Name:** createPlayer  
**Parameters:**
    
    - createPlayerDto: CreatePlayerDto
    
**Return Type:** Promise<PlayerProfileDto>  
**Attributes:** public|async  
    - **Name:** updatePlayerSettings  
**Parameters:**
    
    - playerId: string
    - settingsDto: UserSettingsDto
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - Player Profile CRUD
    - Player Settings Update
    
**Requirement Ids:**
    
    - REQ-PDP-002
    - REQ-ACC-010
    
**Purpose:** To provide a high-level API for player-related operations, coordinating domain and infrastructure layers.  
**Logic Description:** This service will be injected with the IPlayerProfileRepository. Methods like 'updatePlayerSettings' will fetch the aggregate from the repository, call the aggregate's business method (e.g., 'player.updateSettings()'), and then save the modified aggregate back to the repository. It handles the transaction-like script for each use case.  
**Documentation:**
    
    - **Summary:** Orchestrates all use cases involving the creation, retrieval, and modification of player profiles and their settings.
    
**Namespace:** GlyphWeaver.Backend.Player.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/application/services/cloud-save.service.ts  
**Description:** Handles the application logic for cloud data synchronization, including fetching, comparing, and resolving conflicts between local (client-provided) and stored data.  
**Template:** TypeScript Application Service  
**Dependency Level:** 3  
**Name:** CloudSaveService  
**Type:** Service  
**Relative Path:** application/services/cloud-save.service.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - ServiceLayerPattern
    - DependencyInjection
    
**Members:**
    
    - **Name:** playerProfileRepository  
**Type:** IPlayerProfileRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** synchronizePlayerData  
**Parameters:**
    
    - playerId: string
    - clientSaveData: ClientSaveDto
    
**Return Type:** Promise<SyncResultDto>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - Cloud Save Synchronization
    - Conflict Resolution Orchestration
    
**Requirement Ids:**
    
    - REQ-PDP-001
    - REQ-PDP-006
    
**Purpose:** To orchestrate the complex process of synchronizing player data from the cloud.  
**Logic Description:** The 'synchronizePlayerData' method will be the core. It fetches the current server-side PlayerProfile aggregate, receives the client's data, and then calls the aggregate's 'resolveSaveConflict' method. The result of the resolution is then saved back via the repository, and a DTO is returned to the controller indicating the outcome (e.g., success, conflict_prompt_user).  
**Documentation:**
    
    - **Summary:** Manages the use case for synchronizing a player's save data between the client and the server, handling conflict resolution.
    
**Namespace:** GlyphWeaver.Backend.Player.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/application/services/privacy.service.ts  
**Description:** Handles data privacy requests, such as data access (export) and deletion, in compliance with regulations like GDPR and CCPA.  
**Template:** TypeScript Application Service  
**Dependency Level:** 3  
**Name:** PrivacyService  
**Type:** Service  
**Relative Path:** application/services/privacy.service.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - ServiceLayerPattern
    - DependencyInjection
    
**Members:**
    
    - **Name:** playerProfileRepository  
**Type:** IPlayerProfileRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** requestDataExport  
**Parameters:**
    
    - playerId: string
    
**Return Type:** Promise<PlayerDataExportDto>  
**Attributes:** public|async  
    - **Name:** requestDataDeletion  
**Parameters:**
    
    - playerId: string
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - GDPR Data Access
    - GDPR Data Deletion (Right to be Forgotten)
    
**Requirement Ids:**
    
    - REQ-SEC-012
    
**Purpose:** To provide a secure and compliant way to handle user data privacy requests.  
**Logic Description:** The 'requestDataExport' method will fetch all data associated with a player from the repository and format it into a portable format (e.g., JSON). The 'requestDataDeletion' method will call the repository's delete method, which might perform a soft or hard delete based on policy. It will also be responsible for kicking off any necessary deletions in other systems if required.  
**Documentation:**
    
    - **Summary:** Orchestrates the fulfillment of player data access and deletion requests.
    
**Namespace:** GlyphWeaver.Backend.Player.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/infrastructure/database/mongo.connection.ts  
**Description:** Manages the connection to the MongoDB database using Mongoose. Handles connection logic, events, and provides a single connection instance.  
**Template:** Node.js Database Connector  
**Dependency Level:** 1  
**Name:** MongoConnection  
**Type:** DatabaseConnector  
**Relative Path:** infrastructure/database/mongo.connection.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - Singleton
    
**Members:**
    
    
**Methods:**
    
    - **Name:** connect  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** public|static  
    - **Name:** disconnect  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** public|static  
    
**Implemented Features:**
    
    - Database Connection Management
    
**Requirement Ids:**
    
    - REQ-8-002
    
**Purpose:** To abstract and manage the lifecycle of the MongoDB database connection.  
**Logic Description:** This file will use the MONGODB_URI from the config. It will define a 'connect' function that calls 'mongoose.connect' and sets up event listeners for 'connected', 'error', and 'disconnected' events, logging them appropriately. It will export this connect function to be called at application startup.  
**Documentation:**
    
    - **Summary:** Provides a centralized mechanism for establishing and managing the connection to the MongoDB database.
    
**Namespace:** GlyphWeaver.Backend.Player.Infrastructure.Database  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/repositories/player-profile.repository.ts  
**Description:** Mongoose-based implementation of the IPlayerProfileRepository interface. Handles all CRUD operations for PlayerProfile documents in MongoDB.  
**Template:** TypeScript Mongoose Repository  
**Dependency Level:** 3  
**Name:** PlayerProfileRepository  
**Type:** Repository  
**Relative Path:** infrastructure/repositories/player-profile.repository.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** playerProfileModel  
**Type:** Model<IPlayerProfile>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** findById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<PlayerProfile | null>  
**Attributes:** public|async  
    - **Name:** save  
**Parameters:**
    
    - playerProfile: PlayerProfile
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - Player Data Persistence
    
**Requirement Ids:**
    
    - REQ-PDP-002
    - REQ-SEC-012
    
**Purpose:** To provide a concrete implementation for persisting and retrieving player data from MongoDB.  
**Logic Description:** This class will implement the IPlayerProfileRepository. It will use the Mongoose model for PlayerProfile to perform database operations. The 'save' method will handle both creation and updates using 'findByIdAndUpdate' with 'upsert: true'. The 'findById' method will fetch a document and map it back to a domain 'PlayerProfile' aggregate instance.  
**Documentation:**
    
    - **Summary:** Implements the data access logic for PlayerProfile aggregates using Mongoose and MongoDB.
    
**Namespace:** GlyphWeaver.Backend.Player.Infrastructure.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/models/player-profile.model.ts  
**Description:** Defines the Mongoose schema and model for the PlayerProfile collection. This includes embedded schemas for settings, inventory, and progress.  
**Template:** TypeScript Mongoose Schema  
**Dependency Level:** 2  
**Name:** PlayerProfileModel  
**Type:** Model  
**Relative Path:** infrastructure/models/player-profile.model.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** PlayerProfileSchema  
**Type:** Schema  
**Attributes:** private|static  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Player Data Schema Definition
    
**Requirement Ids:**
    
    - REQ-8-004
    - REQ-PDP-002
    - REQ-ACC-010
    
**Purpose:** To define the structure of player data as it is stored in the MongoDB database.  
**Logic Description:** This file will define several Mongoose schemas: one for UserSettings, one for Inventory, one for LevelProgress, and the main PlayerProfileSchema which embeds the others. It will define types, required fields, and default values. Timestamps will be enabled. It will export the compiled Mongoose model.  
**Documentation:**
    
    - **Summary:** Defines the database schema for the 'playerprofiles' collection using Mongoose.
    
**Namespace:** GlyphWeaver.Backend.Player.Infrastructure.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/presentation/controllers/player.controller.ts  
**Description:** Express controller to handle HTTP requests related to player profiles, including fetching data and updating settings.  
**Template:** Node.js Express Controller  
**Dependency Level:** 4  
**Name:** PlayerController  
**Type:** Controller  
**Relative Path:** presentation/controllers/player.controller.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - ModelView-Controller
    
**Members:**
    
    - **Name:** playerService  
**Type:** PlayerService  
**Attributes:** private|readonly  
    - **Name:** cloudSaveService  
**Type:** CloudSaveService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getProfile  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    - **Name:** updateSettings  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    - **Name:** syncProfile  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - Player Profile API
    - Cloud Save API
    
**Requirement Ids:**
    
    - REQ-PDP-001
    - REQ-PDP-002
    - REQ-PDP-006
    - REQ-ACC-010
    
**Purpose:** To expose player data management and synchronization functionality via a RESTful API.  
**Logic Description:** This controller will define route handlers. Each handler will extract data from the request (params, body), call the appropriate application service method (e.g., playerService.getPlayerById), and then send a formatted JSON response with the correct HTTP status code. It will use try-catch blocks to pass errors to the global error handling middleware.  
**Documentation:**
    
    - **Summary:** Handles all incoming HTTP requests for the /players and /sync endpoints.
    
**Namespace:** GlyphWeaver.Backend.Player.Presentation.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/presentation/controllers/privacy.controller.ts  
**Description:** Express controller for handling data privacy-related HTTP requests, such as data export and deletion.  
**Template:** Node.js Express Controller  
**Dependency Level:** 4  
**Name:** PrivacyController  
**Type:** Controller  
**Relative Path:** presentation/controllers/privacy.controller.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    - ModelView-Controller
    
**Members:**
    
    - **Name:** privacyService  
**Type:** PrivacyService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** exportData  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    - **Name:** deleteData  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - Data Subject Request API
    
**Requirement Ids:**
    
    - REQ-SEC-012
    
**Purpose:** To expose endpoints for users to exercise their data privacy rights.  
**Logic Description:** This controller will have endpoints like POST /privacy/export and DELETE /privacy/delete. These handlers will be protected by authentication middleware to identify the user making the request. They will call the corresponding PrivacyService methods and return appropriate success or error responses.  
**Documentation:**
    
    - **Summary:** Handles HTTP requests related to GDPR/CCPA data access and deletion.
    
**Namespace:** GlyphWeaver.Backend.Player.Presentation.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/presentation/routes/index.ts  
**Description:** Main router file that aggregates all feature-specific routers (player, privacy) and exposes them to the main server application.  
**Template:** Node.js Express Router  
**Dependency Level:** 5  
**Name:** mainRouter  
**Type:** Router  
**Relative Path:** presentation/routes/index.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Routing
    
**Requirement Ids:**
    
    - REQ-8-002
    
**Purpose:** To centralize the API routing configuration for the entire microservice.  
**Logic Description:** This file will create a main Express router. It will import routers from 'player.routes.ts' and 'privacy.routes.ts' and mount them on specific paths (e.g., router.use('/v1/players', playerRoutes)). This main router is then exported to be used by the server.  
**Documentation:**
    
    - **Summary:** Aggregates all API routes and applies global middleware if necessary.
    
**Namespace:** GlyphWeaver.Backend.Player.Presentation.Routes  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/presentation/server.ts  
**Description:** Configures and creates the Express application instance. It sets up all middleware, routes, and error handling.  
**Template:** Node.js Express Server Setup  
**Dependency Level:** 6  
**Name:** server  
**Type:** Server  
**Relative Path:** presentation/server.ts  
**Repository Id:** REPO-GLYPH-PLAYER  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** create  
**Parameters:**
    
    
**Return Type:** Express  
**Attributes:** public|static  
    
**Implemented Features:**
    
    - HTTP Server Configuration
    - Middleware Integration
    
**Requirement Ids:**
    
    - REQ-8-002
    
**Purpose:** To create and configure the Express server instance.  
**Logic Description:** This file exports a function that creates an Express app. Inside this function, it will apply essential middleware like 'cors', 'express.json()'. It will then mount the main router from 'routes/index.ts'. Finally, it will apply the global error handling middleware. This keeps the main 'index.ts' clean.  
**Documentation:**
    
    - **Summary:** Creates, configures, and exports the Express application instance with all necessary middleware and routes.
    
**Namespace:** GlyphWeaver.Backend.Player.Presentation  
**Metadata:**
    
    - **Category:** Presentation
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableCloudSaveConflictPrompt
  - enableServerAuthoritativeInventory
  
- **Database Configs:**
  
  - MONGODB_URI
  


---

