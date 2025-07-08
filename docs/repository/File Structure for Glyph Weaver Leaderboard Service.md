# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the project's metadata, dependencies, and scripts for running, building, and testing the Leaderboard microservice.  
**Template:** Node.js Package  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    - Script Execution
    
**Requirement Ids:**
    
    
**Purpose:** To manage all Node.js project dependencies and define command-line scripts for development, testing, and building the service.  
**Logic Description:** This file lists all required npm packages like express, mongoose, redis, typescript, and their respective versions. It also contains scripts for 'dev' (run with ts-node-dev), 'build' (transpile TypeScript to JavaScript), 'start' (run the built JavaScript), and 'test'.  
**Documentation:**
    
    - **Summary:** Standard Node.js package manifest. It is the central piece for managing the project's dependencies and defining runnable scripts.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Build
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration file. It specifies the root files and the compiler options required to compile the TypeScript project into JavaScript.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Settings
    
**Requirement Ids:**
    
    
**Purpose:** To configure the TypeScript compiler (tsc) with strict type-checking, module resolution strategies, and output directory settings.  
**Logic Description:** Configures the compiler to target a modern ECMAScript version (e.g., ES2022), use the 'CommonJS' module system, enable strict type checking options, define output and root directories, and enable decorator metadata and source maps for debugging.  
**Documentation:**
    
    - **Summary:** This file dictates how the TypeScript code is transpiled into JavaScript, ensuring type safety and modern syntax compatibility.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Build
    
- **Path:** src/main.ts  
**Description:** The entry point for the Leaderboard microservice. This file bootstraps the application, initializes all components, and starts the Express server.  
**Template:** Node.js Application Entrypoint  
**Dependency Level:** 5  
**Name:** main  
**Type:** Application  
**Relative Path:** main.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - Dependency Injection
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Server Bootstrap
    - Middleware Configuration
    - Database Connection
    - Graceful Shutdown
    
**Requirement Ids:**
    
    
**Purpose:** To initialize and wire together all parts of the application, including the web server, database connections, and middleware, then begin listening for requests.  
**Logic Description:** Imports necessary modules and configurations. Creates an Express application instance. Configures middleware for CORS, JSON body parsing, and logging. Establishes connections to MongoDB and Redis. Mounts the main API router. Sets up a global error handler. Implements a graceful shutdown mechanism to close connections properly on SIGINT/SIGTERM signals. Finally, starts the server on the configured port.  
**Documentation:**
    
    - **Summary:** The main runnable file that launches the microservice. It orchestrates the setup and startup sequence of the entire application.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/config/index.ts  
**Description:** Central configuration module that loads, validates, and exports all environment-specific settings for the application.  
**Template:** Node.js Configuration  
**Dependency Level:** 0  
**Name:** config  
**Type:** Configuration  
**Relative Path:** config/index.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment Variable Loading
    - Configuration Validation
    
**Requirement Ids:**
    
    
**Purpose:** To provide a single, validated source of truth for all configuration variables used throughout the service.  
**Logic Description:** Uses a library like 'dotenv' to load environment variables from a .env file for local development. Defines a schema (e.g., using Zod) to validate the presence and type of required variables like PORT, MONGO_URI, REDIS_URL, etc. Exports the validated configuration object for use in other parts of the application.  
**Documentation:**
    
    - **Summary:** This module centralizes application configuration, ensuring that all required settings are present and valid at startup.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/domain/models/score.model.ts  
**Description:** Defines the Score entity, representing a player's submitted score for a leaderboard. This is a core domain model.  
**Template:** TypeScript Class  
**Dependency Level:** 0  
**Name:** Score  
**Type:** Entity  
**Relative Path:** domain/models/score.model.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - Domain-Driven Design
    
**Members:**
    
    - **Name:** id  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** leaderboardId  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** playerId  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** scoreValue  
**Type:** number  
**Attributes:** public|readonly  
    - **Name:** tieBreakerValue  
**Type:** number  
**Attributes:** public|readonly  
    - **Name:** submittedAt  
**Type:** Date  
**Attributes:** public|readonly  
    - **Name:** metadata  
**Type:** Record<string, any>  
**Attributes:** public|readonly  
    - **Name:** isSuspicious  
**Type:** boolean  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** flagAsSuspicious  
**Parameters:**
    
    
**Return Type:** void  
**Attributes:** public  
    
**Implemented Features:**
    
    - Score Entity Definition
    
**Requirement Ids:**
    
    - REQ-SCF-005
    - REQ-SCF-007
    
