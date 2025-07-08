# Specification

# 1. Files

- **Path:** backend/src/api/leaderboards/leaderboard.routes.ts  
**Description:** Defines and registers all RESTful API routes for leaderboard functionalities. It maps HTTP endpoints to specific controller methods and applies necessary middleware like authentication and request validation.  
**Template:** TypeScript Express Route  
**Dependency Level:** 3  
**Name:** leaderboardRoutes  
**Type:** Router  
**Relative Path:** leaderboard.routes.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** router  
**Type:** express.Router  
**Attributes:** private|const  
    - **Name:** leaderboardController  
**Type:** LeaderboardController  
**Attributes:** private|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Leaderboard Data Retrieval
    - Player Score Submission
    - Player Rank Retrieval
    
**Requirement Ids:**
    
    - REQ-SCF-003
    - REQ-8-014
    - REQ-SEC-005
    
**Purpose:** To establish the API endpoints for all leaderboard-related interactions and wire them to the appropriate controller logic and middleware.  
**Logic Description:** Initialize an Express router. Instantiate the LeaderboardController. Define routes for GET /:leaderboardKey, POST /:leaderboardKey/scores, and GET /:leaderboardKey/rank/me. Apply JWT authentication middleware to secure the endpoints. Apply Joi validation middleware to the score submission route to validate the request body against the defined schema. Export the configured router.  
**Documentation:**
    
    - **Summary:** This file acts as the entry point for the Leaderboard API, defining the public-facing contract and routing incoming HTTP requests.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/leaderboards/controllers/leaderboard.controller.ts  
**Description:** Handles incoming HTTP requests for leaderboards. It orchestrates calls to the LeaderboardService to fetch data or process submissions, and formats the final HTTP response.  
**Template:** TypeScript Express Controller  
**Dependency Level:** 2  
**Name:** LeaderboardController  
**Type:** Controller  
**Relative Path:** controllers/leaderboard.controller.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - DependencyInjection
    
**Members:**
    
    - **Name:** leaderboardService  
**Type:** ILeaderboardService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - leaderboardService: ILeaderboardService
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** getLeaderboard  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** submitScore  
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
    
    - Leaderboard API endpoint handling
    - Score Submission endpoint handling
    
**Requirement Ids:**
    
    - REQ-SCF-005
    - REQ-SCF-006
    - REQ-8-014
    - REQ-SEC-005
    
**Purpose:** To act as the presentation layer for the Leaderboard API, translating HTTP requests into service calls and service responses into HTTP responses.  
**Logic Description:** The constructor receives a LeaderboardService instance via dependency injection. The getLeaderboard method extracts the leaderboard key and query parameters (limit, offset) from the request, calls the service to get the leaderboard view, and sends the data as a JSON response. The submitScore method extracts the score submission DTO from the request body and the player ID from the JWT token, calls the service to process the submission, and returns a success response with the player's new rank. getPlayerRank retrieves the player's specific rank from the service.  
**Documentation:**
    
    - **Summary:** This controller manages the request/response cycle for leaderboard operations, delegating all business logic to the application service layer.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/leaderboards/services/leaderboard.service.ts  
**Description:** Contains the core application logic for managing leaderboards. It coordinates repositories, caching, and cheat detection to fulfill use cases.  
**Template:** TypeScript Service  
**Dependency Level:** 1  
**Name:** LeaderboardService  
**Type:** Service  
**Relative Path:** services/leaderboard.service.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - ServiceLayerPattern
    - DependencyInjection
    
**Members:**
    
    - **Name:** scoreRepository  
**Type:** IScoreRepository  
**Attributes:** private|readonly  
    - **Name:** leaderboardRepository  
**Type:** ILeaderboardRepository  
**Attributes:** private|readonly  
    - **Name:** playerRepository  
**Type:** IPlayerRepository  
**Attributes:** private|readonly  
    - **Name:** cheatDetectionService  
