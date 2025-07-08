# Software Design Specification (SDS): Glyph Weaver IAP Validation Service

## 1. Introduction

### 1.1. Purpose

This document provides a detailed software design for the **Glyph Weaver IAP Validation Service** (`REPO-GLYPH-IAP`). This is a critical, self-contained microservice responsible for the secure server-side validation of In-App Purchases (IAPs) from the Apple App Store and Google Play Store. Its primary function is to receive purchase receipts from the game client, validate them with the respective platform, and, upon successful validation, orchestrate the fulfillment of the purchased items by communicating with other backend services.

### 1.2. Scope

The scope of this document is limited to the design and implementation of the IAP Validation Service. This includes:
- A RESTful API endpoint for receiving validation requests.
- Logic for communicating with Apple and Google IAP validation servers.
- Logic for communicating with the internal Player Service for item fulfillment.
- A dedicated data store for tracking all transaction states and histories.
- Configuration, security, and logging concerns specific to this service.

## 2. System Architecture

The service will be built using a layered architecture on top of Node.js and Express.js, promoting separation of concerns, testability, and maintainability.

### 2.1. Architectural Style

- **Microservice:** The service is designed to be independently deployable and scalable.
- **Layered Architecture:** The code is organized into distinct layers:
    1.  **API (Presentation):** Handles HTTP requests and responses (Express.js Controllers, DTOs).
    2.  **Application:** Orchestrates the use cases (Application Services).
    3.  **Domain:** Contains the core business logic and state (Aggregates, Domain Models).
    4.  **Infrastructure:** Manages external concerns like database access and communication with third-party services (Repositories, Gateways).

### 2.2. Design Patterns

- **Repository Pattern:** Decouples the application and domain layers from data persistence details.
- **Gateway Pattern:** Abstracts communication with external services (Apple, Google, Player Service).
- **Dependency Injection:** Dependencies will be injected into services and controllers to promote loose coupling and testability.
- **Data Transfer Object (DTO):** Used to define clear contracts for API requests.

### 2.3. Component Diagram

mermaid
graph TD
    subgraph Client
        A[Game Client]
    end

    subgraph IAP Validation Service
        B(API Layer<br>iap.controller.ts)
        C(Application Layer<br>iap-validation.service.ts)
        D(Domain Layer<br>iap-transaction.aggregate.ts)
        E(Infrastructure Layer)
    end

    subgraph Infrastructure Layer
        F[Repositories<br>mongoose-iap-transaction.repository.ts]
        G[Gateways<br>apple.validator.ts<br>google.play.validator.ts<br>http-player.service.gateway.ts]
    end

    subgraph External Services
        H[Apple/Google<br>Validation Servers]
        I[Player Service]
        J[MongoDB Database]
    end

    A -- HTTP POST /api/v1/iap/validate --> B
    B -- Calls --> C
    C -- Uses --> D
    C -- Uses --> E
    E --> F & G
    F -- Interacts with --> J
    G -- Calls --> H & I

    style IAP Validation Service fill:#f9f,stroke:#333,stroke-width:2px


## 3. Configuration

### 3.1. `package.json`

This file defines project metadata, dependencies, and scripts.

-   **Dependencies:**
    -   `express`: Web server framework.
    -   `mongoose`: MongoDB Object Data Mapper (ODM).
    -   `axios`: HTTP client for gateway communication.
    -   `dotenv`: For loading environment variables in development.
    -   `helmet`: For securing Express apps with various HTTP headers.
    -   `cors`: For enabling Cross-Origin Resource Sharing.
    -   `class-validator`, `class-transformer`: For DTO validation.
    -   `winston`: For application logging.
    -   `googleapis`: For Google Play validation.
-   **Dev Dependencies:**
    -   `typescript`, `ts-node`, `nodemon`: For TypeScript development.
    -   `jest`, `supertest`: For testing.
    -   `@types/*`: Type definitions for all dependencies.
-   **Scripts:**
    -   `start`: `node dist/index.js` (for production)
    -   `build`: `tsc` (compiles TypeScript)
    -   `dev`: `nodemon src/index.ts` (for development)
    -   `test`: `jest --config jest.config.js`

### 3.2. `tsconfig.json`

Standard TypeScript configuration for a Node.js project.
-   `target`: "es2020"
-   `module`: "commonjs"
-   `outDir`: "./dist"
-   `rootDir`: "./src"
-   `strict`: true
-   `esModuleInterop`: true

### 3.3. `src/config/index.ts`

Loads and exports all environment variables, throwing an error if required variables are missing.

typescript
// src/config/index.ts
import dotenv from 'dotenv';

dotenv.config();

const requiredVars = [
    'NODE_ENV', 'PORT', 'MONGO_URI', 'PLAYER_SERVICE_URL',
    'APPLE_VALIDATION_URL', 'APPLE_SHARED_SECRET',
    'GOOGLE_PROJECT_ID', 'GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY'
];
// ... validation logic to ensure all requiredVars exist ...

