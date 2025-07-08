# Specification

# 1. Files

- **Path:** src/domain/entities/game-configuration.entity.ts  
**Description:** Defines the GameConfiguration aggregate root. This entity encapsulates a specific configuration item, its value, and metadata. It contains the core business logic for updating its value and tracking its version.  
**Template:** TypeScript Class  
**Dependency Level:** 0  
**Name:** GameConfiguration  
**Type:** Entity  
**Relative Path:** domain/entities/game-configuration.entity.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - DDD-Aggregate
    - DDD-Entity
    
**Members:**
    
    - **Name:** _id  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** key  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** value  
**Type:** any  
**Attributes:** private  
    - **Name:** version  
**Type:** number  
**Attributes:** public  
    - **Name:** description  
**Type:** string  
**Attributes:** public  
    - **Name:** updatedAt  
**Type:** Date  
**Attributes:** public  
    - **Name:** lastUpdatedBy  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - props: { id?: string; key: string; value: any; version: number; description: string; updatedAt: Date; lastUpdatedBy: string }
    
**Return Type:** GameConfiguration  
**Attributes:** public  
    - **Name:** updateValue  
**Parameters:**
    
    - newValue: any
    - updatedBy: string
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** getValue  
**Parameters:**
    
    
**Return Type:** any  
**Attributes:** public  
    
**Implemented Features:**
    
    - Game Configuration Entity
    
**Requirement Ids:**
    
    - REQ-8-023
    
**Purpose:** To represent a single, versioned game configuration setting as a core domain entity.  
**Logic Description:** The constructor initializes the configuration. The updateValue method changes the configuration's value, increments the version, and updates the timestamp and editor's identity. This ensures that the entity's invariants are always maintained.  
**Documentation:**
    
    - **Summary:** This file contains the core GameConfiguration entity, which is the aggregate root for all configuration-related operations. It manages its own state and business rules.
    
**Namespace:** GlyphWeaver.Backend.System.Domain.Entities  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/repositories/game-configuration.repository.ts  
**Description:** Defines the interface (port) for the Game Configuration repository. This contract ensures that the domain logic is decoupled from the specific data persistence technology (e.g., MongoDB).  
**Template:** TypeScript Interface  
**Dependency Level:** 0  
**Name:** IGameConfigurationRepository  
**Type:** Interface  
**Relative Path:** domain/repositories/game-configuration.repository.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - RepositoryPattern
    - DDD-Repository
    
**Members:**
    
    
**Methods:**
    
    - **Name:** findByKey  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<GameConfiguration | null>  
**Attributes:** public  
    - **Name:** findAll  
**Parameters:**
    
    
**Return Type:** Promise<GameConfiguration[]>  
**Attributes:** public  
    - **Name:** save  
**Parameters:**
    
    - config: GameConfiguration
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Configuration Repository Contract
    
**Requirement Ids:**
    
    - REQ-8-023
    
**Purpose:** To define a contract for data persistence operations related to GameConfiguration entities, abstracting the storage mechanism.  
**Logic Description:** This interface declares the essential methods for interacting with game configuration data: finding a configuration by its unique key, retrieving all configurations, and saving a configuration (for both creation and updates).  
**Documentation:**
    
    - **Summary:** Provides the IGameConfigurationRepository interface, which defines the persistence contract for the GameConfiguration aggregate. The Application layer will depend on this interface, not the concrete implementation.
    
**Namespace:** GlyphWeaver.Backend.System.Domain.Repositories  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/repositories/audit-log.repository.ts  
**Description:** Defines the interface (port) for the Audit Log repository. This contract ensures that the domain logic for auditing is decoupled from the specific data persistence technology.  
**Template:** TypeScript Interface  
**Dependency Level:** 0  
**Name:** IAuditLogRepository  
**Type:** Interface  
**Relative Path:** domain/repositories/audit-log.repository.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - RepositoryPattern
    - DDD-Repository
    
**Members:**
    
    
**Methods:**
    
    - **Name:** create  
**Parameters:**
    
    - logData: { eventType: string; actorId: string; details: any; status: 'success' | 'failure' }
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Audit Log Repository Contract
    
**Requirement Ids:**
    
    - REQ-AMOT-009
    
**Purpose:** To define a contract for creating audit log entries for significant administrative actions.  
**Logic Description:** This interface declares a single method, `create`, which is responsible for persisting a new audit log entry into the data store.  
**Documentation:**
    
    - **Summary:** Provides the IAuditLogRepository interface, defining the persistence contract for creating audit log entries. This decouples the auditing logic from the database.
    
