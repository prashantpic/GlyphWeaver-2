# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the project metadata, dependencies, and scripts required to run, build, and test the API Gateway.  
**Template:** Node.js package.json  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Project dependency management
    - NPM script definitions for development, build, and start processes
    
**Requirement Ids:**
    
    
**Purpose:** Manages all project dependencies and provides scripts for building and running the application.  
**Logic Description:** This file lists all production dependencies such as 'express', 'helmet', 'cors', 'express-rate-limit', 'express-http-proxy', 'dotenv', 'swagger-jsdoc', 'swagger-ui-express', and 'winston'. It also includes development dependencies like 'typescript', 'ts-node', 'nodemon', '@types/*' for type definitions, and 'eslint' for linting. Scripts will include 'start' (runs compiled JS), 'build' (compiles TS to JS), and 'dev' (runs the server with hot-reloading using ts-node and nodemon).  
**Documentation:**
    
    - **Summary:** Standard NPM package file for a TypeScript/Node.js project. It is the entry point for dependency installation and script execution.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration file. It specifies root files and compiler options required to compile the project.  
**Template:** TypeScript tsconfig.json  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript compilation rules
    - Module resolution strategy
    
**Requirement Ids:**
    
    
**Purpose:** Configures the TypeScript compiler (tsc) to correctly transpile the project's TypeScript code into JavaScript for execution by Node.js.  
**Logic Description:** Compiler options will be set to target a modern ECMAScript version (e.g., ES2020), use 'CommonJS' modules, and enable strict type-checking ('strict': true). It will define the output directory (e.g., 'dist'), the root source directory ('src'), and enable 'esModuleInterop' and 'resolveJsonModule' for better compatibility with modern libraries. 'sourceMap' will be enabled for easier debugging.  
**Documentation:**
    
    - **Summary:** Defines how the TypeScript compiler should behave, ensuring type safety and correct JavaScript output.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** .env.example  
**Description:** An example template file that lists all necessary environment variables for the application. This file should be committed to source control and contains no sensitive values.  
**Template:** Environment Variables Template  
**Dependency Level:** 0  
**Name:** .env.example  
**Type:** Configuration  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment variable documentation
    
**Requirement Ids:**
    
    - REQ-SEC-002
    
**Purpose:** Provides a clear template for developers to create their own local '.env' file, ensuring all required configuration variables are known.  
**Logic Description:** This file will list keys for environment variables like PORT, CORS_ORIGIN, JWT_SECRET or JWT_PUBLIC_KEY_URL, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, and URLs for all downstream microservices (e.g., AUTH_SERVICE_URL, PLAYER_SERVICE_URL, LEADERBOARD_SERVICE_URL, etc.). Values will be placeholders (e.g., 'your_jwt_secret_here').  
**Documentation:**
    
    - **Summary:** A template file showing the structure and required keys for the environment-specific '.env' configuration file.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/config/index.ts  
**Description:** Centralized configuration loader. It loads environment variables from '.env' file using 'dotenv' and exports them as a strongly-typed configuration object for the rest of the application to use.  
**Template:** TypeScript Configuration Module  
**Dependency Level:** 1  
**Name:** config  
**Type:** Configuration  
**Relative Path:** config  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** env  
**Type:** Object  
**Attributes:** public|static|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Typed configuration management
    - Centralized access to environment variables
    
**Requirement Ids:**
    
    - REQ-SEC-002
    
**Purpose:** To provide a single, type-safe source of truth for all application configurations, abstracting away the use of `process.env`.  
**Logic Description:** This module will import 'dotenv' and call `dotenv.config()`. It will then define and export a frozen object (`Object.freeze`) containing all necessary configuration values, parsed from `process.env`. It will perform basic validation, throwing an error if a required environment variable is missing on startup. It will expose variables for the server port, downstream service URLs, JWT secrets, rate limit settings, and CORS policies.  
**Documentation:**
    
    - **Summary:** Loads and validates environment variables, exporting them as a read-only, typed configuration object. This prevents configuration drift and runtime errors due to missing variables.
    
**Namespace:** GlyphWeaver.Backend.Gateway.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/utils/logger.ts  
**Description:** Configures and exports a centralized logger instance (e.g., using Winston) for the entire application.  
**Template:** TypeScript Utility Module  
**Dependency Level:** 1  
**Name:** logger  
**Type:** Utility  
**Relative Path:** utils  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** logger  
**Type:** Logger  
**Attributes:** public|static  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Structured logging
    - Configurable log levels
    
**Requirement Ids:**
    
    
**Purpose:** To provide a consistent, structured logging mechanism throughout the application.  
**Logic Description:** This file will import the 'winston' library. It will create a logger instance with different transports based on the environment. For development, it will use a console transport with colorization and a simple format. For production, it will use a console transport with a JSON format for easy ingestion by log management systems. The log level will be configurable via an environment variable.  
**Documentation:**
    
    - **Summary:** A singleton logger module that provides a standardized logging interface (info, warn, error, debug) for use across all other application modules.
    
