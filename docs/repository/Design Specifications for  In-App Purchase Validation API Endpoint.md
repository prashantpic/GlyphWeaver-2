# Software Design Specification (SDS): In-App Purchase Validation API Endpoint

## 1. Introduction

This document outlines the software design for the **Glyph Weaver In-App Purchase (IAP) Validation API Endpoint** (`REPO-GLYPH-IAP`). This microservice is a critical security component responsible for the server-side validation of purchase receipts from the Apple App Store and Google Play Store. Its primary purpose is to securely verify transactions, prevent fraudulent activities like replay attacks, and reliably grant purchased content to the player.

This service is designed as a RESTful API using a layered architecture, built with TypeScript on the Node.js/Express.js stack.

### 1.1. Core Requirements

*   **REQ-8-013, REQ-SEC-008:** Implement secure, server-side validation for all IAP receipts with platform providers (Apple/Google).
*   **REQ-SEC-008:** Prevent replay attacks by uniquely identifying and tracking each transaction.
*   **REQ-8-017:** Reliably grant items/currency to the player's server-authoritative inventory upon successful validation.
*   **REQ-8-001:** Adhere to all platform guidelines for monetization and IAPs.

## 2. System Architecture

The service adheres to a clean, layered architecture to ensure separation of concerns, maintainability, and testability.

*   **Presentation Layer:** Handles HTTP requests and responses. It includes controllers, routes, DTOs, and request validators.
*   **Application Layer:** Orchestrates the business logic. The `IapValidationService` coordinates the validation workflow.
*   **Infrastructure Layer:** Manages communication with external systems, such as the Apple/Google validation servers and the database. This includes gateways and repositories.
*   **Domain Layer:** Defines the core data structures and models, such as the `IAPTransaction` schema.

### 2.1. Design Patterns

*   **Repository Pattern:** Decouples application logic from data access logic (`IapTransactionRepository`, `PlayerInventoryRepository`).
*   **Service Layer Pattern:** Encapsulates the core business logic (`IapValidationService`).
*   **Strategy & Factory Pattern:** Abstracting platform-specific validation logic. A `PlatformGatewayFactory` provides the correct validation "strategy" (`AppleIapGateway` or `GoogleIapGateway`) at runtime.
*   **Dependency Injection:** Dependencies (like repositories and gateways) will be injected into services and controllers to promote loose coupling and testability.

## 3. Configuration & Environment

The service requires the following environment variables for configuration. These must not be hardcoded.


# MongoDB Connection
MONGO_DB_CONNECTION_STRING=mongodb://user:password@host:port/database

# JWT Secret for authenticating incoming requests from the client
JWT_SECRET=a_very_strong_and_long_random_secret

# Apple IAP Validation
APPLE_IAP_SHARED_SECRET=your_apple_app_specific_shared_secret
APPLE_IAP_VALIDATION_URL=https://buy.itunes.apple.com/verifyReceipt

# Google IAP Validation
# Base64 encoded JSON service account key file
GOOGLE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_service_account_json
GOOGLE_PACKAGE_NAME=com.glyphweaver.game


## 4. Detailed Component Design

This section details the design of each file within the `backend/src/api/iap/` directory structure.

### 4.1. Core Domain & Repositories (`src/core/`)

#### 4.1.1. `domain/iapTransaction.model.ts`

This file defines the Mongoose schema for the `iaptransactions` collection.

*   **Purpose:** To model and persist every IAP transaction, serving as a permanent record for fraud prevention and auditing.
*   **Schema Definition:** `iapTransactionSchema`
    *   `userId`: `Schema.Types.ObjectId`, `ref: 'PlayerProfile'`, `required: true`, `index: true`
    *   `sku`: `String`, `required: true` (e.g., 'com.glyphweaver.hints.pack1')
    *   `platform`: `String`, `enum: ['ios', 'android']`, `required: true`
    *   `platformTransactionId`: `String`, `required: true`
    *   `purchaseDate`: `Date`, `required: true`
    *   `validationStatus`: `String`, `enum: ['pending', 'validated', 'failed', 'refunded']`, `default: 'pending'`, `required: true`
    *   `validationResponse`: `Schema.Types.Mixed` (Stores the raw response from the validation server for debugging)
    *   `itemsGranted`: `Schema.Types.Mixed` (A record of what was granted, e.g., `{ type: 'currency', amount: 100 }`)
*   **Indexes:** A compound unique index `({ platform: 1, platformTransactionId: 1 })` is **critical** to prevent processing the same transaction twice (replay attack prevention).
*   **Model Export:** `export const IapTransactionModel = model<IIapTransaction>('IAPTransaction', iapTransactionSchema);`

#### 4.1.2. `repositories/iapTransaction.repository.ts`