**Namespace:** GlyphWeaver.Backend.System.Domain.Repositories  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/application/services/configuration.service.ts  
**Description:** Application service that orchestrates the use cases for managing game configurations. It uses the repository interface to interact with the data layer and encapsulates the business logic for configuration management.  
**Template:** TypeScript Class  
**Dependency Level:** 1  
**Name:** ConfigurationService  
**Type:** Service  
**Relative Path:** application/services/configuration.service.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - ServiceLayerPattern
    - DependencyInjection
    
**Members:**
    
    - **Name:** configRepo  
**Type:** IGameConfigurationRepository  
**Attributes:** private|readonly  
    - **Name:** auditRepo  
**Type:** IAuditLogRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - configRepo: IGameConfigurationRepository
    - auditRepo: IAuditLogRepository
    
**Return Type:** ConfigurationService  
**Attributes:** public  
    - **Name:** getConfigurationByKey  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<{ key: string; value: any; version: number }>  
**Attributes:** public  
    - **Name:** getAllConfigurations  
**Parameters:**
    
    
**Return Type:** Promise<{ key: string; value: any; version: number }[]>  
**Attributes:** public  
    - **Name:** updateConfiguration  
**Parameters:**
    
    - key: string
    - newValue: any
    - actorId: string
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Get Configuration Use Case
    - Update Configuration Use Case
    - Audit Logging for Configuration Changes
    
**Requirement Ids:**
    
    - REQ-8-023
    - REQ-AMOT-009
    
**Purpose:** To provide a high-level API for managing game configurations and to ensure all changes are audited.  
**Logic Description:** This service handles the business logic for configuration management. The `updateConfiguration` method fetches the existing configuration, calls the domain entity's update method, saves the updated entity via the repository, and then creates a detailed audit log entry for the action. It depends on repository interfaces, not concrete implementations.  
**Documentation:**
    
    - **Summary:** This service layer component orchestrates all operations related to game configurations. It acts as the primary entry point for the controllers to execute configuration-related business logic.
    
**Namespace:** GlyphWeaver.Backend.System.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/application/services/player-data-request.service.ts  
**Description:** Application service to handle administrative requests for player data access or deletion, in compliance with privacy laws like GDPR and CCPA.  
**Template:** TypeScript Class  
**Dependency Level:** 1  
**Name:** PlayerDataRequestService  
**Type:** Service  
**Relative Path:** application/services/player-data-request.service.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - ServiceLayerPattern
    
**Members:**
    
    - **Name:** auditRepo  
**Type:** IAuditLogRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - auditRepo: IAuditLogRepository
    
**Return Type:** PlayerDataRequestService  
**Attributes:** public  
    - **Name:** processDataDeletionRequest  
**Parameters:**
    
    - playerId: string
    - actorId: string
    
**Return Type:** Promise<{ success: boolean; message: string }>  
**Attributes:** public  
    - **Name:** processDataAccessRequest  
**Parameters:**
    
    - playerId: string
    - actorId: string
    
**Return Type:** Promise<{ success: boolean; data: any }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Player Data Deletion Fulfillment
    - Player Data Access Fulfillment
    - Auditing of Data Requests
    
**Requirement Ids:**
    
    - REQ-SEC-012
    - REQ-AMOT-009
    
**Purpose:** To orchestrate the fulfillment of data subject rights requests, ensuring actions are audited and processed securely.  
**Logic Description:** This service will receive requests from an authenticated administrator. For deletion or access, it will need to communicate with other microservices (e.g., the Player service) to actually perform the data operations. After the operation is complete (or fails), it will create a detailed audit log entry using the IAuditLogRepository. This service itself does not hold player data, it orchestrates the request.  
**Documentation:**
    
    - **Summary:** This service acts as the orchestration layer for fulfilling player data privacy requests. It ensures that every request is handled and properly audited, while delegating the actual data manipulation to the responsible services.
    
**Namespace:** GlyphWeaver.Backend.System.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/application/services/system-health.service.ts  
**Description:** Application service for checking the health of this microservice and other critical downstream services.  
**Template:** TypeScript Class  
**Dependency Level:** 1  
**Name:** SystemHealthService  
**Type:** Service  
**Relative Path:** application/services/system-health.service.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - ServiceLayerPattern
    
