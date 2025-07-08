# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines project metadata, scripts for running, testing, and building the application, and lists all Node.js dependencies such as Express, Mongoose, TypeScript, Joi, and JWT.  
**Template:** Node.js Package Manifest  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Project Setup
    - Dependency Management
    
**Requirement Ids:**
    
    
**Purpose:** To manage project dependencies and define runnable scripts for development, testing, and production builds.  
**Logic Description:** This file will contain dependencies like express, mongoose, joi, jsonwebtoken, typescript, ts-node, and @types/* for development. Scripts will include 'start:dev' for running with ts-node-dev, 'build' for compiling TypeScript to JavaScript, and 'start' for running the compiled code.  
**Documentation:**
    
    - **Summary:** Standard npm package.json file. It is the entry point for understanding the project's dependencies and operational scripts.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration file. It specifies compiler options, such as the target ECMAScript version, module system, output directory, and strict type-checking rules, ensuring code consistency and quality.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation
    
**Requirement Ids:**
    
    
**Purpose:** To configure the TypeScript compiler (tsc) for transpiling the project's .ts files into JavaScript.  
**Logic Description:** Key settings will include 'target': 'es2020' or newer, 'module': 'commonjs', 'outDir': './dist', 'rootDir': './src', 'strict': true, and 'esModuleInterop': true. 'paths' might be configured for non-relative imports.  
**Documentation:**
    
    - **Summary:** Configures the TypeScript compiler with project-specific settings for module resolution, type checking, and JavaScript output.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/config/index.ts  
**Description:** Centralized configuration management. Loads environment variables from a .env file (using a library like dotenv) and exports them as a typed configuration object for use throughout the application, such as database connection strings, port numbers, and JWT secrets.  
**Template:** TypeScript Configuration Module  
**Dependency Level:** 0  
**Name:** index  
**Type:** Configuration  
**Relative Path:** config  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment Configuration
    
**Requirement Ids:**
    
    
**Purpose:** To provide a single, type-safe source of truth for all application configuration values, abstracting away the source (e.g., environment variables).  
**Logic Description:** The file will use a library like 'dotenv' to load a .env file in development. It will define and export a frozen object containing validated configuration values like PORT, MONGODB_URI, JWT_SECRET, and JWT_EXPIRY.  
**Documentation:**
    
    - **Summary:** Loads and exports all application-level configuration. Throws an error if required environment variables are missing on startup.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/api/v1/procedural-levels/dto/register-level.dto.ts  
**Description:** Data Transfer Object defining the structure for the request body when a client registers a new procedurally generated level instance. This ensures a clear and stable API contract.  
**Template:** TypeScript DTO  
**Dependency Level:** 0  
**Name:** register-level.dto  
**Type:** DTO  
**Relative Path:** api/v1/procedural-levels/dto  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - DataTransferObject
    
**Members:**
    
    - **Name:** baseLevelId  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** generationSeed  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** generationParameters  
**Type:** Record<string, any>  
**Attributes:** public|readonly  
    - **Name:** solutionPath  
**Type:** Record<string, any>  
**Attributes:** public|readonly  
    - **Name:** complexityScore  
**Type:** number  
**Attributes:** public|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Contract Definition
    
**Requirement Ids:**
    
    - REQ-CGLE-011
    - REQ-8-027
    
**Purpose:** To define the expected shape and types for the 'register procedural level' API endpoint's request payload.  
**Logic Description:** This file will contain a TypeScript class or interface that strictly types the incoming data from the client, including the seed, parameters, and solution, as required for level reproduction.  
**Documentation:**
    
    - **Summary:** Defines the contract for registering a new procedurally generated level. Input is the set of parameters that define the level. Output of the endpoint using this will be a unique identifier for the created instance.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.ProceduralLevels.DTO  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/v1/procedural-levels/dto/level-instance.response.dto.ts  
**Description:** Data Transfer Object defining the structure for the response body after successfully registering a new procedurally generated level instance. It contains the unique identifier for the created resource.  
**Template:** TypeScript DTO  
**Dependency Level:** 0  
**Name:** level-instance.response.dto  
**Type:** DTO  
**Relative Path:** api/v1/procedural-levels/dto  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - DataTransferObject
    
**Members:**
    
    - **Name:** proceduralLevelId  
**Type:** string  
**Attributes:** public|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Contract Definition
    
**Requirement Ids:**
    
    - REQ-CGLE-011
    - REQ-8-027
    
**Purpose:** To define the expected shape and types for the response payload of the 'register procedural level' API endpoint.  
**Logic Description:** This will be a simple TypeScript class or interface containing a single string property for the unique ID generated by MongoDB for the new procedural level document.  
**Documentation:**
    
    - **Summary:** Defines the successful response contract after registering a procedural level instance, providing the client with the ID of the newly created resource.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.ProceduralLevels.DTO  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/data/models/procedural-level.model.ts  
**Description:** Defines the Mongoose schema and model for the ProceduralLevel entity. This file specifies the data structure, types, and validation rules for documents stored in the 'procedurallevels' MongoDB collection, fulfilling the data modeling requirement.  
**Template:** Mongoose Model  
**Dependency Level:** 0  
**Name:** procedural-level.model  
**Type:** Model  
**Relative Path:** data/models  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - DomainModel
    - ActiveRecord
    
**Members:**
    
    - **Name:** baseLevelId  
**Type:** Schema.Types.ObjectId  
**Attributes:**   
    - **Name:** generationSeed  
**Type:** String  
**Attributes:**   
    - **Name:** generationParameters  
**Type:** Object  
**Attributes:**   
    - **Name:** solutionPath  
**Type:** Object  
**Attributes:**   
    - **Name:** complexityScore  
**Type:** Number  
**Attributes:**   
    - **Name:** playerId  
**Type:** Schema.Types.ObjectId  
**Attributes:**   
    
**Methods:**
    
    
**Implemented Features:**
    
    - Procedural Level Data Persistence
    - Schema Definition
    
**Requirement Ids:**
    
    - REQ-8-004
    - REQ-CGLE-011
    
**Purpose:** To create a Mongoose schema and model that represents a procedurally generated level instance in the MongoDB database.  
**Logic Description:** This file will define a new Mongoose Schema with fields for baseLevelId, generationSeed, generationParameters, solutionPath, complexityScore, and playerId. Timestamps (createdAt, updatedAt) will be enabled. It will then export the compiled Mongoose model.  
**Documentation:**
    
    - **Summary:** This model is the data access object for ProceduralLevel documents. It enforces the data structure and types for all level instance data stored in the database.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.Data.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/interfaces/audit.interface.ts  
**Description:** Defines the TypeScript interfaces for the audit logging service and its data structures, promoting dependency inversion and clear contracts.  
**Template:** TypeScript Interface  
**Dependency Level:** 0  
**Name:** audit.interface  
**Type:** Interface  
**Relative Path:** interfaces  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - Interface
    
**Members:**
    
    
**Methods:**
    
    - **Name:** logEvent  
**Parameters:**
    
    - eventType: string
    - details: Record<string, any>
    
**Return Type:** Promise<void>  
**Attributes:**   
    
**Implemented Features:**
    
    
**Requirement Ids:**
    
    
**Purpose:** To define the contract for any service that provides audit logging capabilities.  
**Logic Description:** Exports an 'IAuditService' interface with a 'logEvent' method signature. Also defines an 'AuditEvent' interface for the structure of the log data.  
**Documentation:**
    
    - **Summary:** Provides the abstract definitions for audit logging services, allowing for decoupled implementations.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.Interfaces  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/data/repositories/procedural-level.repository.ts  
**Description:** Implements the data access logic for ProceduralLevel entities. It abstracts the direct Mongoose/MongoDB calls away from the service layer, providing clean methods for CRUD operations.  
**Template:** TypeScript Repository  
**Dependency Level:** 1  
**Name:** procedural-level.repository  
**Type:** Repository  
**Relative Path:** data/repositories  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** proceduralLevelModel  
**Type:** Model<IProceduralLevel>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** create  
**Parameters:**
    
    - levelData: Partial<IProceduralLevel>
    
**Return Type:** Promise<IProceduralLevel>  
**Attributes:** public  
    - **Name:** findById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<IProceduralLevel | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Procedural Level Data Storage
    
**Requirement Ids:**
    
    - REQ-CGLE-011
    - REQ-8-027
    
**Purpose:** To handle all database operations related to procedurally generated level instances.  
**Logic Description:** This class will be instantiated with the Mongoose model for ProceduralLevel. The 'create' method will use 'new this.proceduralLevelModel(levelData).save()' to persist a new level. The 'findById' method will use 'this.proceduralLevelModel.findById(id).exec()'.  
**Documentation:**
    
    - **Summary:** Provides a repository for creating and retrieving procedural level documents from the MongoDB database, abstracting the data source from the application logic.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.Data.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/api/v1/procedural-levels/procedural-levels.validation.ts  
**Description:** Contains Joi validation schemas for validating incoming API requests for the procedural levels endpoints. This ensures data integrity and security before the request is processed by the controller.  
**Template:** Joi Validator  
**Dependency Level:** 1  
**Name:** procedural-levels.validation  
**Type:** Validator  
**Relative Path:** api/v1/procedural-levels  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** registerLevelSchema  
**Type:** Joi.ObjectSchema  
**Attributes:** public|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Request Validation
    
**Requirement Ids:**
    
    - REQ-CGLE-011
    - REQ-8-027
    
**Purpose:** To define and export validation rules for procedural level API request payloads.  
**Logic Description:** This file will export a Joi schema object. The schema will define rules for 'baseLevelId' (string, required), 'generationSeed' (string, required), 'generationParameters' (object, required), 'solutionPath' (object, required), and 'complexityScore' (number, required).  
**Documentation:**
    
    - **Summary:** Provides a Joi schema to validate the request body of the POST endpoint for registering a new procedural level, ensuring all required fields are present and correctly typed.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.ProceduralLevels.Validation  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/middleware/auth.middleware.ts  
**Description:** Express middleware for handling JWT-based authentication. It verifies the Authorization header, decodes the token, and attaches the authenticated player's information to the request object for downstream use.  
**Template:** Express Middleware  
**Dependency Level:** 1  
**Name:** auth.middleware  
**Type:** Middleware  
**Relative Path:** middleware  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
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
    
**Implemented Features:**
    
    - API Authentication
    
**Requirement Ids:**
    
    
**Purpose:** To secure API endpoints by ensuring that incoming requests have a valid JSON Web Token.  
**Logic Description:** The middleware will check for a 'Bearer' token in the 'Authorization' header. If present, it will use 'jsonwebtoken.verify' with the JWT_SECRET from config to validate it. On success, it attaches the decoded payload (e.g., playerId) to 'req.user' and calls 'next()'. On failure, it sends a 401 or 403 response.  
**Documentation:**
    
    - **Summary:** An Express middleware function that protects routes by validating the JWT in the request's Authorization header.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.Middleware  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/services/audit.service.ts  
**Description:** A service responsible for handling audit logging. This could log to the console, a file, or a dedicated logging service/database collection, providing a centralized point for recording important system events.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** audit.service  
**Type:** Service  
**Relative Path:** services  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - ServiceLayerPattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** logEvent  
**Parameters:**
    
    - eventType: string
    - details: Record<string, any>
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Audit Logging
    
**Requirement Ids:**
    
    
**Purpose:** To provide a generic and reusable service for logging critical actions and events within the application.  
**Logic Description:** This class will implement the IAuditService interface. The 'logEvent' method will construct a log entry object including a timestamp, the eventType, and details. It will then write this log to the configured output, such as the console or a dedicated AuditLog MongoDB collection.  
**Documentation:**
    
    - **Summary:** Provides a simple service to log significant events for auditing and debugging purposes, decoupling the logging mechanism from the business logic.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/services/procedural-level.service.ts  
**Description:** The application service that handles the business logic for managing procedurally generated levels. It orchestrates interactions between the API layer and the data access layer.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** procedural-level.service  
**Type:** Service  
**Relative Path:** services  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - ServiceLayerPattern
    
**Members:**
    
    - **Name:** proceduralLevelRepository  
**Type:** ProceduralLevelRepository  
**Attributes:** private|readonly  
    - **Name:** auditService  
**Type:** AuditService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** registerLevel  
**Parameters:**
    
    - levelData: RegisterLevelDto
    - playerId: string
    
**Return Type:** Promise<string>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Procedural Level Registration
    
**Requirement Ids:**
    
    - REQ-CGLE-011
    - REQ-8-027
    
**Purpose:** To contain the core logic for registering a new procedurally generated level instance.  
**Logic Description:** The 'registerLevel' method will receive the validated DTO from the controller. It will map the DTO to the repository's data model, including the playerId from the authenticated request. It will then call the repository's 'create' method to save the data. Upon successful creation, it will log the event via the audit service and return the new document's ID.  
**Documentation:**
    
    - **Summary:** This service handles the use case of registering a new procedural level. It uses the repository for data persistence and the audit service for logging, returning the unique ID of the created level instance.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/api/v1/procedural-levels/procedural-levels.controller.ts  
**Description:** The controller that handles HTTP requests for the procedural levels resource. It uses the application service to perform business logic and formats the HTTP response.  
**Template:** Express Controller  
**Dependency Level:** 3  
**Name:** procedural-levels.controller  
**Type:** Controller  
**Relative Path:** api/v1/procedural-levels  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - ModelViewController
    
**Members:**
    
    - **Name:** proceduralLevelService  
**Type:** ProceduralLevelService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** register  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - API Endpoint Handling
    
**Requirement Ids:**
    
    - REQ-CGLE-011
    - REQ-8-027
    
**Purpose:** To process incoming requests for registering procedural level data, delegate to the service layer, and send back a response.  
**Logic Description:** The 'register' method, designed as an async Express handler, will extract the validated request body (RegisterLevelDto) and the authenticated player ID from 'req.user'. It will call 'this.proceduralLevelService.registerLevel' with this data. On success, it will create a LevelInstanceResponseDto and send a 201 Created response. Errors are passed to the 'next' function for global error handling.  
**Documentation:**
    
    - **Summary:** This controller exposes the functionality to register a new procedural level instance via a POST request. It is responsible for request/response handling and invoking the underlying application service.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.ProceduralLevels.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/v1/procedural-levels/index.ts  
**Description:** The main router file for the procedural levels feature. It defines the API routes, associates them with HTTP verbs, and wires up middleware (authentication, validation) and controller methods.  
**Template:** Express Router  
**Dependency Level:** 4  
**Name:** index  
**Type:** Router  
**Relative Path:** api/v1/procedural-levels  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Routing
    
**Requirement Ids:**
    
    - REQ-CGLE-011
    - REQ-8-027
    
**Purpose:** To configure and export the Express router for all endpoints related to procedural levels.  
**Logic Description:** This file will create a new Express Router instance. It will define a POST route for '/register'. This route definition will first apply the 'authenticate' middleware, then a validation middleware using the 'registerLevelSchema', and finally, it will call the 'proceduralLevelsController.register' method.  
**Documentation:**
    
    - **Summary:** Sets up the routing for the '/api/v1/procedural-levels' path. It ensures that requests are authenticated and validated before being handled by the controller.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent.ProceduralLevels  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/app.ts  
**Description:** The main Express application setup file. It creates the Express app instance, configures global middleware like CORS, body-parser, and a global error handler. It also mounts the main API routers.  
**Template:** Express Application  
**Dependency Level:** 5  
**Name:** app  
**Type:** Application  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Application Bootstrap
    
**Requirement Ids:**
    
    
**Purpose:** To configure and create the core Express application instance, separate from the server instantiation.  
**Logic Description:** The file creates an Express app. It uses 'cors()' and 'express.json()' middleware. It will then mount the procedural levels router under the '/api/v1/procedural-levels' path. A global error-handling middleware will be added at the end of the middleware chain to catch and format errors consistently. The configured app instance is exported.  
**Documentation:**
    
    - **Summary:** This file is responsible for creating and configuring the Express application, including setting up all middleware and routing. It does not start the server itself.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/server.ts  
**Description:** The main entry point of the application. It imports the configured Express app, establishes the connection to the MongoDB database, and starts the HTTP server to listen for incoming requests on the configured port.  
**Template:** Node.js Server  
**Dependency Level:** 6  
**Name:** server  
**Type:** Server  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Server Initialization
    
**Requirement Ids:**
    
    
**Purpose:** To start the application server and connect to the database.  
**Logic Description:** This file will import the 'app' from './app.ts' and the 'config' from './config'. It will use Mongoose to connect to the database using the MONGODB_URI from the config. Upon a successful connection, it will start the app listening on the configured PORT, logging a message to the console indicating the server is running.  
**Documentation:**
    
    - **Summary:** The executable entry point for the backend service. It handles database connection and starts the web server.
    
**Namespace:** GlyphWeaver.Backend.Api.GameContent  
**Metadata:**
    
    - **Category:** Application
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  - MONGODB_URI
  


---

