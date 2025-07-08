# Software Design Specification (SDS) for Authentication API Endpoint

## 1. Introduction

### 1.1. Purpose

This document provides a detailed software design for the **Authentication API Endpoint (`REPO-GLYPH-AUTH`)**. This microservice is a core component of the Glyph Weaver backend, responsible for all user authentication and account management tasks. Its primary functions are:
-   Registering new users with custom game accounts.
-   Authenticating users via credentials and issuing JSON Web Tokens (JWTs).
-   Refreshing expired access tokens.
-   Linking platform-specific accounts (Apple Game Center, Google Play Games) to a custom game account.
-   Providing a secure entry point for other backend services.
-   Logging all security-sensitive events for auditing purposes.

### 1.2. Scope

This SDS covers the design and implementation of the RESTful API endpoints, services, data models, and security mechanisms within the `REPO-GLYPH-AUTH` repository. It defines the contracts for external dependencies, such as the Player Repository and Audit Logging Service, but does not cover their internal implementation.

### 1.3. Technologies

-   **Language:** TypeScript
-   **Framework:** Node.js with Express.js
-   **Authentication:** JSON Web Tokens (JWT)
-   **Password Hashing:** bcryptjs
-   **Validation:** Joi
-   **Security Middleware:** Helmet
-   **CORS:** cors package

## 2. System Architecture

The service will follow a standard **Layered Architecture** to promote separation of concerns, maintainability, and testability.

-   **API (Presentation) Layer:** Contains Express.js controllers, routes, DTOs, and validation logic. It is responsible for handling HTTP requests and responses and is the outermost layer.
-   **Application (Service) Layer:** Contains the core business logic and use cases. It orchestrates interactions between the API layer and the data/domain layers. It is completely independent of Express.js.
-   **Domain Layer:** Contains the core data models and interfaces that represent the business entities (e.g., `Player`, `AuditEvent`).
-   **Infrastructure/Data Access Layer (Interfaces):** Defines the contracts (TypeScript interfaces) for interacting with external systems like databases or other services. The concrete implementations of these interfaces reside in other repositories and are injected via Dependency Injection (DI).

## 3. API Endpoint Definitions

All endpoints will be prefixed with `/api/v1/auth`. All communication must use HTTPS as per **REQ-SEC-001**.

### 3.1. `POST /register`

-   **Description:** Registers a new user with a unique username and email.
-   **Request Body:** `RegisterRequestDto`
    json
    {
      "username": "player123",
      "email": "player@example.com",
      "password": "AStrongPassword!123"
    }
    
-   **Validation:** Uses `registerSchema` (Joi) to validate:
    -   `username`: required, string, min 3 chars.
    -   `email`: required, valid email format.
    -   `password`: required, string, min 8 chars, containing at least one uppercase, one lowercase, one number, and one special character.
-   **Successful Response (201 Created):** Returns an `AuthResponseDto`.
    json
    {
      "accessToken": "ey...",
      "refreshToken": "ey...",
      "userId": "uuid-of-new-user"
    }
    
-   **Error Responses:**
    -   `400 Bad Request`: Validation failed.
    -   `409 Conflict`: Username or email already exists.
    -   `500 Internal Server Error`: Unexpected server error.
-   **Audit Event:** `REGISTER_SUCCESS` on success.

### 3.2. `POST /login`

-   **Description:** Authenticates a user with their email and password.
-   **Request Body:** `LoginRequestDto`
    json
    {
      "email": "player@example.com",
      "password": "AStrongPassword!123"
    }
    
-   **Validation:** Uses `loginSchema` (Joi) to validate `email` and `password` presence and format.
-   **Successful Response (200 OK):** Returns an `AuthResponseDto`.
-   **Error Responses:**
    -   `400 Bad Request`: Validation failed.
    -   `401 Unauthorized`: Invalid email or password.
    -   `500 Internal Server Error`: Unexpected server error.
-   **Audit Events:** `LOGIN_SUCCESS` or `LOGIN_FAILURE` (with IP address).

### 3.3. `POST /refresh`

-   **Description:** Issues a new pair of access and refresh tokens using a valid refresh token.
-   **Request Body:**
    json
    {
      "refreshToken": "ey..."
    }
    
