# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the project metadata, dependencies (like express, mongoose, typescript), and scripts for running, building, and testing the service.  
**Template:** TypeScript Express Template  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** ../  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    - Project Scripts
    
**Requirement Ids:**
    
    
**Purpose:** Manages project dependencies and defines command-line scripts for development lifecycle tasks.  
**Logic Description:** This file will list 'express', 'mongoose', 'typescript', 'ts-node', 'dotenv', and development dependencies like '@types/express', '@types/node', 'nodemon'. It will include scripts for 'start', 'build', and 'dev'.  
**Documentation:**
    
    - **Summary:** Standard Node.js package manifest file. It's the entry point for understanding the project's third-party libraries and how to interact with it from the command line.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler options for the project. Configures settings like target ECMAScript version, module system, output directory, strict type-checking rules, and path aliases.  
**Template:** TypeScript Express Template  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** ../  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Rules
    
**Requirement Ids:**
    
    
**Purpose:** Provides consistent compiler settings for translating TypeScript code into JavaScript.  
**Logic Description:** This file will specify 'target': 'es2020', 'module': 'commonjs', 'outDir': './dist', 'rootDir': './src', 'strict': true, and 'esModuleInterop': true. It may also define path aliases like '@app/*' to simplify import statements.  
**Documentation:**
    
    - **Summary:** Configuration file for the TypeScript compiler (tsc). It ensures that all TypeScript source code is transpiled with a consistent set of rules and options.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/index.ts  
**Description:** The main entry point for the microservice. Responsible for bootstrapping the application, loading configurations, establishing a database connection, and starting the Express server to listen for incoming requests.  
**Template:** TypeScript Express Template  
**Dependency Level:** 4  
**Name:** index  
**Type:** ApplicationEntry  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Application Bootstrap
    
**Requirement Ids:**
    
    
**Purpose:** Initializes and starts the entire Game Content microservice.  
**Logic Description:** This file will import the main 'app' object from './app.ts' and the database connection function. It will load environment variables using 'dotenv'. It then calls the database connection function and, upon a successful connection, starts the Express app server by calling 'app.listen()' on the configured port.  
**Documentation:**
    
    - **Summary:** The bootstrap file that orchestrates the startup sequence of the service.
    
**Namespace:** GlyphWeaver.Backend.GameContent  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/app.ts  
**Description:** Core application setup file. It creates the Express application instance, configures essential middleware (like JSON body parser, CORS, security headers), and registers the main API routes.  
**Template:** TypeScript Express Template  
**Dependency Level:** 3  
**Name:** app  
**Type:** ApplicationSetup  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Middleware Configuration
    - Route Registration
    
**Requirement Ids:**
    
    
**Purpose:** Configures the Express framework and connects all the major components of the API.  
**Logic Description:** This file will import 'express', create an app instance, and apply middleware using 'app.use()'. It will import the main router from './api/routes' and register it. It will also register a global error handling middleware. The configured app instance is then exported.  
**Documentation:**
    
    - **Summary:** This file defines the Express application object and its configuration, serving as the central hub for middleware and routing.
    
**Namespace:** GlyphWeaver.Backend.GameContent  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/domain/models/Zone.model.ts  
**Description:** Defines the Mongoose schema and model for a 'Zone'. This represents a distinct game zone with its associated progression parameters and complexity rules, acting as a container for levels.  
**Template:** Mongoose Model Template  
**Dependency Level:** 0  
**Name:** ZoneModel  
**Type:** Model  
**Relative Path:** domain/models  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - DDD-Aggregate
    
**Members:**
    
    - **Name:** name  
**Type:** string  
**Attributes:** public  
    - **Name:** description  
**Type:** string  
**Attributes:** public  
    - **Name:** unlockCondition  
**Type:** string  
**Attributes:** public  
    - **Name:** gridMinSize  
**Type:** number  
**Attributes:** public  
    - **Name:** gridMaxSize  
**Type:** number  
**Attributes:** public  
    - **Name:** maxGlyphTypes  
**Type:** number  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Zone Data Schema
    
**Requirement Ids:**
    
    - REQ-CGLE-001
    - REQ-8-004
    
