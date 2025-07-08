# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the project metadata, scripts for running, building, and testing the application, and lists all Node.js dependencies.  
**Template:** Node.js Package Manifest  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Project Dependencies
    - NPM Scripts
    
**Requirement Ids:**
    
    - REQ-8-007
    - REQ-8-023
    
**Purpose:** Manages project dependencies and defines command-line scripts for development, testing, and production builds.  
**Logic Description:** Contains dependencies like express, mongoose, joi, jsonwebtoken, cors, dotenv, and devDependencies like typescript, ts-node, nodemon, jest, supertest. Scripts include 'start', 'build', 'dev', and 'test'.  
**Documentation:**
    
    - **Summary:** Standard Node.js package.json file. It is the entry point for understanding the project's dependencies and available scripts.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration file. Specifies the root files and the compiler options required to compile the project.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Settings
    
**Requirement Ids:**
    
    - REQ-8-007
    - REQ-8-023
    
**Purpose:** Configures the TypeScript compiler with settings like target ECMAScript version, module system, strict type-checking, source map generation, and output directory.  
**Logic Description:** Sets 'target' to 'es2020', 'module' to 'commonjs', 'rootDir' to './src', 'outDir' to './dist', and enables 'strict' and 'esModuleInterop'.  
**Documentation:**
    
    - **Summary:** Defines how TypeScript code in the 'src' directory is transpiled into JavaScript in the 'dist' directory.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/config/index.ts  
**Description:** Centralized configuration module that loads environment variables using dotenv and exports them as a typed configuration object for use throughout the application.  
**Template:** TypeScript Configuration Module  
**Dependency Level:** 0  
**Name:** index  
**Type:** Configuration  
**Relative Path:** config  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** config  
**Type:** object  
**Attributes:** export|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment Variable Loading
    
**Requirement Ids:**
    
    - REQ-8-007
    - REQ-8-023
    
**Purpose:** Provides a single, type-safe source for all application configuration values, abstracting away the use of process.env.  
**Logic Description:** Loads a .env file. Exports an object containing PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, and NODE_ENV. It validates that required variables are present.  
**Documentation:**
    
    - **Summary:** This file centralizes application configuration, making it easy to manage environment-specific settings for development, staging, and production.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/models/game-config.model.ts  
**Description:** Defines the Mongoose schema and model for the 'GameConfiguration' entity, representing dynamic game configurations stored in MongoDB.  
**Template:** Mongoose Model  
**Dependency Level:** 1  
**Name:** GameConfig  
**Type:** Model  
**Relative Path:** models  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - DDD
    
**Members:**
    
    - **Name:** key  
**Type:** string  
**Attributes:** public  
    - **Name:** value  
**Type:** object  
**Attributes:** public  
    - **Name:** lastUpdatedBy  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Game Configuration Schema
    
**Requirement Ids:**
    
    - REQ-8-023
    
**Purpose:** Provides the data structure and database-level validation for game configuration documents.  
**Logic Description:** Defines a Mongoose schema with fields: 'key' (String, required, unique, indexed), 'value' (Mixed, required), 'lastUpdatedBy' (String, optional), and timestamps. Exports the compiled Mongoose model.  
**Documentation:**
    
    - **Summary:** Represents a single game configuration setting, such as feature flags or event parameters, in the database.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/services/interfaces/iaudit.logging.service.ts  
**Description:** Defines the interface (contract) for the Audit Logging Service. This decouples the system and admin controllers from the concrete implementation of audit logging.  
**Template:** TypeScript Interface  
**Dependency Level:** 1  
**Name:** IAuditLoggingService  
**Type:** Interface  
**Relative Path:** services/interfaces  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - Service Layer Pattern
    - Dependency Injection
    
**Members:**
    
    
**Methods:**
    
    - **Name:** logAdminAction  
**Parameters:**
    
    - actorId: string
    - action: string
    - target: { type: string, id: string }
    - details: object
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Audit Logging Contract
    
**Requirement Ids:**
    
    - REQ-AMOT-009
    
**Purpose:** To establish a strict contract for how administrative actions are logged, ensuring consistency and testability.  
**Logic Description:** This file contains only the interface definition. It ensures that any service wanting to log admin actions must provide specific information, such as who performed the action, what the action was, what entity it affected, and any relevant details.  
**Documentation:**
    
    - **Summary:** Defines the contract for logging security-sensitive administrative actions for auditing purposes. Implementations will handle the storage of these logs.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/repositories/interfaces/igame.config.repository.ts  