**Members:**
    
    - **Name:** downstreamServices  
**Type:** Array<{ name: string; url: string }>  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** getSystemHealth  
**Parameters:**
    
    
**Return Type:** Promise<{ overallStatus: 'UP' | 'DEGRADED' | 'DOWN'; services: { name: string; status: 'UP' | 'DOWN'; details: string }[] }>  
**Attributes:** public  
    - **Name:** checkServiceHealth  
**Parameters:**
    
    - service: { name: string; url: string }
    
**Return Type:** Promise<{ name: string; status: 'UP' | 'DOWN'; details: string }>  
**Attributes:** private  
    
**Implemented Features:**
    
    - System Health Check
    - Downstream Service Health Probing
    
**Requirement Ids:**
    
    - REQ-14
    
**Purpose:** To provide a consolidated health status of the entire game's backend ecosystem, which can be polled by monitoring tools.  
**Logic Description:** The `getSystemHealth` method checks the health of its own dependencies (like the database connection). It then iterates through a list of configured downstream microservice health endpoints, calling each one. It aggregates the statuses into a single response, determining the overall system status based on the health of individual components.  
**Documentation:**
    
    - **Summary:** This service is responsible for providing the system's health check endpoint logic. It consolidates the health status of itself and its critical dependencies into a single, comprehensive report.
    
**Namespace:** GlyphWeaver.Backend.System.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/infrastructure/database/mongoose/models/game-configuration.model.ts  
**Description:** Defines the Mongoose schema and model for the GameConfiguration entity. This maps the domain entity to a MongoDB document.  
**Template:** TypeScript Mongoose Model  
**Dependency Level:** 1  
**Name:** GameConfigurationModel  
**Type:** Model  
**Relative Path:** infrastructure/database/mongoose/models/game-configuration.model.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - ORM
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - MongoDB Schema for Game Configurations
    
**Requirement Ids:**
    
    - REQ-8-023
    
**Purpose:** To define the data structure and validation rules for game configurations as they are stored in MongoDB.  
**Logic Description:** This file will define a Mongoose schema with fields like `key` (string, unique, required), `value` (Mixed), `version` (number), `description` (string), `lastUpdatedBy` (string), and timestamps. It will then export the compiled Mongoose model.  
**Documentation:**
    
    - **Summary:** Contains the Mongoose schema definition for the `game_configurations` collection in MongoDB, enabling structured data access through the Mongoose ODM.
    
**Namespace:** GlyphWeaver.Backend.System.Infrastructure.Database.Mongoose.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/database/mongoose/models/audit-log.model.ts  
**Description:** Defines the Mongoose schema and model for the AuditLog entity. This maps the audit log data to a MongoDB document.  
**Template:** TypeScript Mongoose Model  
**Dependency Level:** 1  
**Name:** AuditLogModel  
**Type:** Model  
**Relative Path:** infrastructure/database/mongoose/models/audit-log.model.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - ORM
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - MongoDB Schema for Audit Logs
    
**Requirement Ids:**
    
    - REQ-AMOT-009
    
**Purpose:** To define the data structure for audit log entries stored in MongoDB.  
**Logic Description:** This file defines a Mongoose schema with fields like `eventType`, `actorId`, `details` (Mixed), `status`, `ipAddress`, and a `timestamp`. It will be configured as a time-series collection if appropriate for performance. The compiled model is exported.  
**Documentation:**
    
    - **Summary:** Contains the Mongoose schema definition for the `audit_logs` collection, which stores records of all significant administrative actions.
    
**Namespace:** GlyphWeaver.Backend.System.Infrastructure.Database.Mongoose.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/database/mongoose/repositories/game-configuration.repository.impl.ts  
**Description:** The concrete implementation of the IGameConfigurationRepository interface using Mongoose to interact with the MongoDB database.  
**Template:** TypeScript Class  
**Dependency Level:** 2  
**Name:** MongoGameConfigurationRepository  
**Type:** Repository  
**Relative Path:** infrastructure/database/mongoose/repositories/game-configuration.repository.impl.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - RepositoryPattern
    - DependencyInjection
    
**Members:**
    
    - **Name:** gameConfigModel  
**Type:** Model<IGameConfigurationDocument>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    
**Return Type:** MongoGameConfigurationRepository  
**Attributes:** public  
    - **Name:** findByKey  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<GameConfiguration | null>  
**Attributes:** public  
    - **Name:** findAll  
