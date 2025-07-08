# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the project's metadata, dependencies, and scripts for running, building, and testing the Node.js application.  
**Template:** Node.js Package  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    - Project Scripts
    
**Requirement Ids:**
    
    
**Purpose:** Manages project dependencies (e.g., express, mongoose, typescript) and defines npm scripts (e.g., 'start', 'build', 'test').  
**Logic Description:** This file will list production dependencies such as 'express', 'mongoose', 'helmet', 'cors', and 'dotenv'. Dev dependencies will include '@types/node', '@types/express', 'typescript', 'ts-node', 'nodemon', and testing libraries.  
**Documentation:**
    
    - **Summary:** Standard npm package file for a TypeScript Express.js project. It's the entry point for dependency installation and running project-specific commands.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration file. Specifies root files, compiler options like target ECMAScript version, module system, strictness, and output directory.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Rules
    
**Requirement Ids:**
    
    
**Purpose:** Configures the TypeScript compiler to transpile TypeScript source code into JavaScript for the Node.js runtime.  
**Logic Description:** Key options will include 'target': 'es2020', 'module': 'commonjs', 'outDir': './dist', 'rootDir': './src', 'strict': true, 'esModuleInterop': true, and 'resolveJsonModule': true.  
**Documentation:**
    
    - **Summary:** Defines how the TypeScript compiler should behave, ensuring consistent and correct transpilation of the project's source code.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/config/index.ts  
**Description:** Centralized configuration management. Loads environment variables using a library like 'dotenv' and exports a typed configuration object for use throughout the application.  
**Template:** TypeScript Module  
**Dependency Level:** 1  
**Name:** config  
**Type:** Configuration  
**Relative Path:** config  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** env  
**Type:** IEnvironment  
**Attributes:** public|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment Variable Loading
    - Configuration Export
    
**Requirement Ids:**
    
    - REQ-SEC-002
    
**Purpose:** Provides a single, strongly-typed source of truth for all environment-dependent configurations, such as database connection strings and port numbers.  
**Logic Description:** This file will validate that required environment variables (e.g., PORT, MONGO_URI) are present. It will then export a frozen object containing these values, preventing runtime modifications.  
**Documentation:**
    
    - **Summary:** This module centralizes and validates all environment variables, exporting them as a single, immutable configuration object.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/domain/models/AnalyticsEvent.ts  
**Description:** Defines the core domain entity for a single analytics event. It includes common properties for all events and a flexible payload structure.  
**Template:** TypeScript Class  
**Dependency Level:** 0  
**Name:** AnalyticsEvent  
**Type:** Model  
**Relative Path:** domain/models  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - DDD-Entity
    
**Members:**
    
    - **Name:** id  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** sessionId  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** userId  
**Type:** string | null  
**Attributes:** public|readonly  
    - **Name:** eventName  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** clientTimestamp  
**Type:** Date  
**Attributes:** public|readonly  
    - **Name:** serverTimestamp  
**Type:** Date  
**Attributes:** public|readonly  
    - **Name:** payload  
**Type:** Record<string, any>  
**Attributes:** public|readonly  
    - **Name:** geo  
**Type:** object | null  
**Attributes:** public|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Analytics Event Data Structure
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    - REQ-ACC-012
    
**Purpose:** Represents the canonical structure of an analytics event within the system's domain.  
**Logic Description:** This class will serve as the core data model. It will be instantiated by the application layer after validation and enrichment of incoming client data. The payload will be a generic object to accommodate various event types.  
**Documentation:**
    
    - **Summary:** Defines the AnalyticsEvent domain model, which encapsulates all data related to a single telemetry event captured by the system.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Domain.Models  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/repositories/IAnalyticsEventRepository.ts  
**Description:** Defines the interface (contract) for the analytics event repository. This allows the application layer to depend on an abstraction, not a concrete implementation.  
**Template:** TypeScript Interface  
**Dependency Level:** 1  
**Name:** IAnalyticsEventRepository  
**Type:** RepositoryInterface  
**Relative Path:** domain/repositories  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - RepositoryPattern
    - DependencyInversion
    
**Members:**
    
    
**Methods:**
    
    - **Name:** addBatch  
