# Glyph Weaver Authentication Service - Software Design Specification (SDS)

## 1. Introduction

### 1.1. Purpose
This document outlines the detailed software design for the **Glyph Weaver Authentication Service**. This microservice is the central authority for all player authentication and authorization within the Glyph Weaver ecosystem. It handles user identity verification via platform services (Apple, Google) and a custom email/password system, and is responsible for issuing, refreshing, and validating JSON Web Tokens (JWTs) that secure API communication with other backend services.

### 1.2. Scope
The scope of this document is limited to the `REPO-GLYPH-AUTH` repository. It covers the RESTful API, service logic, data models, and infrastructure integrations required to fulfill its authentication and authorization duties. It is designed to be a standalone, scalable, and secure microservice.

## 2. System Architecture
This service follows a **Layered Architecture** within a broader **Microservices** paradigm.

*   **Presentation Layer:** Handles HTTP requests and responses via Express.js controllers and routes.
*   **Application Layer:** Contains the core business logic and use cases, orchestrated by services.
*   **Domain Layer:** Defines the core data structures (models) and the contracts for data access (repository interfaces).
*   **Infrastructure Layer:** Implements data persistence, interaction with external services (e.g., platform token validation), and cross-cutting concerns like logging.

**Dependencies:**
*   **MongoDB:** Primary data store for user identities and refresh tokens.
*   **Platform Services (Apple/Google):** External dependencies for validating platform-specific authentication tokens.
*   **Other Glyph Weaver Services:** This service acts as a dependency for other services, which will rely on its JWTs for authorizing requests.

## 3. Configuration

### 3.1. Environment Variables (`.env.example`)
The service will be configured via environment variables.


# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/glyphweaver_auth

# JWT Configuration
JWT_SECRET=your-super-secret-key-for-jwt
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=10

# Platform OAuth Client IDs (for token validation)
# These are the Audience values for the tokens received from the client
APPLE_CLIENT_ID=com.glyphweaver.game
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com


### 3.2. TypeScript Configuration (`tsconfig.json`)
Standard configuration for a Node.js project targeting ES2020.

json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}


### 3.3. Project Dependencies (`package.json`)
Key dependencies to be included:
*   **`express`**: Web framework.
*   **`mongoose`**: MongoDB ODM.
*   **`jsonwebtoken`**: For JWT creation and verification.
*   **`bcryptjs`**: For password hashing.
*   **`passport`**: Authentication middleware.
*   **`passport-jwt`**: Passport strategy for JWTs.
*   **`google-auth-library`**: For validating Google ID tokens.
*   **`node-apple-signin-auth`**: For validating Apple identity tokens.
*   **`dotenv`**: For loading environment variables.
*   **`cors`**: For enabling Cross-Origin Resource Sharing.
*   **`winston`**: For structured logging.
*   **`class-validator`**, **`class-transformer`**: For DTO validation.
*   **`@types/*`**: TypeScript types for all dependencies.
*   **`typescript`**, **`ts-node`**, **`ts-node-dev`**: Development dependencies.

## 4. API Specification

**Base Path:** `/api/v1/auth`

### 4.1. Data Transfer Objects (DTOs)

#### `RegisterUserDto.ts`
typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}


#### `LoginEmailDto.ts`
typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}


#### `LoginPlatformDto.ts`
typescript
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export enum Platform {
  GOOGLE = 'google',
  APPLE = 'apple',
}

export class LoginPlatformDto {
  @IsEnum(Platform)
  platform: Platform;

  @IsString()
  @IsNotEmpty()
  token: string; // The ID token from Google or Apple
}


#### `RefreshTokenDto.ts`
typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}


### 4.2. Endpoints

#### **Endpoint: `POST /register`**
*   **Description:** Registers a new user with an email and password.
*   **Request Body:** `RegisterUserDto`
*   **Success Response (201 Created):**
    json
    {
      "user": {
        "id": "uuid-string",
        "email": "user@example.com"
      },
      "tokens": {
        "accessToken": "jwt-access-token",
        "refreshToken": "jwt-refresh-token"
      }
    }
    
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input (validation error).
    *   `409 Conflict`: Email already exists.