**Parameters:**
    
    
**Return Type:** Promise<GameConfiguration[]>  
**Attributes:** public  
    - **Name:** save  
**Parameters:**
    
    - config: GameConfiguration
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Configuration Data Persistence
    
**Requirement Ids:**
    
    - REQ-8-023
    
**Purpose:** To handle all CRUD operations for GameConfiguration entities against a MongoDB database.  
**Logic Description:** Implements the methods defined in `IGameConfigurationRepository`. `findByKey` will use Mongoose's `findOne`. `save` will use `findByIdAndUpdate` with an `upsert` option. The class will also contain mapping logic to convert between the Mongoose document and the domain `GameConfiguration` entity.  
**Documentation:**
    
    - **Summary:** This class provides the concrete implementation for persisting and retrieving GameConfiguration aggregates using Mongoose and MongoDB.
    
**Namespace:** GlyphWeaver.Backend.System.Infrastructure.Database.Mongoose.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/database/mongoose/repositories/audit-log.repository.impl.ts  
**Description:** The concrete implementation of the IAuditLogRepository interface using Mongoose to interact with the MongoDB database.  
**Template:** TypeScript Class  
**Dependency Level:** 2  
**Name:** MongoAuditLogRepository  
**Type:** Repository  
**Relative Path:** infrastructure/database/mongoose/repositories/audit-log.repository.impl.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - RepositoryPattern
    - DependencyInjection
    
**Members:**
    
    - **Name:** auditLogModel  
**Type:** Model<IAuditLogDocument>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    
**Return Type:** MongoAuditLogRepository  
**Attributes:** public  
    - **Name:** create  
**Parameters:**
    
    - logData: { eventType: string; actorId: string; details: any; status: 'success' | 'failure' }
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Audit Log Persistence
    
**Requirement Ids:**
    
    - REQ-AMOT-009
    
**Purpose:** To handle the creation of audit log entries in the MongoDB database.  
**Logic Description:** Implements the `create` method from the `IAuditLogRepository` interface. It will take the log data, create a new Mongoose document, and save it to the database. This is a write-only repository from the application's perspective.  
**Documentation:**
    
    - **Summary:** This class provides the concrete implementation for persisting audit log entries using Mongoose and MongoDB.
    
**Namespace:** GlyphWeaver.Backend.System.Infrastructure.Database.Mongoose.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/presentation/http/controllers/configuration.controller.ts  
**Description:** Express controller to handle all HTTP requests related to game configurations. It acts as the entry point for the API presentation layer for this feature.  
**Template:** TypeScript Class  
**Dependency Level:** 2  
**Name:** ConfigurationController  
**Type:** Controller  
**Relative Path:** presentation/http/controllers/configuration.controller.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - MVC-Controller
    
**Members:**
    
    - **Name:** configService  
**Type:** ConfigurationService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - configService: ConfigurationService
    
**Return Type:** ConfigurationController  
**Attributes:** public  
    - **Name:** getAll  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** getByKey  
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
    
    - Get All Configurations API Endpoint
    - Get Configuration by Key API Endpoint
    - Update Configuration API Endpoint
    
**Requirement Ids:**
    
    - REQ-8-023
    - REQ-AMOT-009
    
**Purpose:** To map HTTP requests to application service calls for configuration management and to format the responses.  
**Logic Description:** Each method in this controller corresponds to an API endpoint. It extracts data from the HTTP request (params, body), validates it, calls the appropriate method on the `ConfigurationService`, and then sends an HTTP response with the result or an error.  
**Documentation:**
    
    - **Summary:** Handles the web layer for configuration management, translating HTTP requests into actions within the application and returning results as JSON.
    
**Namespace:** GlyphWeaver.Backend.System.Presentation.HTTP.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/presentation/http/controllers/player-data.controller.ts  
**Description:** Express controller to handle all administrative HTTP requests related to player data, such as fulfilling data subject rights requests.  
**Template:** TypeScript Class  
**Dependency Level:** 2  
**Name:** PlayerDataController  
**Type:** Controller  
**Relative Path:** presentation/http/controllers/player-data.controller.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - MVC-Controller
    
**Members:**
    
    - **Name:** playerDataRequestService  
**Type:** PlayerDataRequestService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - playerDataRequestService: PlayerDataRequestService
    
**Return Type:** PlayerDataController  
**Attributes:** public  
    - **Name:** requestDeletion  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** requestAccess  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Data Deletion Request API Endpoint
    - Data Access Request API Endpoint
    