**Description:** Defines the interface (contract) for the Game Configuration Repository, abstracting the data access logic from the service layer.  
**Template:** TypeScript Interface  
**Dependency Level:** 2  
**Name:** IGameConfigRepository  
**Type:** Interface  
**Relative Path:** repositories/interfaces  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - Repository Pattern
    - Dependency Injection
    
**Members:**
    
    
**Methods:**
    
    - **Name:** findByKey  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<IGameConfig | null>  
**Attributes:** public  
    - **Name:** findAll  
**Parameters:**
    
    
**Return Type:** Promise<IGameConfig[]>  
**Attributes:** public  
    - **Name:** update  
**Parameters:**
    
    - key: string
    - data: Partial<IGameConfig>
    
**Return Type:** Promise<IGameConfig | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Configuration Data Access Contract
    
**Requirement Ids:**
    
    - REQ-8-023
    
**Purpose:** To provide a clear, business-focused contract for persisting and retrieving game configuration data, decoupling the business logic from MongoDB specifics.  
**Logic Description:** This file contains only the interface definition. It outlines the methods required for configuration data operations, such as finding a config by its key, retrieving all configs, and updating a config.  
**Documentation:**
    
    - **Summary:** Defines the contract for data access operations related to game configurations.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/repositories/game.config.repository.ts  
**Description:** Implements the IGameConfigRepository interface, providing concrete data access logic for game configurations using the Mongoose GameConfig model.  
**Template:** TypeScript Repository  
**Dependency Level:** 3  
**Name:** GameConfigRepository  
**Type:** Repository  
**Relative Path:** repositories  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - Repository Pattern
    - Dependency Injection
    
**Members:**
    
    
**Methods:**
    
    - **Name:** findByKey  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<IGameConfig | null>  
**Attributes:** public  
    - **Name:** findAll  
**Parameters:**
    
    
**Return Type:** Promise<IGameConfig[]>  
**Attributes:** public  
    - **Name:** update  
**Parameters:**
    
    - key: string
    - data: Partial<IGameConfig>
    
**Return Type:** Promise<IGameConfig | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Configuration CRUD Operations
    
**Requirement Ids:**
    
    - REQ-8-023
    
**Purpose:** To handle all database interactions for the GameConfiguration collection, translating Mongoose operations into the methods defined by the repository interface.  
**Logic Description:** Implements the IGameConfigRepository. The findByKey method uses 'GameConfig.findOne({ key })'. The findAll method uses 'GameConfig.find()'. The update method uses 'GameConfig.findOneAndUpdate({ key }, data, { new: true })' to update a document and return the new version.  
**Documentation:**
    
    - **Summary:** Concrete implementation for managing game configuration data in MongoDB. It interacts directly with the Mongoose model.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/services/configuration.service.ts  
**Description:** Contains the business logic for managing game configurations. It orchestrates interactions with the repository and handles system health checks.  
**Template:** TypeScript Service  
**Dependency Level:** 4  
**Name:** ConfigurationService  
**Type:** Service  
**Relative Path:** services  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - Service Layer Pattern
    - Dependency Injection
    
**Members:**
    
    - **Name:** gameConfigRepository  
**Type:** IGameConfigRepository  
**Attributes:** private|readonly  
    - **Name:** auditLogService  
**Type:** IAuditLoggingService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getLiveConfiguration  
**Parameters:**
    
    
**Return Type:** Promise<object>  
**Attributes:** public  
    - **Name:** getSystemHealth  
**Parameters:**
    
    
**Return Type:** Promise<object>  
**Attributes:** public  
    - **Name:** getAllConfigurations  
**Parameters:**
    
    
**Return Type:** Promise<IGameConfig[]>  
**Attributes:** public  
    - **Name:** updateConfiguration  
**Parameters:**
    
    - key: string
    - value: object
    - adminId: string
    
**Return Type:** Promise<IGameConfig>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Remote Configuration Fetching
    - System Health Check Logic
    - Admin Configuration Management
    
**Requirement Ids:**
    
    - REQ-8-007
    - REQ-8-023
    - REQ-AMOT-008
    - REQ-AMOT-009
    
**Purpose:** To provide a central point for all business operations related to system health and game configurations, serving both public and administrative endpoints.  
**Logic Description:** The 'getLiveConfiguration' method fetches all configurations and formats them into a key-value object for the client. The 'getSystemHealth' method checks the database connection status and returns a health object. The 'updateConfiguration' method calls the repository to update a config value and then calls the 'IAuditLoggingService' to log the administrative action.  
**Documentation:**
    
    - **Summary:** Orchestrates all logic related to fetching, updating, and monitoring system and game configurations. Interacts with the data layer and audit logging.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/dtos/update-config.dto.ts  