This repository encapsulates all database logic for `IAPTransaction` documents.

*   **Class:** `IapTransactionRepository`
*   **Methods:**
    *   `public async findByPlatformTransactionId(platform: string, transactionId: string): Promise<IIapTransaction | null>`
        *   **Logic:** Uses `IapTransactionModel.findOne()` with the compound index fields to efficiently check if a transaction has already been processed.
    *   `public async create(transactionData: Partial<IIapTransaction>): Promise<IIapTransaction>`
        *   **Logic:** Creates a new `IapTransactionModel` instance with `validationStatus: 'pending'` and saves it to the database. Returns the created document.
    *   `public async update(id: string, updates: Partial<IIapTransaction>): Promise<IIapTransaction | null>`
        *   **Logic:** Uses `IapTransactionModel.findByIdAndUpdate()` to update the status and other fields of a transaction record after validation.

#### 4.1.3. `repositories/playerInventory.repository.ts`

This repository manages updates to the player's inventory (defined in another service, but its interface is used here).

*   **Class:** `PlayerInventoryRepository`
*   **Methods:**
    *   `public async grantItemsToPlayer(userId: string, items: { keyName: string; quantity: number }[]): Promise<void>`
        *   **Logic:** Iterates through the items to be granted. For each item, it performs an atomic `findOneAndUpdate` on the `PlayerInventory` collection for the given `userId` and `item.keyName`, using the `$inc: { quantity: item.quantity }` operator. It will use `upsert: true` to create the inventory record if it doesn't exist. This operation must be idempotent and atomic.

#### 4.1.4. `core/services/audit.service.ts`

A cross-cutting service for logging critical events.

*   **Interface:** `IAuditLogService`
    *   `logEvent(eventType: string, details: object, userId?: string): Promise<void>`
*   **Class:** `AuditLogService` (implements `IAuditLogService`)
    *   **Logic:** Creates a new `AuditLog` document (model defined elsewhere) with the provided details and saves it to the `auditlogs` collection. This is used to record IAP validation attempts, successes, and failures.

### 4.2. IAP Infrastructure (`src/iap/infrastructure/`)

#### 4.2.1. `gateways/platform.gateway.ts`

This file defines the abstraction for platform-specific validators.

*   **Interface:** `IPlatformIapGateway`
    *   `validate(receiptData: any): Promise<{ isValid: boolean; transactionId: string; sku: string; rawResponse: any; }>`
        *   **Purpose:** To define a uniform contract that all platform gateways must adhere to.
*   **Class:** `PlatformGatewayFactory`
    *   **Dependencies:** `AppleIapGateway`, `GoogleIapGateway`
    *   **Method:** `public getGateway(platform: 'ios' | 'android'): IPlatformIapGateway`
        *   **Logic:** A simple `switch` or `if/else` statement that returns an instance of the appropriate gateway based on the input string. This implements the Factory pattern.

#### 4.2.2. `gateways/apple.gateway.ts`

*   **Class:** `AppleIapGateway` (implements `IPlatformIapGateway`)
*   **Library:** `apple-receipt-verify`
*   **Method:** `public async validate(receiptData: string): Promise<...>`
    *   **Logic:**
        1.  Initializes `apple-receipt-verify` with the `APPLE_IAP_SHARED_SECRET` from environment variables.
        2.  Calls the library's verification function with the provided `receiptData`.
        3.  Parses the response from Apple.
        4.  Checks the `status` code. Status `0` indicates success.
        5.  Extracts the `transaction_id` and `product_id` from the `receipt.in_app` array (for the latest transaction).
        6.  Returns the standardized response object.
        7.  Handles errors (e.g., invalid receipt, communication errors) and returns `isValid: false`.

#### 4.2.3. `gateways/google.gateway.ts`

*   **Class:** `GoogleIapGateway` (implements `IPlatformIapGateway`)
*   **Library:** `google-play-billing`
*   **Method:** `public async validate(receiptData: { token: string; sku: string }): Promise<...>`
    *   **Logic:**
        1.  Initializes the `google-play-billing` library using the service account credentials from `GOOGLE_SERVICE_ACCOUNT_BASE64`.
        2.  Calls the library's `verifyPurchase` method, passing the `GOOGLE_PACKAGE_NAME`, `receiptData.sku`, and `receiptData.token`.
        3.  Checks the response for a `purchaseState` of `0` (Purchased).
        4.  Extracts the `orderId` as the `transactionId`.
        5.  Returns the standardized response object.
        6.  Handles errors (e.g., invalid token, consumed purchase) and returns `isValid: false`.

### 4.3. IAP Application Service (`src/iap/application/`)

#### 4.3.1. `iap.service.ts`

