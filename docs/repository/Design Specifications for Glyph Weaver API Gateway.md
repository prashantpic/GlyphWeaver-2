# Software Design Specification (SDS) for REPO-GLYPH-API-GATEWAY

## 1. Introduction

### 1.1. Purpose
This document provides a detailed software design specification for the **Glyph Weaver API Gateway**. This gateway acts as the single, unified entry point for all client-side requests, routing them to the appropriate downstream microservices. It is responsible for centralizing cross-cutting concerns such as authentication, rate limiting, security headers, and request logging.

### 1.2. Scope
The scope of this document is limited to the design and implementation of the API Gateway service. It covers the application's structure, middleware, routing logic, configuration, and interfaces with downstream services. The internal implementation of the downstream microservices is outside the scope of this document.

## 2. System Overview

### 2.1. Architecture
The API Gateway will be implemented as a Node.js application using the Express.js framework. It follows the **API Gateway** architectural pattern. All incoming requests are processed through a series of middleware before being proxied to the relevant internal microservice.

### 2.2. Core Responsibilities
- **Request Routing:** Forward incoming requests to the correct backend microservice based on the URL path.
- **Authentication & Authorization:** Verify JSON Web Tokens (JWTs) for protected routes and attach user context to the request for downstream services.
- **Rate Limiting:** Protect the system from abuse by enforcing a global request rate limit.
- **Security:** Apply essential security headers using Helmet and manage Cross-Origin Resource Sharing (CORS) policies.
- **Centralized Logging:** Log all incoming requests and outgoing responses for monitoring and debugging.
- **API Documentation:** Provide interactive API documentation using Swagger/OpenAPI.

## 3. Configuration

### 3.1. Environment Variables (`.env.example`)
The application's configuration is managed through environment variables. The `.env.example` file will serve as a template for the required `.env` file.

dotenv
# Server Configuration
PORT=8080

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://game.glyphweaver.com

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100 # Max 100 requests per window per IP

# JWT Authentication Configuration
# This should be a URL pointing to the Auth service's JWKS endpoint
JWT_PUBLIC_KEY_URL=http://localhost:8081/auth/jwks.json

# Downstream Service URLs
AUTH_SERVICE_URL=http://localhost:8081/
PLAYER_SERVICE_URL=http://localhost:8082/
LEADERBOARD_SERVICE_URL=http://localhost:8083/
IAP_SERVICE_URL=http://localhost:8084/
GAMECONTENT_SERVICE_URL=http://localhost:8085/
ANALYTICS_SERVICE_URL=http://localhost:8086/
SYSTEM_SERVICE_URL=http://localhost:8087/

# Logging Configuration
LOG_LEVEL=info # e.g., error, warn, info, http, verbose, debug


### 3.2. TypeScript Configuration (`tsconfig.json`)
The `tsconfig.json` file will configure the TypeScript compiler with a modern and strict setup.

json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}


### 3.3. Project Dependencies (`package.json`)
- **Production Dependencies:**
  - `express`: Web framework.
  - `cors`: For enabling CORS.
  - `helmet`: For securing the app by setting various HTTP headers.
  - `express-rate-limit`: For global rate limiting.
  - `express-http-proxy`: For forwarding requests to downstream services.
  - `winston`: For structured logging.
  - `dotenv`: For loading environment variables.
  - `jose`: For robust JWT/JWKS verification.
  - `swagger-jsdoc`: To generate OpenAPI specs from JSDoc comments.
  - `swagger-ui-express`: To serve the interactive Swagger UI.
- **Development Dependencies:**
  - `typescript`, `ts-node`, `nodemon`, `@types/node`, `@types/express`, `@types/cors`, `@types/helmet`, `@types/swagger-jsdoc`, `@types/swagger-ui-express`, `eslint` and related plugins.

## 4. File-by-File Software Design

### 4.1. `src/config/index.ts`
- **Purpose:** Loads, validates, and exports all environment variables as a type-safe, read-only object.
- **Implementation:**
  - Use `dotenv.config()` to load the `.env` file.
  - Define an interface `IProcessEnv` that extends `NodeJS.ProcessEnv` with all required variables typed.
  - Create a configuration object that reads from `process.env`.
  - Validate that all required service URLs and secrets are present. If any are missing, throw an error to prevent the application from starting in a misconfigured state.
  - Export the frozen configuration object for use throughout the application.

typescript
// Example Structure
import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  corsOrigin: process.env.CORS_ORIGIN,
  jwt: {
    jwksUrl: process.env.JWT_PUBLIC_KEY_URL,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL,
    player: process.env.PLAYER_SERVICE_URL,
    // ... other services
  },
  // ... other configs
};

// Add validation logic here

export default Object.freeze(config);


### 4.2. `src/utils/logger.ts`
- **Purpose:** Provide a singleton Winston logger instance.
- **Implementation:**
  - Create a logger using `winston.createLogger`.
  - Configure transports:
    - **Development:** Use `winston.transports.Console` with `winston.format.simple()` and `winston.format.colorize()`.
    - **Production:** Use `winston.transports.Console` with `winston.format.json()` for structured logging.
  - The log level should be taken from the configuration module.

### 4.3. Middleware (`src/middleware/`)

#### 4.3.1. `rateLimit.middleware.ts`
- **Purpose:** Implements global rate limiting.
- **Implementation:**
  - Export a function `rateLimitMiddleware` that returns a configured `express-rate-limit` instance.
  - The configuration (`windowMs`, `max`) will be sourced from `config.rateLimit`.
  - Set `standardHeaders: true` to return rate limit info in the `RateLimit-*` headers.