**Type:** ICheatDetectionService  
**Attributes:** private|readonly  
    - **Name:** cacheProvider  
**Type:** ICacheProvider  
**Attributes:** private|readonly  
    - **Name:** auditService  
**Type:** IAuditService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getLeaderboardView  
**Parameters:**
    
    - leaderboardKey: string
    - options: { limit: number, offset: number }
    
**Return Type:** Promise<LeaderboardViewDto>  
**Attributes:** public  
    - **Name:** processScoreSubmission  
**Parameters:**
    
    - leaderboardKey: string
    - userId: string
    - submission: SubmitScoreDto
    
**Return Type:** Promise<{ rank: number }>  
**Attributes:** public  
    - **Name:** getPlayerRankView  
**Parameters:**
    
    - leaderboardKey: string
    - userId: string
    
**Return Type:** Promise<LeaderboardEntryDto>  
**Attributes:** public  
    - **Name:** excludePlayerFromLeaderboards  
**Parameters:**
    
    - userId: string
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Score validation and processing
    - Leaderboard data retrieval with caching
    - Tie-breaking logic implementation
    - Player exclusion for cheating
    
**Requirement Ids:**
    
    - REQ-SCF-003
    - REQ-SCF-006
    - REQ-SCF-007
    - REQ-SCF-012
    - REQ-8-014
    - REQ-8-015
    - REQ-SEC-005
    - REQ-SEC-007
    
**Purpose:** To orchestrate all business operations related to leaderboards, acting as the primary entry point for the application logic.  
**Logic Description:** The getLeaderboardView method first checks the cache. On a cache miss, it fetches leaderboard definition and top scores from repositories, enriches scores with player data, formats the DTO, then stores the result in the cache with a timestamp. processScoreSubmission uses the CheatDetectionService to validate the score. If valid, it saves the score via the ScoreRepository, invalidates the relevant leaderboard cache, logs the submission via the AuditService, and returns the player's new rank. If invalid, it logs the suspicious activity. excludePlayerFromLeaderboards updates the player's profile to mark them as excluded.  
**Documentation:**
    
    - **Summary:** This service encapsulates all logic for leaderboard management, including fetching, caching, score submission, validation, and administration.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/src/api/leaderboards/services/cheatDetection.service.ts  
**Description:** Implements server-side validation logic to detect and prevent cheating in score submissions.  
**Template:** TypeScript Service  
**Dependency Level:** 1  
**Name:** CheatDetectionService  
**Type:** Service  
**Relative Path:** services/cheatDetection.service.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - StrategyPattern
    
**Members:**
    
    - **Name:** levelRepository  
**Type:** ILevelRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** isScoreValid  
**Parameters:**
    
    - submission: SubmitScoreDto
    - leaderboard: Leaderboard
    
**Return Type:** Promise<boolean>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Anomaly detection in scores
    - Validation against level parameters
    - Resilience against client-side manipulation
    
**Requirement Ids:**
    
    - REQ-8-014
    - REQ-SEC-005
    
**Purpose:** To centralize and execute all cheat detection logic, ensuring the integrity of leaderboard data.  
**Logic Description:** The isScoreValid method performs a series of checks. It fetches level parameters (e.g., max possible score) from a level repository. It validates that the submitted score is not higher than the maximum possible. It may check for impossibly fast completion times based on the submission metadata. It also validates the submission's checksum or hash against server-recalculated values to detect data manipulation. Returns true if all checks pass, false otherwise.  
**Documentation:**
    
    - **Summary:** Provides a single point of validation for incoming player scores to protect against common cheating vectors.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/src/api/leaderboards/services/audit.service.ts  
**Description:** Handles the logging of critical and auditable events related to the leaderboard system.  
**Template:** TypeScript Service  
**Dependency Level:** 1  
**Name:** AuditService  
**Type:** Service  
**Relative Path:** services/audit.service.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** auditLogRepository  
**Type:** IAuditLogRepository  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** logScoreSubmission  
**Parameters:**
    
    - details: { userId: string, leaderboardKey: string, score: number, isValid: boolean }
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** logSuspiciousActivity  
**Parameters:**
    
    - details: { userId: string, reason: string, submissionData: object }
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Score submission logging
    - Suspicious activity logging
    