export const config = Object.freeze({
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT || '3001', 10),
    mongo: {
        uri: process.env.MONGO_URI,
    },
    services: {
        playerServiceUrl: process.env.PLAYER_SERVICE_URL,
    },
    apple: {
        validationUrl: process.env.APPLE_VALIDATION_URL,
        sharedSecret: process.env.APPLE_SHARED_SECRET,
    },
    google: {
        projectId: process.env.GOOGLE_PROJECT_ID,
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
        privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});


## 4. API Layer (Presentation)

### 4.1. Endpoint Definition

-   **Endpoint:** `POST /api/v1/iap/validate`
-   **Description:** Validates a purchase receipt from a client and fulfills the purchase.
-   **Request Body:** `ValidateReceiptDto`
-   **Responses:**
    -   `200 OK`: Validation and fulfillment successful.
    -   `400 Bad Request`: Invalid input or receipt already processed.
    -   `402 Payment Required`: The receipt is invalid or expired.
    -   `409 Conflict`: The transaction has already been processed.
    -   `500 Internal Server Error`: An unexpected error occurred.

### 4.2. DTO (`src/api/v1/dtos/validate-receipt.dto.ts`)

typescript
// src/api/v1/dtos/validate-receipt.dto.ts
import { IsString, IsNotEmpty, IsIn, IsUUID } from 'class-validator';

export class ValidateReceiptDto {
    @IsString()
    @IsNotEmpty()
    receiptData: string;

    @IsString()
    @IsNotEmpty()
    sku: string; // The SKU of the item being purchased

    @IsIn(['ios', 'android'])
    platform: 'ios' | 'android';

    @IsUUID()
    userId: string;
}


### 4.3. Controller (`src/api/v1/controllers/iap.controller.ts`)

The controller acts as the entry point, responsible for validating the DTO and delegating to the application service.

typescript
// src/api/v1/controllers/iap.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IAPValidationService } from '../../../application/services/iap-validation.service';
import { ValidateReceiptDto } from '../dtos/validate-receipt.dto';

export class IAPController {
    constructor(private readonly iapValidationService: IAPValidationService) {}

    public async validatePurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: ValidateReceiptDto = req.body;
            // DTO validation will be handled by a middleware
            
            const result = await this.iapValidationService.validateAndFulfillPurchase(dto);

            if (!result.success) {
                // Map service layer errors to appropriate HTTP status codes
                res.status(result.statusCode || 400).json({ message: result.message });
                return;
            }

            res.status(200).json({
                message: "Purchase validated and fulfilled successfully.",
                data: result.data,
            });
        } catch (error) {
            next(error); // Pass to global error handler
        }
    }
}


## 5. Application Layer

### 5.1. `IAPValidationService` (`src/application/services/iap-validation.service.ts`)

This service orchestrates the entire validation and fulfillment workflow.

**Logic for `validateAndFulfillPurchase` method:**
1.  **Check for Duplicates:** Use `IIAPTransactionRepository.findByPlatformTransactionId` to see if a transaction with the given receipt/token already exists. If it does and is already `validated` or `fulfilled`, return a `409 Conflict` error to prevent replay attacks.
2.  **Create Transaction Record:** Create a new `IAPTransaction` domain aggregate in a `pending` state. Use `IIAPTransactionRepository.create` to save this initial record. This ensures a transaction log exists even if subsequent steps fail.
3.  **Get Platform Validator:** Use a factory (`PlatformValidatorFactory`) to get the correct gateway (`AppleAppStoreValidator` or `GooglePlayValidator`) based on the `platform` from the DTO.
4.  **Validate Receipt:** Call `validateReceipt` on the selected validator gateway.
5.  **Handle Validation Failure:** If `isValid` is false, update the transaction aggregate status to `failed` with the reason, save it, and return a `402 Payment Required` error.
6.  **Handle Validation Success:**
    a. Update the transaction aggregate with the `validated` status and the `validationResponse` from the gateway. Save the updated aggregate.
    b. Call `IPlayerServiceGateway.creditPlayer` with the `userId`, `sku`, and the internal transaction ID.
7.  **Handle Fulfillment Failure:** If `creditPlayer` returns `success: false`, update the transaction status to `error` (or a similar state indicating a fulfillment issue that needs manual intervention), log the error, and return a `500 Internal Server Error`.
8.  **Handle Fulfillment Success:**
    a. Update the transaction aggregate status to `fulfilled` with the fulfillment details.
    b. Save the final state of the transaction aggregate using the repository.
    c. Return a success response.

### 5.2. Port Interfaces (`src/application/interfaces/`)