**Namespace:** GlyphWeaver.Backend.Gateway.Utils  
**Metadata:**
    
    - **Category:** Utility
    
- **Path:** src/middleware/rateLimit.middleware.ts  
**Description:** Configures and exports the rate-limiting middleware for the API gateway to prevent abuse.  
**Template:** TypeScript Middleware  
**Dependency Level:** 2  
**Name:** rateLimitMiddleware  
**Type:** Middleware  
**Relative Path:** middleware  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** createRateLimiter  
**Parameters:**
    
    
**Return Type:** RateLimitRequestHandler  
**Attributes:** public  
    
**Implemented Features:**
    
    - Global API rate limiting
    
**Requirement Ids:**
    
    - REQ-SEC-006
    
**Purpose:** To protect the backend services from being overwhelmed by too many requests from a single IP address in a short period.  
**Logic Description:** This module will import 'express-rate-limit'. It will create a rate limiter instance configured with values from the central config module (e.g., `config.env.RATE_LIMIT_WINDOW_MS`, `config.env.RATE_LIMIT_MAX_REQUESTS`). It will set standard headers (`standardHeaders: true`) and legacy headers (`legacyHeaders: false`). This middleware will be applied globally in `app.ts`.  
**Documentation:**
    
    - **Summary:** Provides a configured instance of the express-rate-limit middleware to be used in the main application pipeline to enforce request throttling.
    
**Namespace:** GlyphWeaver.Backend.Gateway.Middleware  
**Metadata:**
    
    - **Category:** Middleware
    
- **Path:** src/middleware/auth.middleware.ts  
**Description:** Handles JWT-based authentication for incoming requests. It verifies the token and attaches user information to the request object.  
**Template:** TypeScript Middleware  
**Dependency Level:** 2  
**Name:** authMiddleware  
**Type:** Middleware  
**Relative Path:** middleware  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** verifyToken  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - JWT validation
    - User context injection
    
**Requirement Ids:**
    
    
**Purpose:** To secure routes by ensuring that incoming requests have a valid JSON Web Token.  
**Logic Description:** This middleware will extract the JWT from the 'Authorization' header. It will use a library like 'jsonwebtoken' to verify the token's signature against a secret or public key fetched from the configuration. Upon successful verification, it will decode the token payload (containing user ID, roles, etc.) and attach it to an extended Express Request object (e.g., `req.user`). If the token is missing, invalid, or expired, it will send a 401 Unauthorized or 403 Forbidden response. This middleware will be selectively applied to routes that require authentication.  
**Documentation:**
    
    - **Summary:** An Express middleware that acts as a guard for protected routes. It validates the JWT in the request header and, if valid, passes control to the next handler; otherwise, it terminates the request with an authentication error.
    
**Namespace:** GlyphWeaver.Backend.Gateway.Middleware  
**Metadata:**
    
    - **Category:** Middleware
    
- **Path:** src/middleware/proxy.middleware.ts  
**Description:** A factory function that creates a proxy middleware for a specific downstream service.  
**Template:** TypeScript Middleware  
**Dependency Level:** 2  
**Name:** proxyMiddleware  
**Type:** Middleware  
**Relative Path:** middleware  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** createProxy  
**Parameters:**
    
    - serviceName: string
    - targetUrl: string
    
**Return Type:** RequestHandler  
**Attributes:** public  
    
**Implemented Features:**
    
    - Request forwarding
    - Path rewriting
    
**Requirement Ids:**
    
    
**Purpose:** To transparently forward incoming requests from the gateway to the appropriate backend microservice.  
**Logic Description:** This module will import 'express-http-proxy'. The `createProxy` function will take a target URL and return a configured proxy instance. It will include logic in `proxyReqPathResolver` to correctly rewrite the request path, removing the base path of the gateway route. It will also forward necessary headers, such as the user context information attached by the `auth.middleware.ts`, so downstream services know who the user is. The proxy will handle streaming of request and response bodies.  
**Documentation:**
    
    - **Summary:** A utility that leverages express-http-proxy to create configurable middleware for routing requests to various internal microservices. This is the core of the gateway's routing mechanism.
    
**Namespace:** GlyphWeaver.Backend.Gateway.Middleware  
**Metadata:**
    
    - **Category:** Middleware
    
- **Path:** src/docs/swagger.ts  
**Description:** Configures and sets up Swagger/OpenAPI documentation for the API Gateway.  
**Template:** TypeScript Module  
**Dependency Level:** 2  
**Name:** swagger  
**Type:** Documentation  
**Relative Path:** docs  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** setupSwagger  
**Parameters:**
    
    - app: Express
    
**Return Type:** void  
**Attributes:** public  
    
**Implemented Features:**
    
    - API documentation generation
    - Interactive API UI
    
**Requirement Ids:**
    
    - REQ-8-003
    