**Requirement Ids:**
    
    - REQ-SCF-014
    - REQ-8-016
    - REQ-SEC-007
    
**Purpose:** To provide a dedicated service for creating structured audit logs for security, compliance, and operational insight.  
**Logic Description:** This service provides methods that abstract the creation of audit log entries. Each method constructs a standardized JSON payload for the event and uses the AuditLogRepository to persist it. This ensures all audit logs are consistent and contain the required contextual information for later review.  
**Documentation:**
    
    - **Summary:** A centralized service for logging all auditable actions within the leaderboard domain, ensuring a consistent and secure audit trail.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/src/api/leaderboards/repositories/score.repository.ts  
**Description:** Manages data persistence and retrieval for player scores in the MongoDB database.  
**Template:** TypeScript Repository  
**Dependency Level:** 0  
**Name:** ScoreRepository  
**Type:** Repository  
**Relative Path:** repositories/score.repository.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** playerScoreModel  
**Type:** Model<IPlayerScore>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** create  
**Parameters:**
    
    - scoreData: Partial<IPlayerScore>
    
**Return Type:** Promise<IPlayerScore>  
**Attributes:** public  
    - **Name:** findByLeaderboard  
**Parameters:**
    
    - leaderboardId: string
    - options: { limit: number, offset: number }
    
**Return Type:** Promise<IPlayerScore[]>  
**Attributes:** public  
    - **Name:** getPlayerRank  
**Parameters:**
    
    - leaderboardId: string
    - userId: string
    
**Return Type:** Promise<number | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Player score CRUD operations
    - Leaderboard ranking queries
    
**Requirement Ids:**
    
    - REQ-SCF-007
    - REQ-SCF-012
    - REQ-8-015
    
**Purpose:** To abstract all database interactions related to the PlayerScore collection, providing a clean interface for the application layer.  
**Logic Description:** This class uses the Mongoose PlayerScore model to perform database operations. The 'create' method saves a new score. 'findByLeaderboard' uses a MongoDB query with .sort() based on score and tie-breaking fields, .skip() for offset, and .limit() for pagination. 'getPlayerRank' uses .countDocuments() on scores higher than the player's score to determine the rank. All methods leverage the indexes defined on the PlayerScore schema for performance.  
**Documentation:**
    
    - **Summary:** Provides data access methods for creating and querying player scores, optimized for leaderboard ranking and retrieval.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/src/api/leaderboards/repositories/leaderboard.repository.ts  
**Description:** Manages data persistence and retrieval for leaderboard definitions in the MongoDB database.  
**Template:** TypeScript Repository  
**Dependency Level:** 0  
**Name:** LeaderboardRepository  
**Type:** Repository  
**Relative Path:** repositories/leaderboard.repository.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** leaderboardModel  
**Type:** Model<ILeaderboard>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** findByKeyName  
**Parameters:**
    
    - keyName: string
    
**Return Type:** Promise<ILeaderboard | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Leaderboard definition retrieval
    
**Requirement Ids:**
    
    - REQ-SCF-003
    - REQ-SCF-007
    
**Purpose:** To provide a data access layer for retrieving the configuration and metadata of a specific leaderboard.  
**Logic Description:** This class uses the Mongoose Leaderboard model. The `findByKeyName` method queries the database for a leaderboard document that matches the given programmatic key. This is used to fetch rules like scoring type and tie-breaking logic before processing scores or displaying results.  
**Documentation:**
    
    - **Summary:** A repository focused on fetching leaderboard definition documents from the database based on their unique key.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/src/api/leaderboards/repositories/player.repository.ts  