**Purpose:** To encapsulate the properties and intrinsic business rules of a score submission.  
**Logic Description:** This class represents a single score entry. The constructor validates the inputs to ensure a score is valid upon creation (e.g., scoreValue is a non-negative number). It contains business logic methods like 'flagAsSuspicious' to modify its state according to domain rules.  
**Documentation:**
    
    - **Summary:** Represents a core business entity, the Score. It holds all relevant information about a score submission, including values for ranking and tie-breaking.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Domain  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/models/leaderboard.model.ts  
**Description:** Defines the Leaderboard entity, representing the configuration and rules for a specific leaderboard.  
**Template:** TypeScript Class  
**Dependency Level:** 0  
**Name:** Leaderboard  
**Type:** Aggregate  
**Relative Path:** domain/models/leaderboard.model.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - Domain-Driven Design
    
**Members:**
    
    - **Name:** id  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** name  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** scope  
**Type:** 'global' | 'event'  
**Attributes:** public|readonly  
    - **Name:** resetCycle  
**Type:** 'daily' | 'weekly' | 'none'  
**Attributes:** public|readonly  
    - **Name:** tieBreakingFields  
**Type:** string[]  
**Attributes:** public|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Leaderboard Aggregate Definition
    
**Requirement Ids:**
    
    - REQ-SCF-003
    - REQ-SCF-007
    
**Purpose:** To act as the aggregate root for leaderboard-related operations, defining its identity and consistency boundaries.  
**Logic Description:** This class models a leaderboard's properties, such as its name, scope (global or event-based), reset frequency, and the fields used for tie-breaking. It serves as the main entry point for operations related to a specific leaderboard.  
**Documentation:**
    
    - **Summary:** The Leaderboard aggregate root, which defines the properties and rules for a specific leaderboard in the system.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Domain  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/application/interfaces/IScoreRepository.ts  
**Description:** Defines the contract for a repository that handles persistence for Score entities.  
**Template:** TypeScript Interface  
**Dependency Level:** 1  
**Name:** IScoreRepository  
**Type:** RepositoryInterface  
**Relative Path:** application/interfaces/IScoreRepository.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - RepositoryPattern
    - Dependency Inversion Principle
    
**Members:**
    
    
**Methods:**
    
    - **Name:** add  
**Parameters:**
    
    - score: Score
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** getScoresByLeaderboardId  
**Parameters:**
    
    - leaderboardId: string
    - limit: number
    - offset: number
    
**Return Type:** Promise<Score[]>  
**Attributes:** public  
    - **Name:** getPlayerRank  
**Parameters:**
    
    - leaderboardId: string
    - playerId: string
    
**Return Type:** Promise<number | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Score Persistence Contract
    
**Requirement Ids:**
    
    - REQ-SCF-003
    - REQ-SCF-005
    
**Purpose:** To decouple the application layer from the specific database implementation for scores, enabling easier testing and maintainability.  
**Logic Description:** This interface declares methods for common data operations related to scores, such as adding a new score, retrieving a page of scores for a given leaderboard, and calculating a specific player's rank.  
**Documentation:**
    
    - **Summary:** An interface that defines the required methods for any class responsible for persisting and retrieving Score domain models.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Application.Interfaces  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/application/interfaces/ICacheService.ts  
**Description:** Defines the contract for a caching service, abstracting the underlying implementation (e.g., Redis).  
**Template:** TypeScript Interface  
**Dependency Level:** 1  
**Name:** ICacheService  
**Type:** ServiceInterface  
**Relative Path:** application/interfaces/ICacheService.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - Dependency Inversion Principle
    
**Members:**
    
    
**Methods:**
    
    - **Name:** get  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<T | null>  
**Attributes:** public  
    - **Name:** set  
**Parameters:**
    
    - key: string
    - value: T
    - ttlSeconds?: number
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** del  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Caching Abstraction
    
**Requirement Ids:**
    
    - REQ-SCF-012
    
**Purpose:** To provide a generic interface for caching operations, allowing the application to use caching without being tightly coupled to Redis.  
**Logic Description:** This interface specifies standard cache operations: get a value by key, set a value with an optional time-to-live (TTL), and delete a value by key. It uses generics to be type-safe.  
**Documentation:**
    
    - **Summary:** A contract for a key-value caching service. Its implementation will handle the connection and commands to a caching backend like Redis.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Application.Interfaces  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/infrastructure/persistence/mongo/repositories/score.repository.ts  
**Description:** MongoDB-specific implementation of the IScoreRepository interface. Handles all database operations for Score documents.  
**Template:** TypeScript Repository  
**Dependency Level:** 2  
**Name:** ScoreRepository  
**Type:** Repository  
**Relative Path:** infrastructure/persistence/mongo/repositories/score.repository.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** scoreModel  
**Type:** Model<IScoreDocument>  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** add  
**Parameters:**
    
    - score: Score
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** getScoresByLeaderboardId  
**Parameters:**
    
    - leaderboardId: string
    - limit: number
    - offset: number
    