**Description:** Data Transfer Object defining the expected structure for the request body when an administrator updates a game configuration.  
**Template:** TypeScript DTO  
**Dependency Level:** 2  
**Name:** UpdateConfigDto  
**Type:** DTO  
**Relative Path:** dtos  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** value  
**Type:** object  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Configuration Update Contract
    
**Requirement Ids:**
    
    - REQ-8-023
    - REQ-AMOT-009
    
**Purpose:** To provide a clear and strongly-typed contract for the API's configuration update endpoint, used for validation and controller method signatures.  
**Logic Description:** A simple class or interface with a single property 'value' of type 'any' or 'object'. This defines the shape of the data that must be sent to update a configuration.  
**Documentation:**
    
    - **Summary:** Defines the request payload structure for updating a game configuration value.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Dtos  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/validation/config.validation.ts  
**Description:** Contains Joi validation schemas for validating incoming requests related to game configuration management.  
**Template:** Joi Validation Schema  
**Dependency Level:** 3  
**Name:** configValidation  
**Type:** Validator  
**Relative Path:** validation  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** updateConfigSchema  
**Type:** Joi.ObjectSchema  
**Attributes:** export|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Configuration Request Validation
    
**Requirement Ids:**
    
    - REQ-8-023
    - REQ-AMOT-009
    
**Purpose:** To ensure that data sent to administrative configuration endpoints is well-formed and valid before being processed by the service layer.  
**Logic Description:** Exports a 'updateConfigSchema' object created with Joi. It defines that the request body must be an object with a required 'value' property, which itself must be an object. This protects the endpoint from invalid input.  
**Documentation:**
    
    - **Summary:** Provides Joi schemas for validating API requests for creating or updating game configurations.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Validation  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/controllers/system.controller.ts  
**Description:** Handles incoming HTTP requests for public system endpoints, such as health checks and fetching live game configurations.  
**Template:** Express.js Controller  
**Dependency Level:** 5  
**Name:** SystemController  
**Type:** Controller  
**Relative Path:** controllers  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - MVC
    
**Members:**
    
    - **Name:** configurationService  
**Type:** ConfigurationService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getHealth  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** getConfig  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Health Check Endpoint Logic
    - Public Configuration Endpoint Logic
    
**Requirement Ids:**
    
    - REQ-8-007
    - REQ-8-023
    - REQ-AMOT-008
    
**Purpose:** To act as the presentation layer for system-level information, delegating business logic to the ConfigurationService.  
**Logic Description:** The 'getHealth' method calls 'configurationService.getSystemHealth()' and sends a 200 OK response with the health status. The 'getConfig' method calls 'configurationService.getLiveConfiguration()' and sends the configuration object to the client. Both methods use a try-catch block or an async wrapper to pass errors to the global error handler.  
**Documentation:**
    
    - **Summary:** This controller exposes public-facing endpoints for monitoring system health and providing game clients with dynamic configurations.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/controllers/admin.config.controller.ts  
**Description:** Handles incoming HTTP requests for administrative endpoints used to manage game configurations. Requires authentication and admin privileges.  
**Template:** Express.js Controller  
**Dependency Level:** 5  
**Name:** AdminConfigController  
**Type:** Controller  
**Relative Path:** controllers  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - MVC
    
**Members:**
    
    - **Name:** configurationService  
**Type:** ConfigurationService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getAll  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** update  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Admin Configuration Management Endpoints
    
**Requirement Ids:**
    
    - REQ-8-023
    - REQ-AMOT-009
    
**Purpose:** To provide a secure API for administrators to view and modify game configurations remotely, which is a core part of the operational tooling.  
**Logic Description:** The 'getAll' method calls 'configurationService.getAllConfigurations()' to list all settings. The 'update' method retrieves the key from request params and the new value from the request body. It then calls 'configurationService.updateConfiguration', passing the key, value, and the admin's user ID (extracted from the JWT in middleware). Both methods use error handling.  
**Documentation:**
    
    - **Summary:** Exposes secure endpoints for the administrative interface to manage dynamic game configurations. All actions are authenticated and audited.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/routes/index.ts  
**Description:** Main router file that aggregates all feature-specific routers (like system and admin routes) and exports a single router for the main application to use.  
**Template:** Express.js Router Aggregator  
**Dependency Level:** 7  
**Name:** index  
**Type:** Router  
**Relative Path:** routes  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Route Aggregation
    
**Requirement Ids:**
    
    - REQ-8-007
    - REQ-8-023
    - REQ-AMOT-009
    