**Description:** Manages data retrieval for player profiles, specifically for enriching leaderboard data.  
**Template:** TypeScript Repository  
**Dependency Level:** 0  
**Name:** PlayerRepository  
**Type:** Repository  
**Relative Path:** repositories/player.repository.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** playerProfileModel  
**Type:** Model<IPlayerProfile>  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** findManyByIds  
**Parameters:**
    
    - userIds: string[]
    
**Return Type:** Promise<Map<string, { username: string, avatarUrl?: string }>>  
**Attributes:** public  
    - **Name:** setLeaderboardExclusion  
**Parameters:**
    
    - userId: string
    - isExcluded: boolean
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Player data enrichment for leaderboards
    - Player exclusion management
    
**Requirement Ids:**
    
    - REQ-SCF-005
    - REQ-SEC-007
    
**Purpose:** To provide an efficient way to fetch player information needed for display on leaderboards and to manage player status.  
**Logic Description:** The `findManyByIds` method takes an array of user IDs and performs a single efficient query to fetch the corresponding profiles, returning a Map for easy lookup. This is used to add usernames and avatars to leaderboard entries. The `setLeaderboardExclusion` method updates a flag on the player's profile document, used by the CheatDetectionService to enforce bans.  
**Documentation:**
    
    - **Summary:** Provides a data access layer for bulk-fetching player display data and managing player-specific leaderboard settings.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/src/api/leaderboards/providers/cache.provider.ts  
**Description:** Implements the caching logic using Redis (or another caching provider) to store and retrieve frequently accessed leaderboard data.  
**Template:** TypeScript Provider  
**Dependency Level:** 0  
**Name:** CacheProvider  
**Type:** Provider  
**Relative Path:** providers/cache.provider.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** redisClient  
**Type:** Redis  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** get  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<string | null>  
**Attributes:** public  
    - **Name:** set  
**Parameters:**
    
    - key: string
    - value: string
    - ttlSeconds: number
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** invalidate  
**Parameters:**
    
    - key: string
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Leaderboard caching
    - Cache invalidation
    
**Requirement Ids:**
    
    - REQ-SCF-006
    - REQ-SCF-012
    - REQ-8-015
    
**Purpose:** To provide an abstraction over the caching mechanism, allowing the application to store and retrieve data without being coupled to a specific implementation like Redis.  
**Logic Description:** This class initializes and manages a connection to the Redis server using 'ioredis'. The 'get' method retrieves a value for a key. The 'set' method stores a key-value pair with a specified Time-To-Live (TTL). The 'invalidate' method deletes a key from the cache, which is essential for clearing stale leaderboard data after a new score is submitted.  
**Documentation:**
    
    - **Summary:** An infrastructure service that provides a simple, promise-based interface for interacting with a distributed cache like Redis.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Providers  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** backend/src/api/leaderboards/models/playerScore.model.ts  
**Description:** Defines the Mongoose schema and model for the PlayerScore entity, which represents a single score entry for a leaderboard.  
**Template:** TypeScript Mongoose Model  
**Dependency Level:** 0  
**Name:** PlayerScoreModel  
**Type:** Model  
**Relative Path:** models/playerScore.model.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** leaderboardId  
**Type:** Schema.Types.ObjectId  
**Attributes:** public  
    - **Name:** userId  
**Type:** Schema.Types.ObjectId  
**Attributes:** public  
    - **Name:** scoreValue  
**Type:** Number  
**Attributes:** public  
    - **Name:** metadata  
**Type:** object  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Player score data structure
    - Database indexing for ranking
    
**Requirement Ids:**
    
    - REQ-SCF-007
    - REQ-SCF-012
    - REQ-8-015
    
**Purpose:** To define the data structure, validation rules, and database indexes for player score documents stored in MongoDB.  
**Logic Description:** Defines a Mongoose schema for 'playerScores'. It specifies fields like leaderboardId, userId, scoreValue, and a flexible 'metadata' object for tie-breakers (e.g., completionTime, moves). Crucially, it defines a compound index on { leaderboardId: 1, scoreValue: -1, 'metadata.completionTime': 1 } to ensure efficient querying for ranked leaderboard results.  
**Documentation:**
    
    - **Summary:** This file contains the Mongoose schema definition for storing and indexing individual player scores for leaderboards.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/src/api/leaderboards/models/leaderboard.model.ts  