**Requirement Ids:**
    
    - REQ-SEC-012
    - REQ-AMOT-009
    
**Purpose:** To expose secure endpoints for administrators to fulfill player data privacy requests.  
**Logic Description:** This controller defines endpoints that can only be accessed by authorized administrators. It extracts the target player ID and calls the `PlayerDataRequestService` to orchestrate the fulfillment of the request, returning a status message.  
**Documentation:**
    
    - **Summary:** Handles the web layer for administrative actions related to player data privacy, such as initiating data access or deletion jobs.
    
**Namespace:** GlyphWeaver.Backend.System.Presentation.HTTP.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/presentation/http/controllers/health.controller.ts  
**Description:** Express controller for the system health check endpoint.  
**Template:** TypeScript Class  
**Dependency Level:** 2  
**Name:** HealthController  
**Type:** Controller  
**Relative Path:** presentation/http/controllers/health.controller.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    - MVC-Controller
    
**Members:**
    
    - **Name:** systemHealthService  
**Type:** SystemHealthService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - systemHealthService: SystemHealthService
    
**Return Type:** HealthController  
**Attributes:** public  
    - **Name:** checkHealth  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - System Health Check API Endpoint
    
**Requirement Ids:**
    
    - REQ-14
    
**Purpose:** To provide a single endpoint for monitoring tools to poll the overall health of the backend system.  
**Logic Description:** This controller has a single method that calls the `SystemHealthService` to get the aggregated health status and returns it as a JSON response with an appropriate HTTP status code (e.g., 200 for UP, 503 for DOWN/DEGRADED).  
**Documentation:**
    
    - **Summary:** Handles the web layer for the health check endpoint, providing a snapshot of the system's operational status.
    
**Namespace:** GlyphWeaver.Backend.System.Presentation.HTTP.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/presentation/http/middlewares/auth.middleware.ts  
**Description:** Express middleware for handling authentication (JWT validation) and authorization (Role-Based Access Control).  
**Template:** TypeScript Function  
**Dependency Level:** 2  
**Name:** authMiddleware  
**Type:** Middleware  
**Relative Path:** presentation/http/middlewares/auth.middleware.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** authenticate  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** authorize  
**Parameters:**
    
    - requiredRoles: string[]
    
**Return Type:** RequestHandler  
**Attributes:** public  
    
**Implemented Features:**
    
    - API Authentication
    - Role-Based Access Control (RBAC)
    
**Requirement Ids:**
    
    - REQ-AMOT-009
    
**Purpose:** To secure administrative endpoints by ensuring only authenticated and authorized users can access them.  
**Logic Description:** The `authenticate` function will check for a valid JWT in the Authorization header, verify it, and attach the user payload (with roles) to the request object. The `authorize` function is a factory that returns a middleware; this middleware checks if the user's roles (from the JWT) include any of the `requiredRoles`.  
**Documentation:**
    
    - **Summary:** Provides middleware functions for securing API routes, handling JWT validation and role-based authorization for administrative access.
    
**Namespace:** GlyphWeaver.Backend.System.Presentation.HTTP.Middlewares  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/presentation/http/middlewares/audit.middleware.ts  
**Description:** Express middleware to automatically log administrative actions.  
**Template:** TypeScript Function  
**Dependency Level:** 2  
**Name:** auditMiddleware  
**Type:** Middleware  
**Relative Path:** presentation/http/middlewares/audit.middleware.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** auditRepo  
**Type:** IAuditLogRepository  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** logAction  
**Parameters:**
    
    - eventType: string
    
**Return Type:** RequestHandler  
**Attributes:** public  
    
**Implemented Features:**
    
    - Automated Audit Logging
    
**Requirement Ids:**
    
    - REQ-AMOT-009
    
**Purpose:** To create a comprehensive audit trail of all administrative changes made via the API.  
**Logic Description:** This middleware is designed to be used on routes that perform write operations (POST, PUT, DELETE). After the main controller logic has executed successfully, this middleware will inspect the request and response to gather context (who did what, to what resource) and create an audit log entry via the `IAuditLogRepository`.  
**Documentation:**
    
    - **Summary:** Provides middleware for creating audit log entries for administrative actions, ensuring a tamper-evident trail of changes.
    