This is the core orchestrator of the validation logic.

*   **Class:** `IapValidationService`
*   **Dependencies (Injected):** `PlatformGatewayFactory`, `IapTransactionRepository`, `PlayerInventoryRepository`, `IAuditLogService`
*   **Method:** `public async validatePurchase(userId: string, requestDto: ValidateIapRequestDto): Promise<{ success: boolean; message: string; }>`
    *   **Logic:**
        1.  Destructure `platform` and `receiptData` from `requestDto`.
        2.  Use the `PlatformGatewayFactory` to get the correct `gateway`.
        3.  Call `gateway.validate(receiptData)`.
        4.  If the external validation fails (`!validationResult.isValid`), log the audit event and return a failure response.
        5.  Use `IapTransactionRepository.findByPlatformTransactionId()` to check if `validationResult.transactionId` has already been processed. If it exists, this is a **replay attack**. Log the audit event and return a failure response.
        6.  **Begin Transactional Block** (Conceptual `try...catch`)
        7.  Create a pending transaction record using `IapTransactionRepository.create()`.
        8.  Retrieve the item details to be granted from a configuration or database based on `validationResult.sku`.
        9.  Call `PlayerInventoryRepository.grantItemsToPlayer()` to credit the user's account.
        10. If granting is successful, call `IapTransactionRepository.update()` to set the transaction's `validationStatus` to `'validated'` and store the `itemsGranted`.
        11. Log a success audit event using `AuditLogService`.
        12. Return `{ success: true, message: 'Purchase validated successfully.' }`.
        13. **Catch Block:** If any step after creating the pending transaction fails, update the transaction's status to `'failed'`, log the error with the `AuditLogService`, and return a failure response.

### 4.4. IAP Presentation Layer (`src/iap/presentation/`)

#### 4.4.1. `dtos/validateIap.dto.ts`

*   **Purpose:** Defines the API contract.
*   **Class/Interface:** `ValidateIapRequestDto`
    *   `platform: 'ios' | 'android'`
    *   `receiptData: string | { token: string; sku: string }`
*   **Class/Interface:** `ValidateIapResponseDto`
    *   `success: boolean`
    *   `message: string`
    *   `data?: any` (Optional field for additional context)

#### 4.4.2. `validators/validateIap.validator.ts`

*   **Library:** `joi`
*   **Export:** A `Joi.object()` schema.
*   **Logic:**
    *   `platform`: `Joi.string().valid('ios', 'android').required()`
    *   `receiptData`: `Joi.when('platform', { is: 'ios', then: Joi.string().required(), otherwise: Joi.object({ token: Joi.string().required(), sku: Joi.string().required() }).required() })`
    *   This conditional validation is key to handling the different receipt structures.

#### 4.4.3. `iap.controller.ts`

*   **Class:** `IapController`
*   **Dependency (Injected):** `IapValidationService`
*   **Method:** `public async validate(req: Request, res: Response, next: NextFunction): Promise<void>`
    *   **Logic:**
        1.  Extract `userId` from `req.user` (populated by auth middleware).
        2.  Cast `req.body` to `ValidateIapRequestDto`.
        3.  Wrap the service call in a `try...catch` block for robust error handling.
        4.  Call `this._iapValidationService.validatePurchase(userId, req.body)`.
        5.  If `result.success` is true, send `res.status(200).json(result)`.
        6.  If `result.success` is false, send `res.status(400).json(result)`.
        7.  In the `catch` block, call `next(error)` to pass control to a global error handler.

#### 4.4.4. `iap.routes.ts`

*   **Purpose:** To define the endpoint and its middleware pipeline.
*   **Logic:**
    1.  `import { Router } from 'express';`
    2.  `const router = Router();`
    3.  Import `authMiddleware`, `validationMiddleware` (a generic middleware that uses a Joi schema), `iapController`, and the `validateIapValidator` schema.
    4.  `router.post('/validate', authMiddleware, validationMiddleware(validateIapValidator), iapController.validate);`
    5.  `export default router;`

## 5. Security & Error Handling

*   **Authentication:** The `/validate` route MUST be protected by an authentication middleware that verifies a user's JWT and attaches their ID to the request object.
*   **Validation:** All incoming request bodies are strictly validated against the Joi schema to prevent malformed data.
*   **Replay Attacks:** Prevented by the unique compound index on `platform` and `platformTransactionId` in the `IAPTransaction` model and the explicit check in the `IapValidationService`.
*   **Error Responses:** The API will return clear, consistent JSON error messages with appropriate HTTP status codes (e.g., 400 for client error, 401 for unauthorized, 403 for forbidden, 500 for server error).
*   **Audit Logging:** All significant events (success, failure, replay attempts) are logged for security analysis and customer support.