**Return Type:** Promise<Score[]>  
**Attributes:** public  
    - **Name:** getPlayerRank  
**Parameters:**
    
    - leaderboardId: string
    - playerId: string
    
**Return Type:** Promise<number | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Score CRUD Operations
    
**Requirement Ids:**
    
    - REQ-SCF-003
    - REQ-SCF-005
    - REQ-SCF-012
    
**Purpose:** To provide a concrete implementation for persisting and retrieving Score entities using MongoDB and Mongoose.  
**Logic Description:** This class implements the IScoreRepository interface. It uses a Mongoose model to interact with the 'scores' collection. The 'getScoresByLeaderboardId' method will use .sort(), .skip(), and .limit() for pagination and ranking. The 'getPlayerRank' method will use MongoDB's aggregation framework or count methods to determine a player's position.  
**Documentation:**
    
    - **Summary:** This repository is responsible for all data access logic concerning Score entities, translating domain models into MongoDB documents and vice-versa.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Infrastructure.Persistence  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/caching/redisCache.service.ts  
**Description:** Redis-specific implementation of the ICacheService interface.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** RedisCacheService  
**Type:** Service  
**Relative Path:** infrastructure/caching/redisCache.service.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** redisClient  
**Type:** RedisClientType  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** get  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<T | null>  
**Attributes:** public  
    - **Name:** set  
**Parameters:**
    
    - key: string
    - value: T
    - ttlSeconds?: number
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** del  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Redis Caching Logic
    
**Requirement Ids:**
    
    - REQ-SCF-012
    
**Purpose:** To provide a concrete implementation for caching using a Redis backend, encapsulating all Redis-specific commands.  
**Logic Description:** This class implements the ICacheService interface. It uses a Redis client library (e.g., 'redis') to connect to the Redis server. The 'get' method will retrieve and JSON.parse the value. The 'set' method will JSON.stringify the value and use the 'EX' option if a TTL is provided. The 'del' method will use the Redis DEL command.  
**Documentation:**
    
    - **Summary:** A service that provides caching capabilities by interacting with a Redis instance. It is used to store frequently accessed data like leaderboard views.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Infrastructure.Caching  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/application/services/cheatDetection.service.ts  
**Description:** A service responsible for analyzing score submissions for potential cheating.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** CheatDetectionService  
**Type:** Service  
**Relative Path:** application/services/cheatDetection.service.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** isScoreAnomalous  
**Parameters:**
    
    - scoreSubmission: SubmitScoreDto
    
**Return Type:** Promise<{ isAnomalous: boolean; reason: string | null }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Score Anomaly Detection
    
**Requirement Ids:**
    
    - REQ-SEC-005
    
**Purpose:** To encapsulate the logic for identifying suspicious scores based on game rules and heuristics.  
**Logic Description:** The 'isScoreAnomalous' method will contain a pipeline of checks. It will check if the score is mathematically possible for the given level, compare the submission time against a minimum possible completion time, and potentially analyze the sequence of moves if provided. It will return a boolean indicating suspicion and a reason for the finding.  
**Documentation:**
    
    - **Summary:** This service provides the core cheat detection functionality, analyzing submitted scores to ensure leaderboard integrity.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/api/dtos/submitScore.dto.ts  
**Description:** Data Transfer Object for validating the score submission payload from the client.  
**Template:** TypeScript Class  
**Dependency Level:** 1  
**Name:** SubmitScoreDto  
**Type:** DTO  
**Relative Path:** api/dtos/submitScore.dto.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** leaderboardId  
**Type:** string  
**Attributes:** public  
    - **Name:** playerId  
**Type:** string  
**Attributes:** public  
    - **Name:** scoreValue  
**Type:** number  
**Attributes:** public  
    - **Name:** tieBreakerValue  
**Type:** number  
**Attributes:** public  
    - **Name:** validationPayload  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Contract for Score Submission
    
**Requirement Ids:**
    
    - REQ-SCF-005
    - REQ-SEC-005
    
**Purpose:** To define the expected structure and data types for an incoming score submission request, used for validation.  
**Logic Description:** This class is used with a validation library like 'class-validator' and 'class-transformer' to automatically validate incoming HTTP request bodies. Decorators (e.g., @IsString(), @IsNumber()) are used to enforce validation rules.  
**Documentation:**
    
    - **Summary:** Defines the data contract for the 'submit score' API endpoint. It ensures that incoming requests are well-formed before being processed by the application logic.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Api.Dto  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/controllers/leaderboard.controller.ts  
**Description:** The Express controller that handles all HTTP requests related to leaderboards.  
**Template:** TypeScript Controller  
**Dependency Level:** 3  
**Name:** LeaderboardController  
**Type:** Controller  
**Relative Path:** api/controllers/leaderboard.controller.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** submitScoreHandler  
**Type:** SubmitScoreHandler  
**Attributes:** private  
    - **Name:** getLeaderboardHandler  