-   **Validation:** Validates the presence of `refreshToken`.
-   **Successful Response (200 OK):** Returns a new `AuthResponseDto`.
-   **Error Responses:**
    -   `401 Unauthorized`: Refresh token is invalid, expired, or revoked.
    -   `500 Internal Server Error`: Unexpected server error.
-   **Audit Event:** `TOKEN_REFRESH_SUCCESS`.

### 3.4. `POST /link-platform`

-   **Description:** Links a platform account (Game Center, Google Play) to the authenticated user's account. This is a **protected endpoint** requiring a valid Access Token.
-   **Request Headers:** `Authorization: Bearer <accessToken>`
-   **Request Body:** `LinkPlatformRequestDto`
    json
    {
      "platform": "google-play",
      "platformId": "g123456789"
    }
    
-   **Validation:** Uses `linkPlatformSchema` (Joi) to validate `platform` (enum) and `platformId` (string).
-   **Successful Response (204 No Content):** An empty body with a 204 status code.
-   **Error Responses:**
    -   `401 Unauthorized`: Invalid or missing access token.
    -   `404 Not Found`: Authenticated user not found.
    -   `409 Conflict`: The platform ID is already linked to another account.
    -   `500 Internal Server Error`: Unexpected server error.
-   **Audit Event:** `PLATFORM_LINK_SUCCESS`.

## 4. Core Components & Services

### 4.1. `AuthenticationService` (`application/services/authentication.service.ts`)

This service orchestrates all authentication logic. It will be injected with repository and helper service interfaces.

**Public Methods:**

-   `async register(registerDto, ipAddress)`:
    1.  Check if a player with the given `email` or `username` already exists using `playerRepository`. If so, throw a `ConflictError`.
    2.  Hash the password using `passwordHasher.hash()`.
    3.  Create the new player via `playerRepository.create()`.
    4.  Generate access and refresh tokens using `tokenService.generateTokens()`.
    5.  Log a `REGISTER_SUCCESS` event using `auditLogger`.
    6.  Return the player and token data.

-   `async login(loginDto, ipAddress)`:
    1.  Find the player by email using `playerRepository.findByEmail()`. If not found, log `LOGIN_FAILURE` and throw an `UnauthorizedError`.
    2.  Compare the provided password with the stored hash using `passwordHasher.compare()`. If it doesn't match, log `LOGIN_FAILURE` and throw an `UnauthorizedError`.
    3.  Generate new access and refresh tokens using `tokenService.generateTokens()`.
    4.  Log a `LOGIN_SUCCESS` event using `auditLogger`.
    5.  Return the token data.

-   `async refreshAuth(refreshToken)`:
    1.  Verify the refresh token using `tokenService.verifyRefreshToken()`. This should return the user payload (e.g., userId). If invalid, throw an `UnauthorizedError`.
    2.  Check if the user still exists and is active using `playerRepository.findById()`. If not, throw an `UnauthorizedError`.
    3.  Generate new access and refresh tokens.
    4.  Log a `TOKEN_REFRESH_SUCCESS` event.
    5.  Return the new token data.

-   `async linkPlatformAccount(userId, linkDto)`:
    1.  Update the player record using `playerRepository.updatePlatformLink()`. The repository will handle uniqueness constraints for the platform ID.
    2.  Log a `PLATFORM_LINK_SUCCESS` event.

### 4.2. Helper Service Interfaces

These interfaces define contracts for infrastructural concerns, allowing for clean separation and testability.

#### 4.2.1. `ITokenService` (`application/interfaces/token.service.interface.ts`)
-   **Description:** Handles JWT creation and verification.
-   **Methods:**
    -   `generateTokens(payload: { userId: string }): Promise<{ accessToken: string, refreshToken: string }>`: Creates JWT access and refresh tokens.
    -   `verifyAccessToken(token: string): Promise<{ userId: string }>`: Verifies an access token.
    -   `verifyRefreshToken(token: string): Promise<{ userId: string }>`: Verifies a refresh token.
-   **Implementation Notes:** Use the `jsonwebtoken` library. Access tokens should have a short expiry (e.g., 15 minutes). Refresh tokens should have a longer expiry (e.g., 7 days). Secrets will be loaded from the central config.