-   **`IPlatformValidatorGateway`:**
    typescript
    export interface ValidationResult {
        isValid: boolean;
        transactionId: string; // The unique ID from the platform
        purchaseDate: Date;
        sku: string;
        rawResponse: any; // The original response from the platform
    }

    export interface IPlatformValidatorGateway {
        validateReceipt(receiptData: string, sku: string): Promise<ValidationResult>;
    }
    
-   **`IPlayerServiceGateway`:**
    typescript
    export interface FulfillmentResult {
        success: boolean;
        details?: any; // e.g., updated currency balance
    }

    export interface IPlayerServiceGateway {
        creditPlayer(userId: string, sku: string, transactionId: string): Promise<FulfillmentResult>;
    }
    

## 6. Domain Layer

### 6.1. `IAPTransaction` Aggregate (`src/domain/iap-transaction/iap-transaction.aggregate.ts`)

This class represents the core business object. It enforces state transitions.

typescript
// Abridged for clarity
export class IAPTransaction {
    // Properties as defined in the file structure
    
    public markAsValidated(response: any): void {
        if (this.status !== 'pending') {
            throw new Error('Transaction is not in a pending state.');
        }
        this.status = 'validated';
        this.validationResponse = response;
    }

    public markAsFulfilled(details: any): void {
        if (this.status !== 'validated') {
            throw new Error('Transaction must be validated before it can be fulfilled.');
        }
        this.status = 'fulfilled';
        this.fulfillmentDetails = details;
    }
    
    // ... other methods like markAsFailed, create, etc.
}


### 6.2. `IIAPTransactionRepository` Interface (`src/domain/iap-transaction/iap-transaction.repository.interface.ts`)

This interface defines the persistence contract.

typescript
import { IAPTransaction } from './iap-transaction.aggregate';

export interface IIAPTransactionRepository {
    findByPlatformTransactionId(platform: 'ios' | 'android', transactionId: string): Promise<IAPTransaction | null>;
    create(transaction: IAPTransaction): Promise<void>;
    save(transaction: IAPTransaction): Promise<void>;
}


## 7. Infrastructure Layer

### 7.1. Database (`src/infrastructure/mongodb/`)

-   **`iap-transaction.schema.ts`:** Implements the Mongoose schema.
    -   Defines fields: `userId`, `sku`, `platform`, `platformTransactionId`, `purchaseDate`, `status`, etc.
    -   **Index:** Creates a unique compound index on `{ platform: 1, platformTransactionId: 1 }`.
    -   Enables Mongoose timestamps (`{ timestamps: true }`).

-   **`mongoose-iap-transaction.repository.ts`:** Implements `IIAPTransactionRepository`.
    -   Uses the Mongoose model to perform `findOne`, `create`, and `findByIdAndUpdate` operations.
    -   Contains mapper functions to convert between the Mongoose document and the `IAPTransaction` domain aggregate.

### 7.2. Gateways (`src/infrastructure/gateways/`)

-   **`apple-app-store.validator.ts`:**
    -   Constructor takes `axios` instance and config (validation URL, shared secret).
    -   `validateReceipt`: Sends a `POST` request to Apple's `verifyReceipt` endpoint with the payload `{ 'receipt-data': receiptData, 'password': this.sharedSecret, 'exclude-old-transactions': true }`. It handles Apple's status codes (e.g., 0 for success, 21007 for sandbox, others for errors) and maps the response to the standard `ValidationResult` interface.

-   **`google-play.validator.ts`:**
    -   Constructor initializes the `google.auth.GoogleAuth` client with service account credentials from the config.
    -   `validateReceipt`: Uses the authenticated client to access the `androidpublisher('v3')` service. Calls `purchases.products.get` with `packageName`, `productId` (sku), and `token` (receiptData). It checks that `purchaseState` is 0 (purchased) and `consumptionState` is 0 (not yet consumed), then maps the response to the `ValidationResult`.

-   **`http-player.service.gateway.ts`:**
    -   Constructor takes an `axios` instance and the Player Service URL from config.
    -   `creditPlayer`: Sends a `POST` request to `{playerServiceUrl}/v1/player/credit` with the payload `{ userId, sku, transactionId }`. It should include an internal service-to-service authentication token for security. It returns the response mapped to the `FulfillmentResult` interface.

## 8. Cross-Cutting Concerns

### 8.1. Error Handling

An Express middleware will be created to catch all errors. It will check the error type and return a standardized JSON response with an appropriate HTTP status code and message. For example, a `ValidationError` from `class-validator` would result in a 400, while an unhandled exception results in a 500.

### 8.2. Logging

A `winston` logger instance will be configured to output structured JSON logs.
-   **Info Level:** Log incoming requests, successful validations, and successful fulfillments.
-   **Warn Level:** Log non-critical issues, like a validation failure from Apple/Google.
-   **Error Level:** Log all unhandled exceptions and critical failures (e.g., failure to connect to DB, Player Service being down).
-   All logs should include a `transactionId` where applicable for tracing.