**Purpose:** To provide interactive, auto-generated documentation for all the APIs exposed by the gateway.  
**Logic Description:** This file will import 'swagger-jsdoc' and 'swagger-ui-express'. It will define the main OpenAPI specification object, including info (title, version, description) and security definitions (e.g., for JWT Bearer tokens). The `swagger-jsdoc` options will be configured to scan JSDoc comments in route definition files or controllers to build the full specification. The `setupSwagger` function will take the Express app instance and use `swagger-ui-express` to serve the interactive documentation at a specific endpoint (e.g., '/api-docs').  
**Documentation:**
    
    - **Summary:** Integrates Swagger UI into the Express application, providing a user-friendly interface to explore and test the gateway's API endpoints.
    
**Namespace:** GlyphWeaver.Backend.Gateway.Docs  
**Metadata:**
    
    - **Category:** Documentation
    
- **Path:** src/app.ts  
**Description:** The main application file. It creates the Express application instance, configures all global middleware, and sets up the API routes.  
**Template:** TypeScript Express App  
**Dependency Level:** 3  
**Name:** app  
**Type:** Application  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Middleware pipeline configuration
    - API routing
    - Global error handling
    
**Requirement Ids:**
    
    - REQ-SEC-001
    - REQ-SEC-006
    - REQ-8-003
    
**Purpose:** To assemble the core of the Express application, connecting middleware and routers, but decoupled from the server's network listener.  
**Logic Description:** This file will import 'express', 'helmet', 'cors', and all custom middleware and utility modules. It will create an Express app instance. The middleware pipeline will be configured in order: request logging, CORS, Helmet for security headers, global rate limiting. After the global middleware, it will dynamically set up the routes by iterating through a route configuration object. For each defined route (e.g., '/api/v1/auth'), it will apply specific middleware (like `authMiddleware` if required) and the `proxyMiddleware` to forward the request to the correct service. Finally, it will set up the Swagger documentation and a global error handler middleware at the end of the pipeline.  
**Documentation:**
    
    - **Summary:** Creates and configures the main Express application instance, including security, logging, routing, and error handling. This is the heart of the gateway's request processing logic.
    
**Namespace:** GlyphWeaver.Backend.Gateway  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/server.ts  
**Description:** The entry point of the application. It imports the configured Express app, sets up the HTTP/HTTPS server, and starts listening for connections.  
**Template:** TypeScript Server  
**Dependency Level:** 4  
**Name:** server  
**Type:** Server  
**Relative Path:** .  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Server instantiation
    - Port listening
    - Graceful shutdown handling
    
**Requirement Ids:**
    
    - REQ-8-011
    
**Purpose:** To initialize and start the web server that hosts the API Gateway application.  
**Logic Description:** This file will import the `app` instance from `app.ts` and the `config` object. It will create an `http` or `https` server instance with the Express app. It will then call `server.listen` on the port specified in the configuration, logging a message to the console upon successful startup. It will also include logic for graceful shutdown by listening for signals like SIGTERM and SIGINT, allowing existing connections to finish before closing the server and exiting the process.  
**Documentation:**
    
    - **Summary:** The executable entry point for the API Gateway. It is responsible for creating the server instance and binding it to a network port to handle incoming requests.
    
**Namespace:** GlyphWeaver.Backend.Gateway  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/routes/index.ts  
**Description:** Defines and configures all the API routes for the gateway. It maps paths to their respective downstream services and specifies any route-specific middleware.  
**Template:** TypeScript Router  
**Dependency Level:** 3  
**Name:** routes  
**Type:** Router  
**Relative Path:** routes  
**Repository Id:** REPO-GLYPH-API-GATEWAY  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** configureRoutes  
**Parameters:**
    
    - app: Express
    
**Return Type:** void  
**Attributes:** public  
    
**Implemented Features:**
    
    - Centralized route management
    - Proxy routing to microservices
    
**Requirement Ids:**
    
    
**Purpose:** To act as the master routing table for the API Gateway, directing traffic to the correct backend service.  
**Logic Description:** This module will import the Express Router, the `createProxy` factory, the `authMiddleware`, and the application config. It will create a new Express Router instance. It will define routes like `/auth`, `/player`, `/leaderboards`, etc. For each route, it will apply middleware as needed (e.g., `router.use('/player', authMiddleware, createProxy(...))`). This provides a single place to see all exposed API domains and their security requirements. The exported `configureRoutes` function will be called from `app.ts` to mount this master router onto the main application.  
**Documentation:**
    
    - **Summary:** This file contains the routing logic of the API Gateway. It defines the public API endpoints and maps them to the internal microservices, applying necessary security middleware like authentication guards.
    
**Namespace:** GlyphWeaver.Backend.Gateway.Routes  
**Metadata:**
    
    - **Category:** Presentation
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableSwaggerDocs
  - enableDetailedRequestLogging
  
- **Database Configs:**
  
  


---

