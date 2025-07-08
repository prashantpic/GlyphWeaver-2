# Software Design Specification (SDS) for REPO-GLYPH-SHARED-LIBS-BACKEND

## 1. Introduction

### 1.1. Purpose
This document provides a detailed software design specification for the `Glyph Weaver Backend Shared Kernel` (`@glyph-weaver/shared-kernel`). This repository is a foundational shared library, published as a private NPM package, designed to be consumed by all other backend microservices. It establishes a consistent foundation by providing common utilities, interfaces, DTOs, error handling mechanisms, and base data models. The primary goal is to reduce code duplication, enforce consistency, and accelerate development across the backend ecosystem.

### 1.2. Scope
The scope of this document is limited to the design of the reusable components within this shared library. It includes:
- TypeScript interfaces and Data Transfer Objects (DTOs).
- Base Mongoose schema definitions.
- Centralized logging configuration.
- A standardized database connection utility.
- A custom error handling framework for APIs.

This library does not contain any service-specific business logic but provides the tools for other services to build that logic.

## 2. System Overview and Design

### 2.1. Architectural Style
This library is a key component of a microservices architecture, implementing the **Shared Kernel** pattern. It provides shared code that is centrally managed and versioned. Internally, it follows a layered approach, organizing components into `domain`, `infrastructure`, `errors`, and `common` concerns.

### 2.2. Technology Stack
- **Language:** TypeScript
- **Platform:** Node.js
- **Frameworks/Libraries:**
    - `mongoose`: For base schema definitions and DB connection management.
    - `winston`: For standardized, structured logging.
    - `dotenv`: To manage environment variables for the DB connection utility.

## 3. Package Configuration

### 3.1. `package.json`
This file defines the project as an NPM package.

json
{
  "name": "@glyph-weaver/shared-kernel",
  "version": "1.0.0",
  "description": "Shared Kernel library for Glyph Weaver backend services.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "lint": "eslint . --ext .ts",
    "test": "jest"
  },
  "dependencies": {
    "mongoose": "^8.0.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/jest": "^29.5.10",
    "@types/mongoose": "^5.11.97",
    "@types/node": "^20.10.0",
    "eslint": "^8.54.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.2"
  }
}


### 3.2. `tsconfig.json`
This file configures the TypeScript compiler for the library.

json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}


## 4. Detailed Component Design

### 4.1. Main Entrypoint (`src/index.ts`)
This is the public API of the package, exporting all shared components from a single module.

**Purpose:** To provide a clean, unified import path for consuming microservices.

**Implementation:**
- This file will act as a "barrel file".
- It will export all constructs from the various modules.

**Code Structure:**
typescript
// src/index.ts

// Domain
export * from './domain/BaseSchema';

// Infrastructure
export * from './infrastructure/logging/Logger';
export * from './infrastructure/database/DbConnection';

// Errors
export * from './errors/ApiError';
export * from './errors/BadRequestError';
export * from './errors/NotFoundError';
export * from './errors/errorHandler';

// DTOs
export * from './common/dtos/PagedResult.dto';


### 4.2. Domain Layer (`src/domain/`)

#### 4.2.1. Base Schema (`src/domain/BaseSchema.ts`)
**Purpose:** To enforce consistency on all MongoDB models by providing a base schema definition with timestamps and versioning, fulfilling `REQ-8-004`.

**Implementation:**
- This module exports a Mongoose `SchemaDefinition` object, not a full `Schema` instance.
- It will define `createdAt`, `updatedAt`, and `schemaVersion`. Consuming services will spread this object into their own schema definitions and use `{ timestamps: true }` in their schema options.

**Code Structure:**
typescript
// src/domain/BaseSchema.ts
import { SchemaDefinition } from 'mongoose';

/**
 * A base Mongoose schema definition object that includes a schemaVersion.
 * Timestamps (createdAt, updatedAt) should be enabled in the SchemaOptions
 * of the consuming schema (`{ timestamps: true }`).
 */
export const baseSchemaDefinition: SchemaDefinition = {
  schemaVersion: {
    type: Number,
    required: true,
    default: 1,
  },
};

**Note:** The `timestamps` are added via schema options in the consuming service, not directly in this definition object, which is the standard Mongoose practice.

### 4.3. Infrastructure Layer (`src/infrastructure/`)

#### 4.3.1. Logger (`src/infrastructure/logging/Logger.ts`)
**Purpose:** To provide a standardized, pre-configured Winston logger instance for all backend services, fulfilling `REQ-8-021`.