**Description:** Defines the Mongoose schema and model for the Leaderboard entity, which holds the configuration for a specific leaderboard.  
**Template:** TypeScript Mongoose Model  
**Dependency Level:** 0  
**Name:** LeaderboardModel  
**Type:** Model  
**Relative Path:** models/leaderboard.model.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** keyName  
**Type:** string  
**Attributes:** public|unique  
    - **Name:** name  
**Type:** string  
**Attributes:** public  
    - **Name:** scope  
**Type:** string  
**Attributes:** public  
    - **Name:** tieBreakingFields  
**Type:** string[]  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Leaderboard configuration structure
    
**Requirement Ids:**
    
    - REQ-SCF-003
    - REQ-SCF-007
    
**Purpose:** To define the data structure for leaderboard configuration documents, including their unique key and ranking rules.  
**Logic Description:** Defines a Mongoose schema for the 'leaderboards' collection. Includes a unique 'keyName' for programmatic access, a display 'name', the 'scope' (global, event), and an array 'tieBreakingFields' that specifies the order and direction of fields within the PlayerScore's metadata object to use for tie-breaking. An index is placed on 'keyName' for fast lookups.  
**Documentation:**
    
    - **Summary:** This file contains the Mongoose schema for leaderboard definitions, specifying how each leaderboard should behave and be identified.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/src/api/leaderboards/dtos/submit-score.dto.ts  
**Description:** Defines the data transfer object for a score submission request from the client.  
**Template:** TypeScript DTO  
**Dependency Level:** 1  
**Name:** SubmitScoreDto  
**Type:** DTO  
**Relative Path:** dtos/submit-score.dto.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** score  
**Type:** number  
**Attributes:** public  
    - **Name:** completionTime  
**Type:** number  
**Attributes:** public  
    - **Name:** moves  
**Type:** number  
**Attributes:** public  
    - **Name:** validationHash  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Score Submission API Contract
    
**Requirement Ids:**
    
    - REQ-8-014
    
**Purpose:** To define a clear, typed contract for the data expected in the body of a score submission API request.  
**Logic Description:** A simple TypeScript interface or class that defines the properties required for a score submission. This includes the primary score, plus metadata like completionTime and moves for tie-breaking, and a validationHash for basic cheat detection.  
**Documentation:**
    
    - **Summary:** Represents the data structure for a client submitting a new score to a leaderboard.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Dtos  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/leaderboards/dtos/leaderboard-view.dto.ts  
**Description:** Defines the data transfer object for a leaderboard view response sent to the client.  
**Template:** TypeScript DTO  
**Dependency Level:** 1  
**Name:** LeaderboardViewDto  
**Type:** DTO  
**Relative Path:** dtos/leaderboard-view.dto.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** leaderboardName  
**Type:** string  
**Attributes:** public  
    - **Name:** entries  
**Type:** LeaderboardEntryDto[]  
**Attributes:** public  
    - **Name:** totalEntries  
**Type:** number  
**Attributes:** public  
    - **Name:** lastRefreshed  
**Type:** Date  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Leaderboard Retrieval API Contract
    
**Requirement Ids:**
    
    - REQ-SCF-005
    - REQ-SCF-006
    
**Purpose:** To define the structured response for a request to view a leaderboard, including the ranked entries and metadata.  
**Logic Description:** A TypeScript interface or class defining the overall leaderboard response. It contains metadata about the leaderboard itself, an array of LeaderboardEntryDto objects representing the ranked players, the total number of entries in the leaderboard, and a timestamp indicating when the data was last refreshed (from cache or database).  
**Documentation:**
    
    - **Summary:** Represents the complete data payload for displaying a leaderboard, including ranked entries and relevant metadata like refresh time.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Dtos  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/leaderboards/dtos/leaderboard-entry.dto.ts  