**Purpose:** To provide a structured, validated data model for game zones within the MongoDB database.  
**Logic Description:** This file will define a Mongoose Schema with fields like 'name', 'description', 'unlockCondition', 'gridMinSize', 'gridMaxSize', and 'maxGlyphTypes'. Timestamps will be enabled. The schema will be compiled into a Mongoose model and exported.  
**Documentation:**
    
    - **Summary:** Represents the Zone aggregate root. This model defines the structure and validation rules for all zone-related data stored in the database.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Domain.Models  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/models/Level.model.ts  
**Description:** Defines the Mongoose schema for a 'Level'. This model stores the configuration for both hand-crafted levels and templates used for procedural generation, including grid data, solutions, and associated puzzle rules.  
**Template:** Mongoose Model Template  
**Dependency Level:** 0  
**Name:** LevelModel  
**Type:** Model  
**Relative Path:** domain/models  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - DDD-Aggregate
    
**Members:**
    
    - **Name:** zoneId  
**Type:** mongoose.Schema.Types.ObjectId  
**Attributes:** public  
    - **Name:** levelNumber  
**Type:** number  
**Attributes:** public  
    - **Name:** type  
**Type:** string  
**Attributes:** public  
    - **Name:** gridSize  
**Type:** number  
**Attributes:** public  
    - **Name:** timeLimit  
**Type:** number  
**Attributes:** public|optional  
    - **Name:** moveLimit  
**Type:** number  
**Attributes:** public|optional  
    - **Name:** solutionPath  
**Type:** object  
**Attributes:** public|optional  
    - **Name:** glyphs  
**Type:** Array<object>  
**Attributes:** public  
    - **Name:** obstacles  
**Type:** Array<object>  
**Attributes:** public  
    - **Name:** puzzleTypes  
**Type:** Array<string>  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Level Data Schema
    - Procedural Template Schema
    
**Requirement Ids:**
    
    - REQ-CGLE-001
    - REQ-CGLE-002
    - REQ-CGLE-008
    - REQ-8-004
    
**Purpose:** To model the structure of all static game levels and procedural templates in the database.  
**Logic Description:** This file defines a Mongoose Schema with references to Zones and includes complex nested structures for glyphs, obstacles, and solution paths. It will have an enum for the 'type' field ('handcrafted', 'procedural_template'). Timestamps will be enabled. The schema is compiled into a model.  
**Documentation:**
    
    - **Summary:** Represents the Level aggregate root. This is a critical model that defines the static content of the game, including hand-crafted tutorials and the templates for endless modes.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Domain.Models  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/models/ProceduralInstance.model.ts  
**Description:** Defines the Mongoose schema for a 'ProceduralInstance'. This model stores the specific data of a level that was procedurally generated for a player, including the seed, parameters, and solution.  
**Template:** Mongoose Model Template  
**Dependency Level:** 0  
**Name:** ProceduralInstanceModel  
**Type:** Model  
**Relative Path:** domain/models  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - DDD-Entity
    
**Members:**
    
    - **Name:** baseLevelId  
**Type:** mongoose.Schema.Types.ObjectId  
**Attributes:** public  
    - **Name:** generationSeed  
**Type:** string  
**Attributes:** public  
    - **Name:** generationParameters  
**Type:** object  
**Attributes:** public  
    - **Name:** gridConfig  
**Type:** object  
**Attributes:** public  
    - **Name:** solutionPath  
**Type:** object  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Procedural Level Instance Storage
    
**Requirement Ids:**
    
    - REQ-CGLE-011
    - REQ-8-004
    - REQ-8-027
    
**Purpose:** To persist the exact state of a procedurally generated level for reproducibility and analysis.  
**Logic Description:** This schema links to a base 'Level' template and stores all the unique data that defined this specific instance: the seed, parameters used, the full grid configuration, and at least one valid solution. This is crucial for hints, support, and debugging.  
**Documentation:**
    
    - **Summary:** Represents a concrete instance of a procedurally generated level. This model captures the output of the generation algorithm, making dynamic content persistent and verifiable.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Domain.Models  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/interfaces/ILevelRepository.ts  
**Description:** Defines the contract for the Level repository, abstracting the data access logic from the application services. This interface specifies methods for querying level and procedural template data.  
**Template:** TypeScript Interface Template  
**Dependency Level:** 1  
**Name:** ILevelRepository  
**Type:** Interface  
**Relative Path:** domain/interfaces  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - DDD-Repository
    - DependencyInversion
    