**Parameters:**
    
    - events: AnalyticsEvent[]
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Event Persistence Contract
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    
**Purpose:** Decouples the core application logic from the specific data persistence technology (MongoDB).  
**Logic Description:** This interface will declare a single method, `addBatch`, which accepts an array of `AnalyticsEvent` domain models. This supports the high-throughput, batch-oriented nature of the service.  
**Documentation:**
    
    - **Summary:** Specifies the contract for any class that aims to persist analytics events, ensuring a consistent interface for the application layer.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Domain.Repositories  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/application/dtos/IngestEvents.dto.ts  
**Description:** Data Transfer Object defining the shape of the incoming analytics event batch from the client. Used for request body validation.  
**Template:** TypeScript Interface  
**Dependency Level:** 1  
**Name:** IngestEventsDto  
**Type:** DTO  
**Relative Path:** application/dtos  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** events  
**Type:** IncomingEventDto[]  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Client Data Contract
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    
**Purpose:** Defines the expected structure of the JSON payload sent by the game client, ensuring a clear and validated contract at the API boundary.  
**Logic Description:** This file will contain two interfaces: `IncomingEventDto` (for a single event with `eventName`, `clientTimestamp`, `payload`, etc.) and `IngestEventsDto` which contains an array of the former. This structure will be used with a validation library like Joi or Zod.  
**Documentation:**
    
    - **Summary:** Defines the Data Transfer Object for the analytics ingestion endpoint, specifying the contract for event batches sent by the client.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Application.Dtos  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/application/services/AnalyticsIngestion.service.ts  
**Description:** The core application service responsible for orchestrating the event ingestion use case. It handles validation, enrichment, and persistence.  
**Template:** TypeScript Class  
**Dependency Level:** 2  
**Name:** AnalyticsIngestionService  
**Type:** Service  
**Relative Path:** application/services  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - ServiceLayerPattern
    - DependencyInjection
    
**Members:**
    
    - **Name:** analyticsEventRepository  
**Type:** IAnalyticsEventRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** ingestEventBatch  
**Parameters:**
    
    - ingestDto: IngestEventsDto
    - metadata: { ipAddress: string, userId?: string, sessionId: string }
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Event Ingestion Logic
    - Data Validation
    - Data Enrichment
    
**Requirement Ids:**
    
    - REQ-AMOT-001
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    
**Purpose:** Encapsulates the business logic for processing a batch of analytics events received from the API.  
**Logic Description:** The `ingestEventBatch` method will iterate through the DTO's events. For each event, it will perform detailed validation on the payload based on the eventName. It will enrich the event with a server timestamp and potentially geo-location data. Finally, it will map the validated, enriched data to `AnalyticsEvent` domain models and pass the entire batch to the repository's `addBatch` method.  
**Documentation:**
    
    - **Summary:** This service orchestrates the entire analytics ingestion flow, from validating incoming data to enriching it and handing it off for persistence.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/infrastructure/database/mongo.connection.ts  
**Description:** Handles the connection to the MongoDB database using Mongoose. Manages connection lifecycle and events.  
**Template:** TypeScript Module  
**Dependency Level:** 2  
**Name:** mongoConnection  
**Type:** DatabaseConnector  
**Relative Path:** infrastructure/database  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** connectDB  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - MongoDB Connection
    
**Requirement Ids:**
    
    
**Purpose:** Abstracts the database connection logic, providing a single point of management for connecting to MongoDB.  
**Logic Description:** This module will export a function `connectDB` that takes the MongoDB URI from the central config. It will use Mongoose to establish a connection and will log success or failure events. It will be called once at application startup.  
**Documentation:**
    
    - **Summary:** Provides a function to establish and manage the application's connection to the MongoDB database.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Infrastructure.Database  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/infrastructure/database/schemas/AnalyticsEvent.schema.ts  
**Description:** Defines the Mongoose schema for the AnalyticsEvent model. This maps the domain model to a MongoDB collection and enforces data structure at the database level.  
**Template:** TypeScript Module  
**Dependency Level:** 1  
**Name:** AnalyticsEventSchema  
**Type:** Schema  
**Relative Path:** infrastructure/database/schemas  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Database Schema Definition
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    
**Purpose:** Provides the data definition and validation rules for the 'analytics_events' collection in MongoDB.  
**Logic Description:** The Mongoose schema will define fields like `sessionId`, `userId`, `eventName`, `clientTimestamp`, `serverTimestamp`, `payload` (as a flexible Mixed type), and `geo`. It will include indexes on `eventName`, `serverTimestamp`, and `userId` to optimize common query patterns for analysis.  
**Documentation:**
    
    - **Summary:** This file contains the Mongoose schema and model for persisting AnalyticsEvent entities to the MongoDB database.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Infrastructure.Database.Schemas  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/repositories/MongoAnalyticsEvent.repository.ts  