#### 4.2.2. `IPasswordHasher` (`application/interfaces/password-hasher.interface.ts`)
-   **Description:** Abstract a service for hashing and comparing passwords.
-   **Methods:**
    -   `hash(password: string): Promise<string>`: Hashes a plain-text password.
    -   `compare(password: string, hash: string): Promise<boolean>`: Compares a plain-text password to a hash.
-   **Implementation Notes:** Use the `bcryptjs` library. The salt rounds will be loaded from the central config.

### 4.3. External Dependency Interfaces

These interfaces define contracts for services implemented in other repositories.

-   `IPlayerRepository` (`application/interfaces/player.repository.interface.ts`): See file structure for definition.
-   `IAuditLoggingService` (`application/interfaces/audit-logging.service.interface.ts`): See file structure for definition.

## 5. Data Models & DTOs

-   **Domain Models:**
    -   `Player`: Represents a user account. Will have properties like `id`, `username`, `email`, `passwordHash`, `platformLinks: { [platform: string]: string }`, `createdAt`, `updatedAt`.
    -   `AuditEvent`: As defined in the file structure.
-   **Data Transfer Objects (DTOs):**
    -   `RegisterRequestDto`: As defined in the file structure.
    -   `LoginRequestDto`: As defined in the file structure.
    -   `AuthResponseDto`: As defined in the file structure.
    -   `LinkPlatformRequestDto`: As defined in the file structure.

## 6. Security, Validation & Error Handling

-   **Authentication Middleware:** A `protect` middleware will be created. It will extract the JWT access token from the `Authorization` header, verify it using `tokenService`, attach the user payload to the `Request` object, and pass control to the next handler. It will be applied to protected routes like `/link-platform`.
-   **Input Validation:** A generic `validate` middleware will be created. It will take a Joi schema and apply it to `req.body`. On failure, it will throw a `ValidationError` that the global error handler will catch and format as a 400 response.
-   **Password Security:** Passwords will never be stored in plain text. `bcryptjs` with a configurable salt factor (e.g., 12) will be used for hashing.
-   **Error Handling:** A global error handler middleware will be the last middleware in the Express chain. It will catch all errors passed via `next(error)`. It will inspect the error type (e.g., `ValidationError`, `UnauthorizedError`, `ConflictError`, or a generic `Error`) and send a JSON response with an appropriate HTTP status code and a user-friendly message.
-   **Audit Logging:** All authentication events (successful/failed logins, registrations, token refreshes, account linking) will be logged using the `IAuditLoggingService`, capturing the user ID (if available), IP address, timestamp, and event type as per **REQ-SEC-019**.

## 7. Configuration Management

-   **Environment Variables:** All configuration will be managed via environment variables to adhere to the 12-Factor App methodology. A `.env` file will be used for local development.
-   **`src/config/index.ts`:** This file will load, validate, and export a typed `config` object.
-   **Required Variables:**
    -   `NODE_ENV`: `development`, `production`, `test`
    -   `PORT`: The port the server listens on (e.g., `3001`).
    -   `JWT_SECRET`: Secret for signing access tokens.
    -   `JWT_EXPIRES_IN`: Expiry time for access tokens (e.g., `15m`).
    -   `REFRESH_TOKEN_SECRET`: Secret for signing refresh tokens.
    -   `REFRESH_TOKEN_EXPIRES_IN`: Expiry time for refresh tokens (e.g., `7d`).
    -   `BCRYPT_SALT_ROUNDS`: Cost factor for bcrypt (e.g., `12`).
    -   `CORS_ORIGIN`: Allowed origins for CORS.

## 8. Server Initialization (`src/server.ts`)

The main server file will perform the following steps:
1.  Import necessary modules (`express`, `helmet`, `cors`, etc.).
2.  Import the application configuration and the main `auth.routes`.
3.  Create an Express application instance.
4.  Apply essential middleware:
    -   `helmet()` for security headers.
    -   `cors()` with options from the config.
    -   `express.json()` to parse JSON request bodies.
5.  Mount the main authentication router at `/api/v1/auth`.
6.  Add a "not found" handler for unhandled routes.
7.  Add the global error handler middleware.
8.  Start the server, listening on the configured port.
9.  Implement logic to use `https.createServer` for HTTPS enforcement (**REQ-SEC-001**), loading SSL certificate and key paths from configuration for production environments. For development, a standard HTTP server can be used.