**Implementation:**
- The logger's configuration will be dependent on the `NODE_ENV` environment variable.
- **Production:** Logs will be in JSON format for easy parsing by log management systems.
- **Development:** Logs will be in a simple, colorized console format for readability.
- The configured logger instance will be exported as a singleton.

**Code Structure:**
typescript
// src/infrastructure/logging/Logger.ts
import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

const format =
  process.env.NODE_ENV === 'production'
    ? combine(timestamp(), json())
    : combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), simple());

const transports = [new winston.transports.Console()];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});


#### 4.3.2. Database Connection (`src/infrastructure/database/DbConnection.ts`)
**Purpose:** To centralize and abstract the logic for connecting to the MongoDB database.

**Implementation:**
- A single `connect` function will be exported.
- It will read the `MONGO_URI` from the environment variables.
- It will use the shared `logger` to report connection status.
- It will handle connection errors gracefully.

**Code Structure:**
typescript
// src/infrastructure/database/DbConnection.ts
import mongoose from 'mongoose';
import { logger } from '../logging/Logger';

let isConnected = false;

/**
 * Establishes a connection to the MongoDB database using the URI
 * from the MONGO_URI environment variable.
 */
export const connect = async (): Promise<void> => {
  if (isConnected) {
    logger.info('=> using existing database connection');
    return;
  }
  
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    logger.error('MONGO_URI environment variable not set.');
    throw new Error('Database connection string is missing.');
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    logger.info('MongoDB connected successfully.');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        isConnected = false;
        logger.warn('MongoDB disconnected.');
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
};


### 4.4. Error Handling Framework (`src/errors/`)

#### 4.4.1. `ApiError.ts`
**Purpose:** To define the base contract for all custom, serializable application errors.

**Implementation:**
- An `abstract class` that extends the native `Error`.
- It will enforce that all subclasses have a `statusCode` and a `serializeErrors` method.

**Code Structure:**
typescript
// src/errors/ApiError.ts
export abstract class ApiError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public abstract serializeErrors(): { message: string; field?: string }[];
}


#### 4.4.2. `BadRequestError.ts` and `NotFoundError.ts`
**Purpose:** To provide concrete, reusable error classes for common HTTP error scenarios.

**Implementation:**
- Both classes extend `ApiError`.
- They set a specific `statusCode` (400 for `BadRequestError`, 404 for `NotFoundError`).
- They implement the `serializeErrors` method to match the required format.

**Code Structure (`BadRequestError.ts`):**
typescript
// src/errors/BadRequestError.ts
import { ApiError } from './ApiError';

export class BadRequestError extends ApiError {
  public readonly statusCode = 400;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  public serializeErrors() {
    return [{ message: this.message }];
  }
}

**Code Structure (`NotFoundError.ts`):**
typescript
// src/errors/NotFoundError.ts
import { ApiError } from './ApiError';

export class NotFoundError extends ApiError {
  public readonly statusCode = 404;

  constructor() {
    super('Not Found');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  public serializeErrors() {
    return [{ message: 'Not Found' }];
  }
}


#### 4.4.3. `errorHandler.ts`
**Purpose:** To provide a global Express.js middleware for catching and formatting all errors consistently before sending a response to the client. This fulfills a key part of `REQ-8-021`.

**Implementation:**
- The function will have the signature of an Express `ErrorRequestHandler`.
- It will check if the error is an instance of `ApiError`.
- If it is, it will use the error's `statusCode` and `serializeErrors` method to create the response.
- For all other errors, it will log the error and respond with a generic 500 error to prevent leaking implementation details.

**Code Structure:**
typescript
// src/errors/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError';
import { logger } from '../infrastructure/logging/Logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  logger.error('An unexpected error occurred', {
    error: {
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.url,
    },
  });

  res.status(500).send({
    errors: [{ message: 'Something went wrong' }],
  });
};


### 4.5. Common Data Transfer Objects (`src/common/dtos/`)

#### 4.5.1. `PagedResult.dto.ts`
**Purpose:** To provide a standardized, generic DTO for API endpoints that return paginated data.

**Implementation:**
- A generic TypeScript class `PagedResultDto<T>` that accepts a type parameter for the data items.
- It will have a constructor to easily create instances.

**Code Structure:**
typescript
// src/common/dtos/PagedResult.dto.ts

export class PagedResultDto<T> {
  public readonly items: T[];
  public readonly totalCount: number;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly totalPages: number;

  constructor(items: T[], totalCount: number, page: number, pageSize: number) {
    this.items = items;
    this.totalCount = totalCount;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(totalCount / pageSize);
  }
}