**Members:**
    
    
**Methods:**
    
    - **Name:** findById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<Level | null>  
**Attributes:** public  
    - **Name:** findByZoneId  
**Parameters:**
    
    - zoneId: string
    
**Return Type:** Promise<Level[]>  
**Attributes:** public  
    - **Name:** findAllTemplates  
**Parameters:**
    
    
**Return Type:** Promise<Level[]>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Level Data Access Contract
    
**Requirement Ids:**
    
    - REQ-CGLE-002
    - REQ-CGLE-008
    
**Purpose:** To decouple the application's business logic from the specific database implementation for levels.  
**Logic Description:** This interface will declare methods for common data retrieval patterns related to levels, such as finding a level by its ID, getting all levels within a specific zone, and fetching all procedural generation templates. It uses domain model types in its signatures.  
**Documentation:**
    
    - **Summary:** Specifies the methods that any Level data repository must implement, ensuring a consistent data access API for the application layer.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Domain.Interfaces  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/infrastructure/repositories/MongooseLevelRepository.ts  
**Description:** The concrete implementation of the ILevelRepository interface using Mongoose. This class handles all direct interactions with the MongoDB 'levels' collection.  
**Template:** Mongoose Repository Template  
**Dependency Level:** 2  
**Name:** MongooseLevelRepository  
**Type:** Repository  
**Relative Path:** infrastructure/repositories  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - DDD-Repository
    
**Members:**
    
    - **Name:** levelModel  
**Type:** mongoose.Model<Level>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** findById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<Level | null>  
**Attributes:** public  
    - **Name:** findByZoneId  
**Parameters:**
    
    - zoneId: string
    
**Return Type:** Promise<Level[]>  
**Attributes:** public  
    - **Name:** findAllTemplates  
**Parameters:**
    
    
**Return Type:** Promise<Level[]>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Level CRUD Operations
    
**Requirement Ids:**
    
    - REQ-CGLE-002
    - REQ-CGLE-008
    
**Purpose:** To provide a concrete data access layer for level content using Mongoose and MongoDB.  
**Logic Description:** This class implements the ILevelRepository interface. Each method will use the injected Mongoose LevelModel to perform database queries, such as 'levelModel.findById()', 'levelModel.find({ zoneId })', and 'levelModel.find({ type: 'procedural_template' })'.  
**Documentation:**
    
    - **Summary:** Handles all database operations for the Level collection, translating application layer requests into Mongoose queries.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Infrastructure.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/database/connection.ts  
**Description:** Manages the connection to the MongoDB database using Mongoose. It handles connecting on application startup and includes logic for handling connection events like errors and disconnections.  
**Template:** Mongoose Connection Template  
**Dependency Level:** 1  
**Name:** DatabaseConnection  
**Type:** InfrastructureService  
**Relative Path:** infrastructure/database  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** connect  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** public|static  
    
**Implemented Features:**
    
    - MongoDB Connection Management
    
**Requirement Ids:**
    
    
**Purpose:** To establish and maintain a reliable connection to the MongoDB database for the entire service.  
**Logic Description:** This file contains a function that reads the MongoDB connection string from environment variables. It uses 'mongoose.connect()' to establish the connection and sets up event listeners for 'connected', 'error', and 'disconnected' events to log the connection status.  
**Documentation:**
    
    - **Summary:** A singleton or static class responsible for the lifecycle of the MongoDB database connection.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Infrastructure.Database  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/application/services/level.service.ts  
**Description:** The application service responsible for orchestrating business logic related to levels. It uses repositories to fetch data and formats it into DTOs for the presentation layer.  
**Template:** TypeScript Service Template  
**Dependency Level:** 3  
**Name:** LevelService  
**Type:** Service  
**Relative Path:** application/services  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - ServiceLayer
    
**Members:**
    
    - **Name:** levelRepository  
**Type:** ILevelRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getLevelDetails  
**Parameters:**
    
    - levelId: string
    
**Return Type:** Promise<LevelDto>  
**Attributes:** public  
    - **Name:** getLevelsForZone  
**Parameters:**
    
    - zoneId: string
    
**Return Type:** Promise<LevelSummaryDto[]>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Level Data Orchestration
    
**Requirement Ids:**
    
    - REQ-CGLE-001
    - REQ-CGLE-002
    