**Description:** Defines the data transfer object for a single entry within a leaderboard.  
**Template:** TypeScript DTO  
**Dependency Level:** 0  
**Name:** LeaderboardEntryDto  
**Type:** DTO  
**Relative Path:** dtos/leaderboard-entry.dto.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** rank  
**Type:** number  
**Attributes:** public  
    - **Name:** playerName  
**Type:** string  
**Attributes:** public  
    - **Name:** score  
**Type:** number  
**Attributes:** public  
    - **Name:** submittedAt  
**Type:** Date  
**Attributes:** public  
    - **Name:** avatarUrl  
**Type:** string | null  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Leaderboard Entry API Contract
    
**Requirement Ids:**
    
    - REQ-SCF-005
    
**Purpose:** To define the data structure for a single row in a leaderboard display, containing all necessary information about a player's rank and score.  
**Logic Description:** A TypeScript interface or class that specifies the fields for one leaderboard entry: the player's rank, their display name, their score, the timestamp of the score, and an optional URL for their avatar.  
**Documentation:**
    
    - **Summary:** Represents a single player's ranked entry on a leaderboard.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Dtos  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/leaderboards/validation/leaderboard.validator.ts  
**Description:** Contains Joi validation schemas for validating incoming API requests for the leaderboard endpoints.  
**Template:** TypeScript Joi Validator  
**Dependency Level:** 1  
**Name:** LeaderboardValidator  
**Type:** Validator  
**Relative Path:** validation/leaderboard.validator.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** submitScoreSchema  
**Type:** Joi.ObjectSchema  
**Attributes:** public|static|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Score Submission Request Validation
    
**Requirement Ids:**
    
    - REQ-8-014
    
**Purpose:** To ensure that data received from clients for score submissions is well-formed, of the correct type, and within expected ranges before being processed by the service.  
**Logic Description:** This file defines one or more Joi schemas. The `submitScoreSchema` validates the `SubmitScoreDto`. It ensures that 'score', 'completionTime', and 'moves' are positive numbers, and that 'validationHash' is a non-empty string. This schema is used in an Express middleware to automatically validate incoming requests and reject invalid ones with a 400 Bad Request error.  
**Documentation:**
    
    - **Summary:** Provides schemas for validating the structure and content of leaderboard-related API requests.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Validation  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** backend/src/api/leaderboards/interfaces/leaderboard.interfaces.ts  
**Description:** Defines TypeScript interfaces for all services, repositories, and providers within the leaderboard domain, enabling dependency injection and testability.  
**Template:** TypeScript Interface  
**Dependency Level:** 2  
**Name:** LeaderboardInterfaces  
**Type:** Interface  
**Relative Path:** interfaces/leaderboard.interfaces.ts  
**Repository Id:** REPO-GLYPH-LEADERBOARD  
**Pattern Ids:**
    
    - DependencyInjection
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Inversion Principle
    
**Requirement Ids:**
    
    
**Purpose:** To establish contracts between different layers of the leaderboard API, promoting loose coupling and making components interchangeable and mockable for tests.  
**Logic Description:** This file contains a series of TypeScript interface definitions. For example, `ILeaderboardService` defines the public methods of LeaderboardService. `IScoreRepository` defines the methods for the ScoreRepository. `ICacheProvider` defines the get, set, and invalidate methods. Services and controllers will depend on these interfaces rather than concrete implementations.  
**Documentation:**
    
    - **Summary:** A central file for all TypeScript interface definitions (contracts) used within the leaderboard feature, crucial for a clean, decoupled architecture.
    
**Namespace:** GlyphWeaver.Backend.Api.Leaderboards.Interfaces  
**Metadata:**
    
    - **Category:** ApplicationServices
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableLeaderboardCaching
  - enableAdvancedCheatDetection
  
- **Database Configs:**
  
  


---