**Type:** GetLeaderboardHandler  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** submitScore  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** getLeaderboard  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** getPlayerRank  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Leaderboard API Endpoint Handling
    
**Requirement Ids:**
    
    - REQ-SCF-003
    - REQ-SCF-005
    - REQ-SCF-006
    - REQ-SEC-005
    
**Purpose:** To receive HTTP requests, delegate the processing to the appropriate application use case handlers, and format the HTTP response.  
**Logic Description:** This class's methods are Express route handlers. They extract data from the request object (body, params, query), create a Command or Query object, and pass it to the corresponding handler from the application layer. It then formats the result from the handler into a JSON response with an appropriate HTTP status code.  
**Documentation:**
    
    - **Summary:** Acts as the entry point for all API requests related to leaderboards. It bridges the gap between the HTTP transport layer and the application's core logic.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Api.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/application/useCases/submitScore/submitScore.handler.ts  
**Description:** Handles the business logic for the 'Submit Score' use case.  
**Template:** TypeScript Command Handler  
**Dependency Level:** 3  
**Name:** SubmitScoreHandler  
**Type:** Handler  
**Relative Path:** application/useCases/submitScore/submitScore.handler.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - Command Pattern
    
**Members:**
    
    - **Name:** scoreRepository  
**Type:** IScoreRepository  
**Attributes:** private|readonly  
    - **Name:** cheatDetectionService  
**Type:** CheatDetectionService  
**Attributes:** private|readonly  
    - **Name:** cacheService  
**Type:** ICacheService  
**Attributes:** private|readonly  
    - **Name:** auditLogger  
**Type:** IAuditLogService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** execute  
**Parameters:**
    
    - command: SubmitScoreCommand
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Score Submission Logic
    - Cheat Detection Invocation
    - Cache Invalidation
    
**Requirement Ids:**
    
    - REQ-SCF-006
    - REQ-SEC-005
    - REQ-SEC-007
    
**Purpose:** To orchestrate the entire process of a score submission, including validation, persistence, and cache management.  
**Logic Description:** The execute method first calls the CheatDetectionService. If the score is flagged as anomalous, it logs the suspicious activity and rejects the submission. If the score is valid, it creates a new Score domain entity, persists it using the ScoreRepository. After successful persistence, it invalidates the relevant leaderboard cache in Redis using the CacheService. Both successful and suspicious submissions are logged via the AuditLogService.  
**Documentation:**
    
    - **Summary:** This handler encapsulates all the steps required to process a new score submission, ensuring data integrity and consistency.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Application.UseCases  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/application/useCases/getLeaderboard/getLeaderboard.handler.ts  
**Description:** Handles the business logic for the 'Get Leaderboard' use case.  
**Template:** TypeScript Query Handler  
**Dependency Level:** 3  
**Name:** GetLeaderboardHandler  
**Type:** Handler  
**Relative Path:** application/useCases/getLeaderboard/getLeaderboard.handler.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - Query Pattern
    
**Members:**
    
    - **Name:** scoreRepository  
**Type:** IScoreRepository  
**Attributes:** private|readonly  
    - **Name:** cacheService  
**Type:** ICacheService  
**Attributes:** private|readonly  
    - **Name:** rankingService  
**Type:** RankingService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** execute  
**Parameters:**
    
    - query: GetLeaderboardQuery
    
**Return Type:** Promise<LeaderboardViewDto>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Leaderboard Data Retrieval
    - Caching Logic
    
**Requirement Ids:**
    
    - REQ-SCF-003
    - REQ-SCF-005
    - REQ-SCF-006
    - REQ-SCF-012
    
**Purpose:** To retrieve and format leaderboard data, utilizing a cache-aside strategy for performance.  
**Logic Description:** The execute method first attempts to fetch the requested leaderboard view from the cache (Redis) using a key derived from the query parameters. If a cache hit occurs, it returns the cached data. If it's a cache miss, it fetches the raw scores from the ScoreRepository, uses the RankingService to calculate ranks and apply tie-breaking, formats the data into a DTO, stores the DTO in the cache for future requests, and finally returns the DTO.  
**Documentation:**
    
    - **Summary:** This handler is responsible for fetching, ranking, and caching leaderboard data to provide fast and consistent responses to the client.
    
**Namespace:** GlyphWeaver.Backend.Leaderboard.Application.UseCases  
**Metadata:**
    
    - **Category:** ApplicationServices
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableDetailedCheatDetectionLogging
  - enableFriendsLeaderboard
  
- **Database Configs:**
  
  - MONGO_URI
  - REDIS_URL
  - PORT
  - LOG_LEVEL
  - JWT_SECRET
  


---

