# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines project metadata, dependencies, and scripts for the Authentication API service. Includes dependencies like express, typescript, bcryptjs, jsonwebtoken, joi, and development dependencies like @types/node.  
**Template:** Node.js package.json  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** ../  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    
**Requirement Ids:**
    
    
**Purpose:** Manages project dependencies, scripts, and metadata for the Node.js application.  
**Logic Description:** This file lists all required npm packages for the application to run, such as express for the web server, jsonwebtoken for JWT handling, bcryptjs for password hashing, and joi for validation. It also contains scripts for building and running the application (e.g., 'start', 'build', 'dev').  
**Documentation:**
    
    - **Summary:** Standard npm configuration file that outlines the project's dependencies and provides scripts for development and deployment.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration for the project. Specifies compiler options like target ECMAScript version, module system, strict type-checking, and output directory.  
**Template:** TypeScript tsconfig.json  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** ../  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation
    
**Requirement Ids:**
    
    
**Purpose:** Configures the TypeScript compiler with rules for transpiling TypeScript code to JavaScript.  
**Logic Description:** This file sets essential compiler options. 'target' will be set to a modern ECMAScript version like 'ES2020'. 'module' will be 'CommonJS'. 'outDir' will point to the 'dist' folder. 'rootDir' will be 'src'. Strict type-checking options like 'strict' and 'esModuleInterop' will be enabled to ensure code quality and robustness.  
**Documentation:**
    
    - **Summary:** Defines the settings and rules for the TypeScript compiler, ensuring consistent and correct transpilation of the project's source code.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/config/index.ts  
**Description:** Central configuration file that loads environment variables and exports them as a typed configuration object for use throughout the application. It ensures that all required configurations are present before the application starts.  
**Template:** TypeScript Module  
**Dependency Level:** 0  
**Name:** index  
**Type:** Configuration  
**Relative Path:** config  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** config  
**Type:** Object  
**Attributes:** export|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Centralized Configuration
    
**Requirement Ids:**
    
    - REQ-SEC-001
    - REQ-SEC-010
    
**Purpose:** Provides a single, type-safe source for all application configuration variables, such as ports, JWT secrets, and database settings.  
**Logic Description:** This file imports environment variables using a library like 'dotenv' for local development. It defines a configuration object with properties like 'port', 'jwtSecret', 'jwtExpiresIn', 'refreshTokenSecret', 'bcryptSaltRounds', etc. It throws an error on startup if any essential environment variable is missing, ensuring a fail-fast mechanism.  
**Documentation:**
    
    - **Summary:** Aggregates and exports all application configurations loaded from environment variables, providing a typed and centralized point of access.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/domain/audit-event.model.ts  
**Description:** Defines the data structure for an audit log event, specifying the properties that constitute a security-relevant event.  
**Template:** TypeScript Interface  
**Dependency Level:** 0  
**Name:** AuditEvent  
**Type:** Model  
**Relative Path:** domain  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    - Domain-Driven Design (DDD) Principles
    
**Members:**
    
    - **Name:** eventType  
**Type:** string  
**Attributes:** readonly  
    - **Name:** userId  
**Type:** string | null  
**Attributes:** readonly  
    - **Name:** ipAddress  
**Type:** string  
**Attributes:** readonly  
    - **Name:** details  
**Type:** Record<string, any>  
**Attributes:** readonly  
    - **Name:** timestamp  
**Type:** Date  
**Attributes:** readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Audit Event Data Structure
    
**Requirement Ids:**
    
    - REQ-SEC-019
    - REQ-8-019
    