**Description:** Concrete implementation of the IAnalyticsEventRepository interface using Mongoose for MongoDB.  
**Template:** TypeScript Class  
**Dependency Level:** 2  
**Name:** MongoAnalyticsEventRepository  
**Type:** Repository  
**Relative Path:** infrastructure/repositories  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** analyticsEventModel  
**Type:** Model<IAnalyticsEventDocument>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** addBatch  
**Parameters:**
    
    - events: AnalyticsEvent[]
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Batch Event Persistence
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    
**Purpose:** Handles the actual database write operations for persisting analytics events in bulk.  
**Logic Description:** This class implements the `addBatch` method. It will map the array of `AnalyticsEvent` domain models to the Mongoose model format and then use Mongoose's `insertMany()` method for a highly efficient bulk write operation to the MongoDB collection.  
**Documentation:**
    
    - **Summary:** Implements the data persistence logic for analytics events, optimized for high-throughput batch insertion into MongoDB.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Infrastructure.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/presentation/controllers/Analytics.controller.ts  
**Description:** Express controller that handles incoming HTTP requests for the analytics ingestion endpoint.  
**Template:** TypeScript Class  
**Dependency Level:** 3  
**Name:** AnalyticsController  
**Type:** Controller  
**Relative Path:** presentation/controllers  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - MVC-Controller
    
**Members:**
    
    - **Name:** analyticsIngestionService  
**Type:** AnalyticsIngestionService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** ingestEvents  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - API Endpoint Handling
    
**Requirement Ids:**
    
    - REQ-AMOT-001
    
**Purpose:** Defines the API endpoint for clients to send analytics data, acting as the entry point for the ingestion use case.  
**Logic Description:** The `ingestEvents` method will be bound to a POST route. It will extract the event batch from the request body (`req.body`), along with metadata like the IP address from the request. It will call the `analyticsIngestionService.ingestEventBatch()` with this data. Upon successful queuing of the request, it will send a `202 Accepted` response to the client, confirming receipt in a fire-and-forget manner.  
**Documentation:**
    
    - **Summary:** This controller exposes the `/events` endpoint, receives batches of analytics data from clients, and passes them to the application layer for processing.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Presentation.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/presentation/routes/analytics.routes.ts  
**Description:** Defines and configures the Express router for all analytics-related endpoints.  
**Template:** TypeScript Module  
**Dependency Level:** 4  
**Name:** analyticsRouter  
**Type:** Router  
**Relative Path:** presentation/routes  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Routing
    
**Requirement Ids:**
    
    - REQ-AMOT-001
    
**Purpose:** Maps the HTTP routes (e.g., POST /v1/events) to the corresponding controller methods.  
**Logic Description:** This file will create a new Express Router. It will define a single route, `POST /`, which maps to the `ingestEvents` method of an `AnalyticsController` instance. It may also include route-specific middleware for validation.  
**Documentation:**
    
    - **Summary:** Configures the Express router for the analytics ingestion API, linking URL paths and HTTP methods to controller functions.
    
**Namespace:** GlyphWeaver.Backend.Analytics.Presentation.Routes  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/index.ts  
**Description:** The main entry point for the microservice. It initializes the Express application, sets up middleware, connects to the database, configures routes, and starts the server.  
**Template:** TypeScript Application  
**Dependency Level:** 5  
**Name:** main  
**Type:** Application  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - DependencyInjection
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Application Bootstrap
    
**Requirement Ids:**
    
    
**Purpose:** Bootstraps and runs the entire analytics ingestion microservice.  
**Logic Description:** This file will perform the following steps in order: load configuration, set up dependency injection container (if used), connect to MongoDB, initialize the Express app, apply global middleware (CORS, Helmet, JSON body parser), register the analytics routes, add a global error handler, and finally, start the HTTP server to listen on the configured port.  
**Documentation:**
    
    - **Summary:** This is the main server file that initializes and starts the Express.js application, wiring together all components of the service.
    
**Namespace:** GlyphWeaver.Backend.Analytics  
**Metadata:**
    
    - **Category:** Application
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableGeoIpEnrichment
  
- **Database Configs:**
  
  - MONGO_URI
  - MONGO_DB_NAME
  


---