**Purpose:** To provide a clean, centralized entry point for all API routes, making it easy to manage and version the API.  
**Logic Description:** Creates a main Express Router instance. It imports the system router and the admin config router, and mounts them on specific base paths, for example, 'router.use('/system', systemRoutes)' and 'router.use('/admin/config', adminConfigRoutes)'. Exports the main router.  
**Documentation:**
    
    - **Summary:** Aggregates all the API's routes into a single module for clean integration into the main Express application.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Routes  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/routes/system.routes.ts  
**Description:** Defines the API routes for public system-level operations, mapping HTTP requests to the SystemController's methods.  
**Template:** Express.js Router  
**Dependency Level:** 6  
**Name:** systemRoutes  
**Type:** Router  
**Relative Path:** routes  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - /health route
    - /config route
    
**Requirement Ids:**
    
    - REQ-8-007
    - REQ-8-023
    - REQ-AMOT-008
    
**Purpose:** To declare the specific endpoints, HTTP methods, and corresponding controller actions for the public system API.  
**Logic Description:** Creates an Express Router. Defines a GET route for '/health' that maps to the 'systemController.getHealth' method. Defines a GET route for '/config' that maps to the 'systemController.getConfig' method. Exports the configured router.  
**Documentation:**
    
    - **Summary:** This file sets up the routing for all public system endpoints, connecting the API paths to their respective controller logic.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Routes  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/routes/admin.config.routes.ts  
**Description:** Defines the secure API routes for administrative configuration management, mapping requests to the AdminConfigController and applying necessary middleware.  
**Template:** Express.js Router  
**Dependency Level:** 6  
**Name:** adminConfigRoutes  
**Type:** Router  
**Relative Path:** routes  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Admin configuration management routes
    
**Requirement Ids:**
    
    - REQ-8-023
    - REQ-AMOT-009
    
**Purpose:** To declare the secure endpoints for the operational tooling, ensuring all actions are authenticated, authorized, and validated before processing.  
**Logic Description:** Creates an Express Router. It applies authentication and admin authorization middleware to all routes in this file. It defines a GET route for '/' mapped to 'adminConfigController.getAll' and a PUT route for '/:key' mapped to 'adminConfigController.update'. The PUT route also uses a validation middleware with the Joi schema.  
**Documentation:**
    
    - **Summary:** Sets up routing for secure administrative endpoints, including authentication, authorization, and validation middleware.
    
**Namespace:** GlyphWeaver.Backend.Api.System.Routes  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/app.ts  
**Description:** The main Express application setup file. It configures middleware, mounts the main router, and sets up global error handling.  
**Template:** Express.js Application  
**Dependency Level:** 8  
**Name:** app  
**Type:** Application  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Middleware Configuration
    - Route Mounting
    - Global Error Handling
    
**Requirement Ids:**
    
    - REQ-8-007
    - REQ-8-023
    - REQ-AMOT-009
    
**Purpose:** To construct and configure the Express application instance, bringing together all the different parts like routes, middleware, and error handling.  
**Logic Description:** Creates an Express app instance. Applies essential middleware like cors, express.json(), and a request logger. Mounts the main API router from './routes' to a base path like '/api/v1'. Sets up a 404 handler for unknown routes. Registers the global error handling middleware. Exports the configured app.  
**Documentation:**
    
    - **Summary:** This file is responsible for bootstrapping the Express application, configuring its middleware pipeline, and connecting the routers.
    
**Namespace:** GlyphWeaver.Backend.Api.System  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/server.ts  
**Description:** The entry point of the application. It imports the configured Express app, connects to the database, and starts the HTTP server.  
**Template:** Node.js Server Entrypoint  
**Dependency Level:** 9  
**Name:** server  
**Type:** Application  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Server Initialization
    - Database Connection
    
**Requirement Ids:**
    
    - REQ-8-007
    - REQ-8-023
    
**Purpose:** To initialize and start the entire backend service, including establishing database connections and listening for incoming network requests.  
**Logic Description:** Imports the 'app' from './app.ts' and the 'config' object. Establishes a connection to MongoDB using the URI from the config. Once the database connection is successful, it starts the Express server to listen on the configured PORT. Includes error handling for database connection failures.  
**Documentation:**
    
    - **Summary:** The main executable for the service. It handles the initial database connection and starts the web server to begin accepting requests.
    
**Namespace:** GlyphWeaver.Backend.Api.System  
**Metadata:**
    
    - **Category:** Application
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableCachingForConfig
  - enableDetailedHealthChecks
  
- **Database Configs:**
  
  - MONGO_URI
  


---