#### **Endpoint: `POST /login/email`**
*   **Description:** Authenticates a user with email and password.
*   **Request Body:** `LoginEmailDto`
*   **Success Response (200 OK):**
    json
    {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
    
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input.
    *   `401 Unauthorized`: Invalid email or password.

#### **Endpoint: `POST /login/platform`**
*   **Description:** Authenticates a user using a token from a third-party platform (Google/Apple). Finds an existing user with that platform identity or creates a new one.
*   **Request Body:** `LoginPlatformDto`
*   **Success Response (200 OK):**
    json
    {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
    
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input.
    *   `401 Unauthorized`: Invalid platform token.

#### **Endpoint: `POST /token/refresh`**
*   **Description:** Issues a new pair of access and refresh tokens using a valid, non-expired refresh token.
*   **Request Body:** `RefreshTokenDto`
*   **Success Response (200 OK):**
    json
    {
      "accessToken": "new-jwt-access-token",
      "refreshToken": "new-jwt-refresh-token"
    }
    
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input.
    *   `401 Unauthorized`: Invalid or expired refresh token.

## 5. Detailed Component Design

### 5.1. Presentation Layer (`src/api/v1/`)

#### `controllers/auth.controller.ts`
*   **`AuthController` class:**
    *   **Constructor:** Injects `AuthService`.
    *   **`register(req, res, next)`:**
        1.  Extracts `RegisterUserDto` from `req.body`.
        2.  Calls `authService.registerUser(dto)`.
        3.  On success, sends a `201` response with user and token data.
        4.  On failure, calls `next(error)`.
    *   **`loginWithEmail(req, res, next)`:**
        1.  Extracts `LoginEmailDto` from `req.body`.
        2.  Calls `authService.authenticateByEmail(dto)`.
        3.  On success, sends a `200` response with tokens.
        4.  On failure, calls `next(error)`.
    *   **`loginWithPlatform(req, res, next)`:**
        1.  Extracts `LoginPlatformDto` from `req.body`.
        2.  Calls `authService.authenticateByPlatformToken(dto)`.
        3.  On success, sends a `200` response with tokens.
        4.  On failure, calls `next(error)`.
    *   **`refreshToken(req, res, next)`:**
        1.  Extracts `RefreshTokenDto` from `req.body`.
        2.  Calls `authService.refreshAuthTokens(dto.refreshToken)`.
        3.  On success, sends a `200` response with new tokens.
        4.  On failure, calls `next(error)`.

### 5.2. Application Layer (`src/application/`)

#### `services/auth.service.ts`
*   **`AuthService` class:**
    *   **Constructor:** Injects `IUserRepository`, `ITokenRepository`, `IPasswordService`, `IPlatformTokenValidator`, and `Logger`.
    *   **`registerUser(dto)`:**
        1.  Check if a user with `dto.email` already exists using `userRepository.findByEmail`. If so, throw a `ConflictException`.
        2.  Hash the password using `passwordService.hashPassword(dto.password)`.
        3.  Create a new user object with the email and hashed password.
        4.  Save the new user using `userRepository.create(newUser)`.
        5.  Generate tokens for the new user using `tokenService.generateAuthTokens({ userId: user.id })`.
        6.  Log the registration event (`REQ-SEC-019`).
        7.  Return the created user (without password hash) and the tokens.
    *   **`authenticateByEmail(dto)`:**
        1.  Find the user by email using `userRepository.findByEmail`. If not found, throw an `UnauthorizedException`.
        2.  Compare the provided password with the stored hash using `passwordService.comparePassword`. If it doesn't match, throw `UnauthorizedException`.
        3.  Generate tokens using `tokenService.generateAuthTokens({ userId: user.id })`.
        4.  Log the login attempt (success) (`REQ-SEC-019`).
        5.  Return the tokens.
    *   **`authenticateByPlatformToken(dto)`:**
        1.  Validate the platform token using `platformTokenValidator.validate(dto.platform, dto.token)`. This will return a payload with `platformUserId` and `email`. If invalid, throw `UnauthorizedException`.
        2.  Attempt to find the user via `userRepository.findByPlatformId(dto.platform, platformUserId)`.
        3.  If found, generate tokens for that user.
        4.  If not found, attempt to find by `email` (if provided by the platform). If found, link the new platform identity to the existing user.
        5.  If still not found, create a new user with the platform identity and email.
        6.  Generate tokens using `tokenService.generateAuthTokens({ userId: user.id })`.
        7.  Log the login attempt (success) (`REQ-SEC-019`).
        8.  Return the tokens.
    *   **`refreshAuthTokens(refreshToken)`:**
        1.  Verify the refresh token and get the user payload using `tokenService.verifyRefreshToken(refreshToken)`. If invalid, throw `UnauthorizedException`.
        2.  Find the user by ID from the payload. If not found, throw `UnauthorizedException`.
        3.  Generate a new pair of tokens using `tokenService.generateAuthTokens({ userId: user.id })`.
        4.  Return the new tokens.

#### `services/token.service.ts`
*   **`TokenService` class:**
    *   **Constructor:** Injects `ITokenRepository` and `Config`.
    *   **`generateAuthTokens(payload)`:**
        1.  Create `accessToken` using `jsonwebtoken.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessExpiresIn })`.
        2.  Create `refreshToken` using `jsonwebtoken.sign(payload, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn })`.
        3.  Save the new refresh token to the database using `tokenRepository.save(payload.userId, refreshToken, expiryDate)`. This will overwrite any existing token for the user.
        4.  Return both tokens.
    *   **`verifyRefreshToken(token)`:**
        1.  Verify the token signature using `jsonwebtoken.verify`.
        2.  Find the token in the database using `tokenRepository.findByToken(token)`. If not found or expired, throw `UnauthorizedException`.
        3.  Delete the used refresh token from the database `tokenRepository.delete(token)`.
        4.  Return the decoded payload.

### 5.3. Domain Layer (`src/domain/`)

#### `models/user.model.ts`
*   **`PlatformIdentitySchema`:** Sub-document schema with `provider: string` and `providerUserId: string`.
*   **`UserSchema` (Mongoose Schema):**
    *   `email: { type: String, unique: true, sparse: true }` (sparse index allows multiple nulls)
    *   `passwordHash: { type: String, select: false }` (`select: false` prevents it from being returned by default)
    *   `platformIdentities: [PlatformIdentitySchema]`
    *   `lastLoginAt: Date`
    *   **Indexes:** Compound index on `platformIdentities.provider` and `platformIdentities.providerUserId`.
    *   **Timestamps:** `{ timestamps: true }`

#### `models/token.model.ts`
*   **`TokenSchema` (Mongoose Schema):**
    *   `userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }`
    *   `token: { type: String, required: true, index: true }`
    *   `expiresAt: { type: Date, required: true }`
    *   **Indexes:** A TTL index on `expiresAt` with `expireAfterSeconds: 0`.

#### `repositories/IUserRepository.ts`
*   **`IUserRepository` interface:** Defines methods as specified in the file structure, returning domain objects.

### 5.4. Infrastructure Layer (`src/infrastructure/`)

#### `persistence/mongo.user.repository.ts`
*   **`MongoUserRepository` class:** Implements `IUserRepository`.
    *   **`findById(id)`:** Uses `UserModel.findById(id).exec()`.
    *   **`findByEmail(email)`:** Uses `UserModel.findOne({ email }).select('+passwordHash').exec()`. Includes `passwordHash` for comparison.
    *   **`findByPlatformId(...)`:** Uses `UserModel.findOne({ 'platformIdentities.provider': ..., 'platformIdentities.providerUserId': ... }).exec()`.
    *   **`create(user)`:** Uses `UserModel.create(user)`.

#### `platform/platform-token-validator.service.ts`
*   This is a new proposed service to encapsulate platform-specific validation logic.
*   **`IPlatformTokenValidator` interface:** Defines `validate(platform: Platform, token: string): Promise<{ platformUserId: string, email?: string }>`.
*   **`PlatformTokenValidator` class:**
    *   **`validate(platform, token)`:**
        *   Uses a `switch` statement on `platform`.
        *   **Case `'google'`:** Uses `google-auth-library`'s `OAuth2Client.verifyIdToken()` to validate the token against the `GOOGLE_CLIENT_ID`.
        *   **Case `'apple'`:** Uses `node-apple-signin-auth` to validate the token against the `APPLE_CLIENT_ID`.
        *   If validation succeeds, extracts and returns the `platformUserId` (sub) and `email`.
        *   If validation fails, throws an `UnauthorizedException`.

#### `logging/logger.ts`
*   **`Logger` (Winston instance):**
    *   **Development:** `winston.transports.Console` with `format.combine(format.colorize(), format.simple())`.
    *   **Production:** `winston.transports.Console` with `format.combine(format.timestamp(), format.json())`.
    *   Log level configured from `NODE_ENV`.

## 6. Error Handling
*   A global error handling middleware will be defined in `src/api/v1/middleware/error.handler.ts` and registered in `app.ts`.
*   It will catch errors passed via `next(error)`.
*   It will check the error type (e.g., custom `ApiException`, validation error) and format a consistent JSON response.
    json
    {
      "statusCode": 401,
      "message": "Invalid credentials",
      "error": "Unauthorized"
    }
    
*   It will log the full error (including stack trace) for non-production environments or to a logging service in production.