**Namespace:** GlyphWeaver.Backend.System.Presentation.HTTP.Middlewares  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/presentation/http/routes/index.ts  
**Description:** Main router file for the Express application. It aggregates all feature-specific routers.  
**Template:** TypeScript Express Router  
**Dependency Level:** 3  
**Name:** mainRouter  
**Type:** Router  
**Relative Path:** presentation/http/routes/index.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Route Aggregation
    
**Requirement Ids:**
    
    
**Purpose:** To provide a single entry point for all API routes, keeping the main server file clean.  
**Logic Description:** This file will import the routers from `configuration.routes.ts`, `player-data.routes.ts`, and `health.routes.ts`, and combine them under a main Express router instance, which is then exported.  
**Documentation:**
    
    - **Summary:** Aggregates and exports all defined API routes for the microservice.
    
**Namespace:** GlyphWeaver.Backend.System.Presentation.HTTP.Routes  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/config/index.ts  
**Description:** Manages and exports all environment-specific configurations for the application.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** config  
**Type:** Configuration  
**Relative Path:** config/index.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** env  
**Type:** string  
**Attributes:** public  
    - **Name:** port  
**Type:** number  
**Attributes:** public  
    - **Name:** databaseUrl  
**Type:** string  
**Attributes:** public  
    - **Name:** jwtSecret  
**Type:** string  
**Attributes:** public  
    - **Name:** downstreamServiceEndpoints  
**Type:** Record<string, string>  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Centralized Application Configuration
    
**Requirement Ids:**
    
    
**Purpose:** To provide a single, type-safe source of truth for all configuration variables loaded from environment variables.  
**Logic Description:** This file will use a library like `dotenv` to load environment variables from a `.env` file (for local development) and `process.env`. It will validate that required variables are present and export a frozen object with all configuration values.  
**Documentation:**
    
    - **Summary:** Loads, validates, and exports all application configuration from environment variables, providing a central point of access.
    
**Namespace:** GlyphWeaver.Backend.System.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/index.ts  
**Description:** The main entry point for the microservice. It initializes the Express server, database connection, and dependency injection container, then starts listening for requests.  
**Template:** TypeScript Application Entrypoint  
**Dependency Level:** 4  
**Name:** main  
**Type:** Entrypoint  
**Relative Path:** index.ts  
**Repository Id:** REPO-GLYPH-SYSTEM  
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
    
    
**Purpose:** To initialize and start the entire microservice application.  
**Logic Description:** This file will: 1. Load configuration. 2. Establish a connection to the MongoDB database. 3. Set up the dependency injection container, wiring up interfaces to their concrete implementations. 4. Instantiate the Express application, apply middlewares, and mount the main router. 5. Start the HTTP server to listen on the configured port.  
**Documentation:**
    
    - **Summary:** The bootstrap file for the System & Admin Service. It orchestrates the startup sequence of the application.
    
**Namespace:** GlyphWeaver.Backend.System  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** package.json  
**Description:** Defines the project's metadata, dependencies, and scripts for the Node.js application.  
**Template:** JSON Configuration  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** package.json  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    - Script Definitions
    
**Requirement Ids:**
    
    
**Purpose:** To manage the project's dependencies and provide standardized scripts for building, running, and testing.  
**Logic Description:** This file will list production dependencies like `express`, `mongoose`, `jsonwebtoken`, `dotenv`, and development dependencies like `typescript`, `ts-node`, `@types/*`, `jest`, `supertest`. It will include scripts for `start`, `build`, `dev`, and `test`.  
**Documentation:**
    
    - **Summary:** NPM package configuration file for the System & Admin Service.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration for the project.  
**Template:** JSON Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** tsconfig.json  
**Repository Id:** REPO-GLYPH-SYSTEM  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Settings
    
**Requirement Ids:**
    
    
**Purpose:** To configure how the TypeScript compiler translates .ts files into JavaScript.  
**Logic Description:** This file will specify the target ECMAScript version (e.g., ES2020), module system (e.g., CommonJS), output directory (`dist`), source map generation, and other compiler options like `strict`, `esModuleInterop`, and `experimentalDecorators` if needed.  
**Documentation:**
    
    - **Summary:** Defines the compiler options and file inclusions for the TypeScript project.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableDetailedHealthChecks
  - enableDownstreamServiceProbing
  
- **Database Configs:**
  
  - SYSTEM_DB_CONNECTION_STRING
  - JWT_SECRET
  - ADMIN_ROLES
  - PLAYER_SERVICE_URL
  - LEADERBOARD_SERVICE_URL
  


---