**Purpose:** Provides a consistent, typed structure for all audit log entries created by the system.  
**Logic Description:** This interface defines the non-negotiable fields for any audit event. 'eventType' will be a specific enum or string literal (e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILURE'). 'userId' is included when an event is associated with a specific user. 'details' is a flexible object to hold event-specific context.  
**Documentation:**
    
    - **Summary:** Defines the contract for an audit event, ensuring all security-related logs have a consistent and comprehensive structure.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Domain  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/application/interfaces/audit-logging.service.interface.ts  
**Description:** Defines the contract for the Audit Logging Service. This abstraction allows the Authentication Service to log security events without being coupled to a specific logging implementation.  
**Template:** TypeScript Interface  
**Dependency Level:** 1  
**Name:** IAuditLoggingService  
**Type:** Interface  
**Relative Path:** application/interfaces  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    - Dependency Injection (DI)
    - Service Layer Pattern (Application Services)
    
**Members:**
    
    
**Methods:**
    
    - **Name:** logEvent  
**Parameters:**
    
    - event: AuditEvent
    
**Return Type:** Promise<void>  
**Attributes:**   
    
**Implemented Features:**
    
    - Audit Logging Abstraction
    
**Requirement Ids:**
    
    - REQ-SEC-019
    - REQ-8-019
    
**Purpose:** Specifies the interface for a service responsible for persisting security audit events.  
**Logic Description:** This interface declares a single method, `logEvent`, which accepts a structured `AuditEvent` object. This decouples the business logic (AuthenticationService) from the infrastructure concern of how and where logs are stored (e.g., console, file, database, external service).  
**Documentation:**
    
    - **Summary:** Defines the contract for logging security and audit events, ensuring a consistent interface for event logging across the application.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Application.Interfaces  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/application/interfaces/player.repository.interface.ts  
**Description:** Defines the contract for the Player Repository. This is a crucial boundary, abstracting the data access logic for player profiles from the authentication service.  
**Template:** TypeScript Interface  
**Dependency Level:** 1  
**Name:** IPlayerRepository  
**Type:** Interface  
**Relative Path:** application/interfaces  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    - Repository Pattern
    - Dependency Injection (DI)
    
**Members:**
    
    
**Methods:**
    
    - **Name:** findByEmail  
**Parameters:**
    
    - email: string
    
**Return Type:** Promise<Player | null>  
**Attributes:**   
    - **Name:** findById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<Player | null>  
**Attributes:**   
    - **Name:** create  
**Parameters:**
    
    - playerData: Omit<Player, 'id'>
    
**Return Type:** Promise<Player>  
**Attributes:**   
    - **Name:** updatePlatformLink  
**Parameters:**
    
    - userId: string
    - platform: string
    - platformId: string
    
**Return Type:** Promise<Player>  
**Attributes:**   
    
**Implemented Features:**
    
    - Player Data Access Abstraction
    
**Requirement Ids:**
    
    - REQ-SCF-002
    - REQ-SEC-010
    
**Purpose:** Specifies the interface for all data operations related to player accounts, decoupling business logic from the database.  
**Logic Description:** This interface defines methods essential for the authentication flow: finding a user by their email for login, creating a new user during registration, and updating a user's profile to link a platform-specific ID. The implementation of this interface would reside in a data access layer, likely in another repository.  
**Documentation:**
    
    - **Summary:** Defines the contract for accessing and manipulating player data, providing a consistent data access API for the application services.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Application.Interfaces  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/application/services/authentication.service.ts  
**Description:** Implements the core business logic for user authentication. Handles user registration, password verification, JWT generation, token refreshing, and linking platform accounts.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** AuthenticationService  
**Type:** Service  
**Relative Path:** application/services  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    - Service Layer Pattern (Application Services)
    - Dependency Injection (DI)
    
**Members:**
    
    - **Name:** playerRepository  
**Type:** IPlayerRepository  
**Attributes:** private|readonly  
    - **Name:** auditLogger  
**Type:** IAuditLoggingService  
**Attributes:** private|readonly  
    - **Name:** tokenService  
**Type:** ITokenService  
**Attributes:** private|readonly  
    - **Name:** passwordHasher  
**Type:** IPasswordHasher  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** register  
**Parameters:**
    
    - registerDto: RegisterRequestDto
    - ipAddress: string
    
**Return Type:** Promise<{ player: Player, tokens: AuthResponseDto }>  
**Attributes:** public  
    - **Name:** login  
**Parameters:**
    
    - loginDto: LoginRequestDto
    - ipAddress: string
    
**Return Type:** Promise<AuthResponseDto>  
**Attributes:** public  
    - **Name:** refreshAuth  
**Parameters:**
    
    - refreshToken: string
    
**Return Type:** Promise<AuthResponseDto>  
**Attributes:** public  
    - **Name:** linkPlatformAccount  
**Parameters:**
    
    - userId: string
    - linkDto: LinkPlatformRequestDto
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - User Registration
    - User Login
    - Token Refresh
    - Platform Account Linking
    - Audit Logging
    
**Requirement Ids:**
    
    - REQ-SCF-002
    - REQ-SEC-010
    - REQ-SEC-019
    - REQ-8-019
    
**Purpose:** Contains all business logic related to authentication, acting as an orchestrator between the API controllers and data/infrastructure layers.  
**Logic Description:** The `register` method checks if a user exists, hashes the password using the password hasher, creates the user via the player repository, generates JWTs, and logs the success event. The `login` method finds the user, compares the password hash, generates new JWTs upon success, and logs both success and failure attempts with the user's IP address. `linkPlatformAccount` validates the platform token (if necessary) and updates the player record via the repository. All significant actions trigger an event via the audit logger.  
**Documentation:**
    
    - **Summary:** Provides the core use case implementations for authentication. It orchestrates interactions with repositories and other services to securely manage user registration, login, and account linking.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/api/dtos/register-request.dto.ts  
**Description:** Data Transfer Object defining the shape of the request body for user registration.  
**Template:** TypeScript Class  
**Dependency Level:** 1  
**Name:** RegisterRequestDto  
**Type:** DTO  
**Relative Path:** api/dtos  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** email  
**Type:** string  
**Attributes:** public  
    - **Name:** password  
**Type:** string  
**Attributes:** public  
    - **Name:** username  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Contract
    
**Requirement Ids:**
    
    - REQ-SEC-010
    
**Purpose:** Defines the expected input structure for the user registration endpoint.  
**Logic Description:** A simple class or interface that defines the properties required to create a new user account: a unique username, a valid email address, and a password that meets complexity requirements.  
**Documentation:**
    
    - **Summary:** Specifies the data contract for a new user registration request, containing the user's desired username, email, and password.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Api.Dtos  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/dtos/login-request.dto.ts  
**Description:** Data Transfer Object defining the shape of the request body for user login.  
**Template:** TypeScript Class  
**Dependency Level:** 1  
**Name:** LoginRequestDto  
**Type:** DTO  
**Relative Path:** api/dtos  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** email  
**Type:** string  
**Attributes:** public  
    - **Name:** password  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Contract
    
**Requirement Ids:**
    
    - REQ-SEC-010
    
**Purpose:** Defines the expected input structure for the user login endpoint.  
**Logic Description:** A simple class or interface that defines the credentials required for a user to log in: their email address and password.  
**Documentation:**
    
    - **Summary:** Specifies the data contract for a user login request, containing the user's email and password.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Api.Dtos  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/dtos/auth-response.dto.ts  
**Description:** Data Transfer Object defining the shape of the response body for successful authentication (login or registration).  
**Template:** TypeScript Class  
**Dependency Level:** 1  
**Name:** AuthResponseDto  
**Type:** DTO  
**Relative Path:** api/dtos  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** accessToken  
**Type:** string  
**Attributes:** public  
    - **Name:** refreshToken  
**Type:** string  
**Attributes:** public  
    - **Name:** userId  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Contract
    
**Requirement Ids:**
    
    - REQ-SEC-010
    
**Purpose:** Defines the structure of the data returned to the client upon successful authentication.  
**Logic Description:** This class or interface specifies the fields returned to the client after a successful login or registration, including a short-lived access token for API requests, a long-lived refresh token to get a new access token, and the authenticated user's ID.  
**Documentation:**
    
    - **Summary:** Specifies the data contract for a successful authentication response, providing the client with an access token, refresh token, and user identifier.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Api.Dtos  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/dtos/link-platform-request.dto.ts  
**Description:** Data Transfer Object defining the shape of the request body for linking a platform account.  
**Template:** TypeScript Class  
**Dependency Level:** 1  
**Name:** LinkPlatformRequestDto  
**Type:** DTO  
**Relative Path:** api/dtos  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** platform  
**Type:** 'game-center' | 'google-play'  
**Attributes:** public  
    - **Name:** platformId  
**Type:** string  
**Attributes:** public  
    - **Name:** platformToken  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Contract
    
**Requirement Ids:**
    
    - REQ-SCF-002
    
**Purpose:** Defines the expected input structure for the platform account linking endpoint.  
**Logic Description:** This class defines the properties needed to link a third-party platform account (like Game Center or Google Play Games) to an existing custom game account. It includes the platform name, the user's ID on that platform, and a token for server-side validation if required by the platform.  
**Documentation:**
    
    - **Summary:** Specifies the data contract for a request to link a platform-specific account (e.g., Game Center) to a user's primary game account.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Api.Dtos  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/validation/auth.validation.ts  
**Description:** Contains Joi validation schemas for all authentication-related DTOs. Ensures that incoming requests have the correct format and data types before they reach the controller.  
**Template:** TypeScript Module  
**Dependency Level:** 2  
**Name:** auth.validation  
**Type:** Validator  
**Relative Path:** api/validation  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** registerSchema  
**Type:** Joi.ObjectSchema  
**Attributes:** export|const  
    - **Name:** loginSchema  
**Type:** Joi.ObjectSchema  
**Attributes:** export|const  
    - **Name:** linkPlatformSchema  
**Type:** Joi.ObjectSchema  
**Attributes:** export|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Request Validation
    
**Requirement Ids:**
    
    - REQ-SEC-010
    
**Purpose:** Provides centralized, schema-based validation for all authentication API endpoints.  
**Logic Description:** This file defines several Joi schemas. 'registerSchema' will validate that 'email' is a valid email, 'password' meets complexity rules (e.g., min length), and 'username' is a non-empty string. 'loginSchema' validates email and password presence. 'linkPlatformSchema' validates the platform identifier and token strings. These schemas are used by a validation middleware.  
**Documentation:**
    
    - **Summary:** Defines and exports validation schemas using the Joi library to enforce the data contracts for authentication-related API requests.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Api.Validation  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/controllers/auth.controller.ts  
**Description:** Handles the HTTP request and response cycle for authentication endpoints. It delegates the core logic to the AuthenticationService.  
**Template:** TypeScript Controller  
**Dependency Level:** 3  
**Name:** AuthController  
**Type:** Controller  
**Relative Path:** api/controllers  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    - Model-View-Controller (MVC) / Model-View-Presenter (MVP) / Model-View-ViewModel (MVVM)
    
**Members:**
    
    - **Name:** authenticationService  
**Type:** IAuthenticationService  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** register  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** login  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** refresh  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** linkPlatform  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - HTTP Endpoint Handling
    
**Requirement Ids:**
    
    - REQ-SCF-002
    - REQ-SEC-010
    
**Purpose:** Acts as the entry point for all authentication-related API requests, orchestrating the validation and service logic.  
**Logic Description:** Each method in this controller corresponds to a specific API route. It extracts the validated request body (DTO), calls the appropriate method on the `authenticationService`, and then formats the service's response into an HTTP response with the correct status code (e.g., 201 for register, 200 for login). It uses a try-catch block to pass any errors to the global error handling middleware.  
**Documentation:**
    
    - **Summary:** Manages the request/response lifecycle for authentication endpoints, validating inputs and delegating business logic to the AuthenticationService.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Api.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/routes/auth.routes.ts  
**Description:** Defines the Express router for all authentication-related endpoints, mapping HTTP verbs and URL paths to the corresponding controller methods.  
**Template:** Express.js Router  
**Dependency Level:** 4  
**Name:** auth.routes  
**Type:** Router  
**Relative Path:** api/routes  
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** router  
**Type:** express.Router  
**Attributes:** export|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Routing
    
**Requirement Ids:**
    
    - REQ-SCF-002
    - REQ-SEC-010
    
**Purpose:** Configures the API routes for authentication and applies necessary middleware like request validation.  
**Logic Description:** This file creates an Express router instance. It defines POST routes for '/register' and '/login', and potentially a POST route for '/refresh' and a protected POST route for '/link-platform'. Each route is associated with a validation middleware (using the Joi schemas) and the corresponding method from the `AuthController`. This router is then exported to be used by the main application.  
**Documentation:**
    
    - **Summary:** Sets up the routing for all authentication endpoints, linking them to validation middleware and controller handlers.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth.Api.Routes  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/server.ts  
**Description:** The main entry point for the Authentication API application. It initializes the Express server, configures middleware, mounts the API routes, and starts listening for connections.  
**Template:** Express.js Server  
**Dependency Level:** 5  
**Name:** server  
**Type:** Application  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-AUTH  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Server Bootstrap
    
**Requirement Ids:**
    
    - REQ-SEC-001
    
**Purpose:** Bootstraps and runs the Express.js web server for the Authentication API.  
**Logic Description:** This file imports the main auth router, config object, and core middleware like a global error handler. It creates an Express app instance, applies security middleware (like helmet), a CORS policy, and a JSON body parser. It mounts the main router at a base path (e.g., '/api/v1'). Finally, it starts the server to listen on the port defined in the configuration. It will include logic to use https.createServer for HTTPS enforcement.  
**Documentation:**
    
    - **Summary:** Initializes and starts the Express application server, configuring all necessary middleware and routing for the API.
    
**Namespace:** GlyphWeaver.Backend.Api.Auth  
**Metadata:**
    
    - **Category:** Application
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  


---

