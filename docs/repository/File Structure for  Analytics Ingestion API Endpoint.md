# Specification

# 1. Files

- **Path:** backend/src/api/analytics/package.json  
**Description:** Defines the Node.js project dependencies, scripts, and metadata for the Analytics Ingestion API. Includes dependencies like Express, TypeScript, Mongoose, Joi, and development dependencies like @types/node and ts-node.  
**Template:** Node.js package.json  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** ../../../package.json  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Project Dependency Management
    
**Requirement Ids:**
    
    
**Purpose:** Manages project dependencies and defines run scripts for the Analytics API.  
**Logic Description:** This file will contain a 'dependencies' section for runtime packages (express, mongoose, joi, dotenv) and a 'devDependencies' section for build/development tools (typescript, ts-node, nodemon, @types/*). It will also include 'scripts' for 'start', 'build', and 'dev'.  
**Documentation:**
    
    - **Summary:** Standard npm package file that lists all dependencies required to run the Analytics API service and provides scripts for building and running the application.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/src/api/analytics/tsconfig.json  
**Description:** TypeScript compiler configuration file. It specifies compiler options like the target ECMAScript version, module system, output directory, source map generation, and strict type-checking rules.  
**Template:** TypeScript tsconfig.json  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** ../../../tsconfig.json  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation
    
**Requirement Ids:**
    
    
**Purpose:** Configures how the TypeScript code in this repository is compiled into JavaScript.  
**Logic Description:** The configuration will set 'target' to 'es2020' or newer, 'module' to 'commonjs', 'outDir' to './dist', 'rootDir' to './src', and enable 'strict' mode, 'esModuleInterop', and 'resolveJsonModule'.  
**Documentation:**
    
    - **Summary:** Provides the necessary compiler options for transpiling the TypeScript source code into executable JavaScript, ensuring type safety and modern language features are correctly handled.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/src/api/analytics/src/config/index.ts  
**Description:** Centralized configuration management. Loads environment variables from a .env file and exports them as a typed configuration object for use throughout the application, providing default values where necessary.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** index  
**Type:** Configuration  
**Relative Path:** config/index.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment Configuration Loading
    
**Requirement Ids:**
    
    
**Purpose:** To provide a single, type-safe source for all application configuration variables.  
**Logic Description:** This file uses the 'dotenv' library to load environment variables. It defines and exports a configuration object with properties like 'port', 'mongodbUri', and 'corsOrigin'. It ensures required variables are present, throwing an error on startup if not.  
**Documentation:**
    
    - **Summary:** This module is responsible for loading and exporting all environment-specific configurations, such as the server port and database connection strings, making them available in a structured and type-safe manner.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/src/api/analytics/src/infrastructure/data/models/raw-analytics-event.model.ts  
**Description:** Defines the Mongoose schema and model for a raw analytics event. This model represents the structure of how analytics events are stored in the MongoDB collection.  
**Template:** Mongoose Model  
**Dependency Level:** 1  
**Name:** RawAnalyticsEventModel  
**Type:** Model  
**Relative Path:** infrastructure/data/models/raw-analytics-event.model.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - Domain-Driven Design Principles
    
**Members:**
    
    - **Name:** sessionId  
**Type:** string  
**Attributes:** public  
    - **Name:** playerId  
**Type:** string  
**Attributes:** public  
    - **Name:** eventName  
**Type:** string  
**Attributes:** public  
    - **Name:** eventTimestamp  
**Type:** Date  
**Attributes:** public  
    - **Name:** payload  
**Type:** Record<string, any>  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Analytics Event Data Schema
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    - REQ-ACC-012
    
**Purpose:** To define the data structure and validation rules for analytics events at the database level.  
**Logic Description:** This file will define a Mongoose Schema with fields: 'sessionId', 'playerId' (optional for anonymous events), 'eventName' (e.g., 'level_start', 'iap_funnel_view'), 'eventTimestamp', and a flexible 'payload' object using 'Schema.Types.Mixed' to store event-specific parameters. An index will be created on 'eventName' and 'eventTimestamp'.  
**Documentation:**
    
    - **Summary:** Represents a single analytics event document in MongoDB. The payload is designed to be flexible to accommodate different types of events from the client.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Infrastructure.Data.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/src/api/analytics/src/infrastructure/data/repositories/raw-analytics-event.repository.ts  
**Description:** Implements the IRawAnalyticsEventRepository interface. This class handles the actual database operations for storing analytics events, specifically batch-inserting events into MongoDB.  
**Template:** TypeScript Repository  
**Dependency Level:** 2  
**Name:** RawAnalyticsEventRepository  
**Type:** Repository  
**Relative Path:** infrastructure/data/repositories/raw-analytics-event.repository.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - Repository Pattern
    
**Members:**
    
    - **Name:** analyticsEventModel  
**Type:** Model<IRawAnalyticsEvent>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** saveBatch  
**Parameters:**
    
    - events: IngestEventDto[]
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - Batch Event Persistence
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    - REQ-ACC-012
    
**Purpose:** Provides a data access layer for persisting raw analytics events to the database.  
**Logic Description:** The 'saveBatch' method will take an array of event DTOs, map them to the Mongoose model structure, and use the 'insertMany' Mongoose function for efficient batch insertion into the 'rawanalyticsevents' collection. It will include error handling for database write failures.  
**Documentation:**
    
    - **Summary:** This repository abstracts the database insertion logic for analytics events. Its primary function is to efficiently save large batches of events received from the client.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Infrastructure.Data.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/src/api/analytics/src/application/dtos/analytics-event.dto.ts  
**Description:** Defines the Data Transfer Object for a single analytics event. This structure is used for validation and within the application service layer.  
**Template:** TypeScript DTO  
**Dependency Level:** 1  
**Name:** AnalyticsEventDto  
**Type:** DTO  
**Relative Path:** application/dtos/analytics-event.dto.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** eventName  
**Type:** string  
**Attributes:** public  
    - **Name:** eventTimestamp  
**Type:** string  
**Attributes:** public  
    - **Name:** payload  
**Type:** Record<string, any>  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Data Contract
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    - REQ-ACC-012
    
**Purpose:** To define the expected structure of a single analytics event sent by the client.  
**Logic Description:** This is a simple interface or class defining the shape of an event. 'eventName' will be a string literal type if possible (e.g., 'level_complete' | 'hint_used'), 'eventTimestamp' will be an ISO 8601 string, and 'payload' will be a generic object to hold specific event data.  
**Documentation:**
    
    - **Summary:** This DTO represents the contract for a single event within a batch. It standardizes how different types of analytics data are structured for ingestion.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Application.Dtos  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/src/api/analytics/src/application/dtos/ingest-events-request.dto.ts  
**Description:** Defines the Data Transfer Object for the entire analytics ingestion request body. This typically contains common information and an array of individual events.  
**Template:** TypeScript DTO  
**Dependency Level:** 2  
**Name:** IngestEventsRequestDto  
**Type:** DTO  
**Relative Path:** application/dtos/ingest-events-request.dto.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** sessionId  
**Type:** string  
**Attributes:** public  
    - **Name:** playerId  
**Type:** string  
**Attributes:** public  
    - **Name:** events  
**Type:** AnalyticsEventDto[]  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Data Contract
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    - REQ-ACC-012
    
**Purpose:** To define the shape of the entire JSON body sent to the analytics ingestion endpoint.  
**Logic Description:** This interface or class will define the overall request payload. It contains session and player identifiers that apply to the entire batch of events, and an array of 'AnalyticsEventDto' objects.  
**Documentation:**
    
    - **Summary:** Represents the full request body for the analytics ingestion endpoint. It aggregates common session/player information with a batch of individual event DTOs.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Application.Dtos  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/src/api/analytics/src/application/services/analytics-ingestion.service.ts  
**Description:** Implements the IAnalyticsIngestionService interface. Contains the core application logic for processing a batch of validated analytics events.  
**Template:** TypeScript Service  
**Dependency Level:** 3  
**Name:** AnalyticsIngestionService  
**Type:** Service  
**Relative Path:** application/services/analytics-ingestion.service.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - Service Layer Pattern
    
**Members:**
    
    - **Name:** rawAnalyticsEventRepository  
**Type:** IRawAnalyticsEventRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** ingestEvents  
**Parameters:**
    
    - ingestRequest: IngestEventsRequestDto
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - Analytics Event Processing Logic
    
**Requirement Ids:**
    
    - REQ-AMOT-001
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    - REQ-ACC-012
    
**Purpose:** To orchestrate the persistence of incoming analytics data.  
**Logic Description:** The 'ingestEvents' method will receive the validated request DTO. It will transform the incoming data into a format suitable for the repository, combining the top-level sessionId and playerId with each event in the batch. It then calls the 'saveBatch' method on the 'rawAnalyticsEventRepository' to persist the data. In a more advanced setup, this service would push events to a message queue instead of directly calling the repository.  
**Documentation:**
    
    - **Summary:** This service acts as the central orchestrator for the analytics ingestion use case. It takes the validated request data, prepares it, and delegates the storage operation to the data access layer.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/src/api/analytics/src/api/validation/analytics.validator.ts  
**Description:** Contains Joi validation schemas for the analytics ingestion endpoint's request body. Ensures that incoming data conforms to the expected structure and types.  
**Template:** Joi Validator  
**Dependency Level:** 2  
**Name:** analyticsValidator  
**Type:** Validator  
**Relative Path:** api/validation/analytics.validator.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** ingestEventsSchema  
**Type:** Joi.ObjectSchema  
**Attributes:** public|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Request Data Validation
    
**Requirement Ids:**
    
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    - REQ-ACC-012
    
**Purpose:** To enforce the API contract and ensure data integrity for incoming analytics requests.  
**Logic Description:** This file will export a Joi schema. A sub-schema for a single event will validate 'eventName' as a required string, 'eventTimestamp' as a valid ISO date string, and 'payload' as an object. The main 'ingestEventsSchema' will validate 'sessionId' and 'playerId' as required strings and 'events' as a required array of the event sub-schema, with a minimum of one event.  
**Documentation:**
    
    - **Summary:** Provides the Joi schemas used by the validation middleware to check the structure and types of the analytics ingestion request body before it reaches the controller logic.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Api.Validation  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/analytics/src/api/middleware/validation.middleware.ts  
**Description:** An Express middleware function that uses a Joi schema to validate the request body. If validation fails, it sends a 400 Bad Request response with details. If successful, it passes control to the next handler.  
**Template:** Express Middleware  
**Dependency Level:** 3  
**Name:** validationMiddleware  
**Type:** Middleware  
**Relative Path:** api/middleware/validation.middleware.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** validateRequest  
**Parameters:**
    
    - schema: Joi.ObjectSchema
    
**Return Type:** RequestHandler  
**Attributes:** public  
    
**Implemented Features:**
    
    - Generic Request Validation
    
**Requirement Ids:**
    
    
**Purpose:** To provide a reusable middleware for validating Express requests against a given Joi schema.  
**Logic Description:** This higher-order function takes a Joi schema as an argument and returns an Express request handler. The handler validates 'req.body' against the schema. On failure, it calls 'next()' with a validation error. On success, it calls 'next()' to proceed.  
**Documentation:**
    
    - **Summary:** A generic middleware for request body validation. It decouples the validation logic (Joi schemas) from the route handling logic.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Api.Middleware  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/analytics/src/api/controllers/analytics.controller.ts  
**Description:** The controller responsible for handling HTTP requests to the analytics endpoint. It orchestrates the validation and delegates processing to the application service.  
**Template:** Express Controller  
**Dependency Level:** 4  
**Name:** AnalyticsController  
**Type:** Controller  
**Relative Path:** api/controllers/analytics.controller.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    - Model-View-Controller (MVC) / Model-View-Presenter (MVP) / Model-View-ViewModel (MVVM)
    
**Members:**
    
    - **Name:** analyticsIngestionService  
**Type:** IAnalyticsIngestionService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** ingestEvents  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - Analytics API Endpoint Handler
    
**Requirement Ids:**
    
    - REQ-AMOT-001
    - REQ-AMOT-002
    - REQ-AMOT-003
    - REQ-AMOT-004
    - REQ-ACC-012
    
**Purpose:** To act as the entry point for API requests related to analytics ingestion.  
**Logic Description:** The 'ingestEvents' method is the main handler for the POST request. It expects the request body to have been validated by middleware. It calls the 'ingestEvents' method of the 'analyticsIngestionService' with the request body. Upon successful processing, it sends a 202 Accepted response. It wraps the service call in a try-catch block to pass any errors to the global error handler via 'next()'.  
**Documentation:**
    
    - **Summary:** This controller handles incoming requests for analytics data ingestion. It relies on middleware for validation and delegates the core processing to the AnalyticsIngestionService.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Api.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/analytics/src/api/routes/analytics.routes.ts  
**Description:** Defines the Express router for all analytics-related API endpoints. It maps the HTTP verb and path to the corresponding controller method and applies necessary middleware.  
**Template:** Express Router  
**Dependency Level:** 5  
**Name:** analyticsRouter  
**Type:** Router  
**Relative Path:** api/routes/analytics.routes.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Routing
    
**Requirement Ids:**
    
    - REQ-AMOT-001
    
**Purpose:** To configure the routing for the analytics API.  
**Logic Description:** This file creates a new Express Router instance. It defines a single route: 'POST /events'. This route is configured to use the 'validationMiddleware' with the 'ingestEventsSchema' and then calls the 'ingestEvents' method on an instance of the AnalyticsController.  
**Documentation:**
    
    - **Summary:** This module sets up the specific HTTP routes for the analytics service, linking them to validation middleware and the appropriate controller actions.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics.Api.Routes  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/analytics/src/index.ts  
**Description:** The main entry point for the Analytics Ingestion API service. It initializes the Express application, sets up middleware, connects to the database, registers routes, and starts the HTTP server.  
**Template:** Node.js Application Entry Point  
**Dependency Level:** 6  
**Name:** index  
**Type:** Startup  
**Relative Path:** index.ts  
**Repository Id:** REPO-GLYPH-ANALYTICS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Application Bootstrap
    
**Requirement Ids:**
    
    
**Purpose:** To bootstrap and run the entire analytics API service.  
**Logic Description:** This file will: 1. Import necessary modules (express, mongoose, config, routes, error handler). 2. Create an Express app instance. 3. Apply global middleware like 'express.json()' and 'cors'. 4. Establish a connection to MongoDB using the URI from the config. 5. Mount the 'analyticsRouter' at a base path like '/api/v1/analytics'. 6. Register the global error handler middleware. 7. Start the server, listening on the port defined in the config.  
**Documentation:**
    
    - **Summary:** The bootstrap file for the service. It wires together all the components of the application—configuration, database connection, middleware, and routes—and starts the server to listen for incoming requests.
    
**Namespace:** GlyphWeaver.Backend.Api.Analytics  
**Metadata:**
    
    - **Category:** Startup
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  - MONGODB_URI
  


---