#### 4.3.2. `auth.middleware.ts`
- **Purpose:** Verifies JWTs and attaches the user payload to the request.
- **Implementation:**
  - Export an async middleware function `verifyToken(req, res, next)`.
  - Extract the token from the `Authorization: Bearer <token>` header.
  - If no token is found, return a `401 Unauthorized` error.
  - Use the `jose` library to verify the token.
    - Fetch the JWKS (JSON Web Key Set) from the `config.jwt.jwksUrl`. The `jose.createRemoteJWKSet` function is suitable for this and handles caching.
    - Use `jose.jwtVerify` with the token, the fetched JWKSet, and expected issuer/audience if applicable.
  - On successful verification, attach the decoded `payload` to `req.user`.
  - If verification fails (e.g., invalid signature, expired token), return a `403 Forbidden` error.
  - Wrap the logic in a `try...catch` block to handle errors gracefully.

#### 4.3.3. `proxy.middleware.ts`
- **Purpose:** Creates a proxy middleware to forward requests to downstream services.
- **Implementation:**
  - Export a factory function: `createProxy(targetUrl: string): RequestHandler`.
  - This function will use `express-http-proxy`.
  - Configure the proxy with the following options:
    - `proxyReqPathResolver`: A function that takes the `req` object and returns the original request path (e.g., `req.originalUrl`). This ensures paths like `/player/profile` are passed on correctly.
    - `proxyReqOptDecorator`: A function to modify the proxy request options before it's sent. Use this to forward user context.
      - If `req.user` exists (from the auth middleware), serialize it to a JSON string and add it as a custom header, e.g., `req.headers['x-user-context'] = JSON.stringify(req.user)`.

### 4.4. `src/routes/index.ts`
- **Purpose:** Define all API routes and map them to their respective proxies and middleware.
- **Implementation:**
  - Create an Express `Router`.
  - Define a `routeConfig` array of objects, where each object represents a microservice route.
    typescript
    // Example route config structure
    const routeConfig = [
      { path: '/auth', target: config.services.auth, requiresAuth: false },
      { path: '/player', target: config.services.player, requiresAuth: true },
      { path: '/leaderboards', target: config.services.leaderboard, requiresAuth: true },
      // ... more services
    ];
    
  - Iterate over this `routeConfig`. For each route:
    - Apply the `authMiddleware` if `requiresAuth` is true.
    - Apply the `createProxy` middleware with the correct target URL.
    - Each route definition should be annotated with JSDoc comments for Swagger.
  - Export the configured router.

### 4.5. `src/docs/swagger.ts`
- **Purpose:** Configure and serve Swagger/OpenAPI documentation.
- **Implementation:**
  - Define the `options` for `swagger-jsdoc`.
    - `definition`: Includes `openapi: '3.0.0'`, `info` (title, version), `components.securitySchemes` (defining Bearer JWT auth), and `servers`.
    - `apis`: Point to the `src/routes/index.ts` file to scan for JSDoc comments.
  - Use `swagger-jsdoc` to generate the OpenAPI specification object.
  - Export a function `setupSwagger(app: Express)` that uses `swagger-ui-express.setup` and `swagger-ui-express.serve` to host the documentation at `/api-docs`.

### 4.6. `src/app.ts`
- **Purpose:** The main application assembly file.
- **Implementation:**
  - Create an Express `app`.
  - **Middleware Pipeline (in order):**
    1. `app.use(cors(options))` - Configure with `config.corsOrigin`.
    2. `app.use(helmet())` - Apply security headers.
    3. `app.use(express.json())` - For parsing JSON bodies.
    4. `app.use(rateLimitMiddleware)` - Apply global rate limiting.
    5. **Request Logger:** Use a simple Winston-based logger middleware here.
  - **Routing:**
    - Mount the main router from `src/routes/index.ts`.
  - **API Docs:**
    - Call `setupSwagger(app)`.
  - **Error Handling:**
    - Add a "not found" handler for unmatched routes (returns 404).
    - Add a global error handling middleware that logs the full error but returns a generic 500 error message to the client.
  - Export the `app`.

### 4.7. `src/server.ts`
- **Purpose:** Application entry point. Creates and starts the HTTP server.
- **Implementation:**
  - Import the `app` and `config`.
  - Create an `http.Server` instance with the `app`.
  - Call `server.listen` on `config.port`.
  - Implement graceful shutdown logic: listen for `SIGTERM` and `SIGINT` signals, call `server.close()`, and `process.exit()`. This ensures the server stops accepting new connections but allows existing ones to complete.

## 5. Testing Strategy
- **Unit Tests:** While the gateway has minimal business logic, unit tests should cover:
  - `config/index.ts`: Test that it throws errors for missing variables.
  - Middleware logic: Mock `req`, `res`, `next` to test the behavior of `authMiddleware` under various token conditions (valid, invalid, missing).
- **Integration/E2E Tests:**
  - A separate test suite (e.g., in `REPO-GLYPH-E2E-TESTING`) will be used to test the gateway's routing and middleware integration.
  - Tests will involve starting the gateway and mock downstream services.
  - Scenarios to test:
    - A request to a public route (`/auth/login`) is correctly proxied.
    - A request to a protected route (`/player/profile`) without a token is rejected with 401/403.
    - A request to a protected route with a valid token is correctly proxied with the user context header.
    - Rate limiting is triggered after exceeding the request limit.