**Purpose:** To provide high-level operations for level-related use cases, acting as a facade for the domain and data access layers.  
**Logic Description:** This service class will be instantiated with a concrete repository (via dependency injection). Its methods, like 'getLevelDetails', will call the repository to fetch raw domain models, then map them to DTOs before returning them. It contains the core orchestration logic for level-related features.  
**Documentation:**
    
    - **Summary:** This service orchestrates the retrieval and processing of game level data, providing a clean interface for the API controllers.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/api/controllers/level.controller.ts  
**Description:** The Express controller that handles all HTTP requests related to game levels. It parses request parameters, invokes the appropriate application service method, and sends the response back to the client.  
**Template:** Express Controller Template  
**Dependency Level:** 4  
**Name:** LevelController  
**Type:** Controller  
**Relative Path:** api/controllers  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - MVC-Controller
    
**Members:**
    
    - **Name:** levelService  
**Type:** LevelService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getById  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** getByZone  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Level API Endpoints
    
**Requirement Ids:**
    
    - REQ-CGLE-001
    - REQ-CGLE-002
    
**Purpose:** To expose level-related functionalities over a RESTful HTTP API.  
**Logic Description:** This class contains methods corresponding to API endpoints. For example, the 'getById' method will extract the 'levelId' from 'req.params', call 'levelService.getLevelDetails(levelId)', and then send the resulting DTO back to the client using 'res.status(200).json(...)'. It includes try-catch blocks to pass errors to the global error handler.  
**Documentation:**
    
    - **Summary:** Manages the request/response cycle for all API endpoints under the '/levels' route.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Api.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/routes/levels.routes.ts  
**Description:** Defines the Express router for all API endpoints related to levels. It maps HTTP methods and URL paths (e.g., GET /:id) to the corresponding controller methods.  
**Template:** Express Router Template  
**Dependency Level:** 5  
**Name:** LevelRoutes  
**Type:** Router  
**Relative Path:** api/routes  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Level API Routing
    
**Requirement Ids:**
    
    - REQ-CGLE-001
    - REQ-CGLE-002
    
**Purpose:** To configure the routing table for the '/levels' API resource.  
**Logic Description:** This file will create a new Express Router instance. It will define routes like 'router.get('/:id', levelController.getById)' and 'router.get('/zone/:zoneId', levelController.getByZone)'. The configured router object is then exported to be used by the main app.  
**Documentation:**
    
    - **Summary:** This file contains the route definitions that direct incoming HTTP requests for the '/levels' path to the appropriate controller logic.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Api.Routes  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/application/dtos/level.dto.ts  
**Description:** Defines the Data Transfer Object (DTO) for Level data. This object represents the structure of level information as it is sent over the network to clients, decoupling the API contract from the internal domain model.  
**Template:** TypeScript DTO Template  
**Dependency Level:** 1  
**Name:** LevelDto  
**Type:** DTO  
**Relative Path:** application/dtos  
**Repository Id:** REPO-GLYPH-GAMECONTENT  
**Pattern Ids:**
    
    - DTO
    
**Members:**
    
    - **Name:** id  
**Type:** string  
**Attributes:** public  
    - **Name:** levelNumber  
**Type:** number  
**Attributes:** public  
    - **Name:** gridSize  
**Type:** number  
**Attributes:** public  
    - **Name:** puzzleTypes  
**Type:** string[]  
**Attributes:** public  
    - **Name:** glyphs  
**Type:** GlyphInstanceDto[]  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Level API Data Contract
    
**Requirement Ids:**
    
    - REQ-CGLE-001
    - REQ-CGLE-002
    
**Purpose:** To provide a clean, stable data structure for API responses concerning levels, hiding internal implementation details.  
**Logic Description:** This file will define a TypeScript interface or class named 'LevelDto' and related DTOs for nested objects like glyphs and obstacles. It will contain only the properties that are relevant and safe to expose to the client, omitting sensitive data like pre-defined solutions unless specifically requested.  
**Documentation:**
    
    - **Summary:** Defines the public data contract for a game level, used in API responses.
    
**Namespace:** GlyphWeaver.Backend.GameContent.Application.Dtos  
**Metadata:**
    
    - **Category:** ApplicationServices
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableDetailedLogging
  - enableABTestingForLevels
  - enableSeasonalEvents
  
- **Database Configs:**
  
  - MONGO_URI
  - MONGO_DB_NAME
  


---

