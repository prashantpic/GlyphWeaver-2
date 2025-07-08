# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the Node.js project's metadata, dependencies, and scripts. It lists libraries like express, typescript, mongoose, joi, google-play-billing, and apple-receipt-verify, which are crucial for the IAP validation service.  
**Template:** Node.js Package Manifest  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** ../  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    - Project Scripts
    
**Requirement Ids:**
    
    - REQ-8-001
    
**Purpose:** To manage project dependencies and define scripts for building, running, and testing the IAP validation API.  
**Logic Description:** This file will contain a 'dependencies' section listing 'express', 'mongoose', 'joi', 'google-play-billing', 'apple-receipt-verify', 'jsonwebtoken', and other necessary libraries. The 'devDependencies' section will include 'typescript', '@types/node', '@types/express', 'ts-node', etc. The 'scripts' section will have commands for 'build', 'start', 'dev', and 'test'.  
**Documentation:**
    
    - **Summary:** Standard package.json file for a TypeScript-based Node.js Express application. It serves as the manifest for the IAP validation service, declaring all its third-party library dependencies and providing convenient scripts for development and deployment workflows.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration file. It specifies root files, compiler options like target ECMAScript version (e.g., ES2020), module system (CommonJS), output directory (e.g., 'dist'), and strict type-checking rules.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** ../  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Rules
    
**Requirement Ids:**
    
    - REQ-8-001
    
**Purpose:** To configure the TypeScript compiler (tsc) to transpile the TypeScript source code into JavaScript that can be executed by Node.js, ensuring type safety and modern language features.  
**Logic Description:** The 'compilerOptions' object will be configured with 'target': 'ES2020', 'module': 'CommonJS', 'outDir': './dist', 'rootDir': './src', 'strict': true, 'esModuleInterop': true, and 'experimentalDecorators': true. The 'include' array will point to 'src/**/*.ts'.  
**Documentation:**
    
    - **Summary:** Defines the settings for the TypeScript compiler. This configuration ensures consistent, type-safe compilation of the entire IAP service codebase into executable JavaScript.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/core/domain/iapTransaction.model.ts  
**Description:** Defines the Mongoose schema and model for an In-App Purchase transaction record. This model represents a transaction in the database, tracking its platform, ID, validation status, and associated user and item details.  
**Template:** Mongoose Schema  
**Dependency Level:** 1  
**Name:** IapTransactionModel  
**Type:** Model  
**Relative Path:** core/domain  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - Domain-Driven Design (DDD) Principles
    
**Members:**
    
    - **Name:** userId  
**Type:** Schema.Types.ObjectId  
**Attributes:** public  
    - **Name:** itemId  
**Type:** Schema.Types.ObjectId  
**Attributes:** public  
    - **Name:** platform  
**Type:** string  
**Attributes:** public  
    - **Name:** platformTransactionId  
**Type:** string  
**Attributes:** public  
    - **Name:** purchaseDate  
**Type:** Date  
**Attributes:** public  
    - **Name:** validationStatus  
**Type:** string  
**Attributes:** public  
    - **Name:** itemsGranted  
**Type:** object  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - IAP Transaction Data Schema
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To create a structured data model and define the schema for storing every IAP transaction in the MongoDB database, which is critical for preventing fraud and for auditing.  
**Logic Description:** This file will define a Mongoose schema named 'iapTransactionSchema'. The schema will include fields like 'userId', 'platformTransactionId' (with a unique index scoped to 'platform'), 'sku', 'purchaseDate', 'validationStatus' (enum: 'pending', 'validated', 'failed')), and 'itemsGranted'. A Mongoose model will be created from this schema and exported for use in the repository layer.  
**Documentation:**
    
    - **Summary:** This file defines the data structure for IAP transaction records using Mongoose. It serves as the blueprint for how transaction data is persisted, ensuring each transaction is uniquely identified and its state is accurately tracked.
    
**Namespace:** GlyphWeaver.Backend.Core.Domain  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/core/repositories/iapTransaction.repository.ts  
**Description:** Implements the data access logic for IAPTransaction entities using Mongoose. It abstracts the database operations, providing methods to create, find, and update transaction records.  
**Template:** C# Repository Template  
**Dependency Level:** 2  
**Name:** IapTransactionRepository  
**Type:** Repository  
**Relative Path:** core/repositories  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - Repository Pattern
    
**Members:**
    
    - **Name:** _iapTransactionModel  
**Type:** Model<IIapTransaction>  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** findByPlatformTransactionId  
**Parameters:**
    
    - platform: string
    - transactionId: string
    
**Return Type:** Promise<IIapTransaction | null>  
**Attributes:** public  
    - **Name:** create  
**Parameters:**
    
    - transactionData: Partial<IIapTransaction>
    
**Return Type:** Promise<IIapTransaction>  
**Attributes:** public  
    - **Name:** updateStatus  
**Parameters:**
    
    - id: string
    - status: string
    - validationResponse: object
    
**Return Type:** Promise<IIapTransaction | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - IAP Transaction CRUD
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To provide a clean, abstracted interface for interacting with the 'iaptransactions' collection in MongoDB, decoupling the application logic from direct database queries.  
**Logic Description:** The IapTransactionRepository class will be implemented. It will take the IapTransaction Mongoose model as a dependency. The 'findByPlatformTransactionId' method will perform a 'findOne' query to check for existing transactions to prevent replay attacks. The 'create' method will instantiate and save a new transaction document. The 'updateStatus' method will find a transaction by its ID and update its validation status.  
**Documentation:**
    
    - **Summary:** This repository handles all database operations related to IAP transactions. It provides methods to check for duplicate transactions, create new transaction records, and update their validation status, forming a critical part of the IAP validation flow.
    
**Namespace:** GlyphWeaver.Backend.Core.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/core/repositories/playerInventory.repository.ts  
**Description:** Handles data access for a player's inventory, specifically for granting items or virtual currency after a successful IAP. This is a crucial component for fulfilling purchases.  
**Template:** C# Repository Template  
**Dependency Level:** 2  
**Name:** PlayerInventoryRepository  
**Type:** Repository  
**Relative Path:** core/repositories  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - Repository Pattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** grantItemsToPlayer  
**Parameters:**
    
    - userId: string
    - items: { type: string; keyName: string; quantity: number }[]
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Player Item Granting
    
**Requirement Ids:**
    
    - REQ-8-017
    
**Purpose:** To provide a transactional and reliable way to update a player's inventory or currency balance in the database after a purchase has been successfully validated.  
**Logic Description:** The PlayerInventoryRepository class will be defined. The 'grantItemsToPlayer' method will receive a user ID and a list of items to grant. It will iterate through the items, using 'findOneAndUpdate' with the '$inc' operator to atomically increment the quantity for each item in the PlayerInventory collection, with 'upsert: true' to create the item record if it doesn't exist for the player.  
**Documentation:**
    
    - **Summary:** This repository is responsible for modifying a player's inventory in the database. Its primary method, 'grantItemsToPlayer', ensures that items and currency from a validated purchase are correctly and atomically credited to the player's account.
    
**Namespace:** GlyphWeaver.Backend.Core.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/iap/application/iap.service.ts  
**Description:** The core application service that orchestrates the entire IAP validation process. It coordinates between the gateway, repositories, and logging services to handle a validation request from start to finish.  
**Template:** TypeScript Service Template  
**Dependency Level:** 3  
**Name:** IapValidationService  
**Type:** Service  
**Relative Path:** iap/application  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - Service Layer Pattern
    
**Members:**
    
    - **Name:** _platformGatewayFactory  
**Type:** PlatformGatewayFactory  
**Attributes:** private  
    - **Name:** _iapTransactionRepository  
**Type:** IapTransactionRepository  
**Attributes:** private  
    - **Name:** _playerInventoryRepository  
**Type:** PlayerInventoryRepository  
**Attributes:** private  
    - **Name:** _auditLogService  
**Type:** IAuditLogService  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** validatePurchase  
**Parameters:**
    
    - userId: string
    - requestDto: ValidateIapRequestDto
    
**Return Type:** Promise<{ success: boolean; message: string; }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - IAP Validation Orchestration
    - Fraud Prevention
    - Purchase Fulfillment
    
**Requirement Ids:**
    
    - REQ-8-001
    - REQ-8-013
    - REQ-SEC-008
    - REQ-8-017
    
**Purpose:** To implement the main business logic for validating an in-app purchase, ensuring it's authentic, not a duplicate, and that the player receives their items upon success.  
**Logic Description:** The 'validatePurchase' method will first check if the transaction ID already exists using the IAP repository to prevent replay attacks. It will then use the PlatformGatewayFactory to get the correct validator (Apple or Google). It will call the gateway's 'validate' method. If validation is successful, it creates a transaction record, grants items to the player via the PlayerInventoryRepository, updates the transaction status to 'validated', and logs a success audit event. If any step fails, it updates the transaction status to 'failed' and logs an appropriate audit event.  
**Documentation:**
    
    - **Summary:** This service orchestrates the IAP validation workflow. It takes a validation request, communicates with the appropriate platform gateway for verification, checks for duplicate transactions, and if all checks pass, uses repositories to record the transaction and grant items to the player.
    
**Namespace:** GlyphWeaver.Backend.Api.IAP.Application  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/iap/infrastructure/gateways/platform.gateway.ts  
**Description:** Defines the interface for platform-specific IAP validation gateways and a factory to create the correct gateway instance based on the platform (iOS or Android).  
**Template:** TypeScript Service Template  
**Dependency Level:** 2  
**Name:** PlatformGatewayFactory  
**Type:** Service  
**Relative Path:** iap/infrastructure/gateways  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - Strategy Pattern
    - Factory Pattern
    
**Members:**
    
    - **Name:** _appleGateway  
**Type:** AppleIapGateway  
**Attributes:** private  
    - **Name:** _googleGateway  
**Type:** GoogleIapGateway  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** getGateway  
**Parameters:**
    
    - platform: 'ios' | 'android'
    
**Return Type:** IPlatformIapGateway  
**Attributes:** public  
    
**Implemented Features:**
    
    - Gateway Abstraction
    - Gateway Selection
    
**Requirement Ids:**
    
    - REQ-8-013
    
**Purpose:** To decouple the core IAP service from the specific implementation details of Apple and Google validation libraries, allowing for easier maintenance and testing.  
**Logic Description:** An interface 'IPlatformIapGateway' will be defined with a 'validate' method. The 'PlatformGatewayFactory' class will have a 'getGateway' method that takes a platform string ('ios' or 'android') and returns an instance of either 'AppleIapGateway' or 'GoogleIapGateway', which both implement the interface. This hides the selection logic from the main service.  
**Documentation:**
    
    - **Summary:** This file provides an abstraction layer for interacting with external platform validation services. It defines a common gateway interface and includes a factory to dynamically select the correct implementation (Apple or Google) at runtime.
    
**Namespace:** GlyphWeaver.Backend.Api.IAP.Infrastructure.Gateways  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/iap/infrastructure/gateways/apple.gateway.ts  
**Description:** Implements the IAP validation logic specifically for Apple App Store receipts. It uses the 'apple-receipt-verify' library to communicate with Apple's validation servers.  
**Template:** TypeScript Service Template  
**Dependency Level:** 3  
**Name:** AppleIapGateway  
**Type:** Service  
**Relative Path:** iap/infrastructure/gateways  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - Strategy Pattern
    - Gateway Pattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** validate  
**Parameters:**
    
    - receipt: string
    
**Return Type:** Promise<{ isValid: boolean; transactionId: string; sku: string; }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Apple Receipt Validation
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To handle the specific details of validating an iOS purchase receipt with Apple's servers.  
**Logic Description:** The 'AppleIapGateway' class will implement the 'IPlatformIapGateway' interface. Its 'validate' method will use the 'apple-receipt-verify' library, initializing it with the shared secret. It will call the library's verification function, process the response from Apple, handle different status codes, and return a standardized result object indicating if the receipt is valid, along with the transaction ID and product SKU.  
**Documentation:**
    
    - **Summary:** This gateway component encapsulates all logic for communicating with the Apple App Store's receipt validation endpoint. It takes a raw receipt from an iOS device and returns a standardized validation result.
    
**Namespace:** GlyphWeaver.Backend.Api.IAP.Infrastructure.Gateways  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/iap/infrastructure/gateways/google.gateway.ts  
**Description:** Implements the IAP validation logic specifically for Google Play Store receipts. It uses the 'google-play-billing' library to communicate with Google's validation servers.  
**Template:** TypeScript Service Template  
**Dependency Level:** 3  
**Name:** GoogleIapGateway  
**Type:** Service  
**Relative Path:** iap/infrastructure/gateways  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - Strategy Pattern
    - Gateway Pattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** validate  
**Parameters:**
    
    - receipt: { token: string; sku: string }
    
**Return Type:** Promise<{ isValid: boolean; transactionId: string; sku: string; }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Google Purchase Validation
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To handle the specific details of validating an Android purchase receipt with Google's servers.  
**Logic Description:** The 'GoogleIapGateway' class will implement the 'IPlatformIapGateway' interface. Its 'validate' method will use the 'google-play-billing' library, initializing it with the service account credentials. It will call the library's purchase validation function using the provided purchase token and SKU, process the response, handle errors, and return a standardized result object.  
**Documentation:**
    
    - **Summary:** This gateway component encapsulates all logic for communicating with the Google Play Developer API's purchase validation endpoint. It takes purchase data from an Android device and returns a standardized validation result.
    
**Namespace:** GlyphWeaver.Backend.Api.IAP.Infrastructure.Gateways  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/iap/presentation/dtos/validateIap.dto.ts  
**Description:** Defines the Data Transfer Objects (DTOs) for the IAP validation endpoint. This includes the structure of the incoming request body and the outgoing response body.  
**Template:** TypeScript DTO  
**Dependency Level:** 1  
**Name:** ValidateIapDto  
**Type:** DTO  
**Relative Path:** iap/presentation/dtos  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Contract Definition
    
**Requirement Ids:**
    
    - REQ-8-013
    
**Purpose:** To establish a clear and stable contract for the IAP validation API, decoupling the API's public shape from internal service and domain models.  
**Logic Description:** This file will export two classes or interfaces. 'ValidateIapRequestDto' will define the expected request body, containing fields like 'platform' (enum: 'ios', 'android') and 'receiptData' (string for iOS, object for Android). 'ValidateIapResponseDto' will define the success response structure, e.g., '{ success: boolean; message: string; }'.  
**Documentation:**
    
    - **Summary:** This file defines the data structures for requests and responses for the IAP validation endpoint. It acts as the formal API contract for any client interacting with this service.
    
**Namespace:** GlyphWeaver.Backend.Api.IAP.Presentation.DTOs  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/iap/presentation/validators/validateIap.validator.ts  
**Description:** Defines the validation schema for the IAP validation request DTO using the 'joi' library. It ensures that incoming requests are well-formed before being processed by the controller.  
**Template:** Joi Validator  
**Dependency Level:** 2  
**Name:** ValidateIapValidator  
**Type:** Validator  
**Relative Path:** iap/presentation/validators  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Request Body Validation
    
**Requirement Ids:**
    
    - REQ-8-013
    
**Purpose:** To enforce data integrity and structure for all incoming IAP validation requests, preventing malformed or invalid data from reaching the application logic.  
**Logic Description:** This file will export a Joi schema object. The schema will define rules for the 'ValidateIapRequestDto'. It will specify that 'platform' must be a string and one of 'ios' or 'android'. It will also define the structure of 'receiptData' conditionally based on the 'platform' value, ensuring the correct receipt format is provided for each.  
**Documentation:**
    
    - **Summary:** This file contains the Joi validation schema for the IAP validation request. It is used by a middleware to automatically validate the request body, ensuring all required fields are present and correctly formatted.
    
**Namespace:** GlyphWeaver.Backend.Api.IAP.Presentation.Validators  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/iap/presentation/iap.controller.ts  
**Description:** The Express controller that handles incoming HTTP requests for IAP validation. It receives the request, validates the body, calls the application service, and sends the appropriate HTTP response.  
**Template:** Express Controller  
**Dependency Level:** 4  
**Name:** IapController  
**Type:** Controller  
**Relative Path:** iap/presentation  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** _iapValidationService  
**Type:** IapValidationService  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** validate  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - API Endpoint Handling
    
**Requirement Ids:**
    
    - REQ-8-001
    - REQ-8-013
    
**Purpose:** To act as the entry point for all IAP-related API requests, connecting the web framework (Express) to the core application logic.  
**Logic Description:** The 'IapController' class will contain the 'validate' method. This method will extract the user ID from the authenticated request (e.g., from a JWT payload) and the request body (which is the DTO). It will then invoke 'this._iapValidationService.validatePurchase' with this data. Based on the service's response, it will send a 200 OK with a success message or a 400 Bad Request/500 Internal Server Error with an error message.  
**Documentation:**
    
    - **Summary:** This controller manages the HTTP request/response cycle for the IAP validation endpoint. It parses the request, invokes the core validation service, and formats the result into a JSON response with an appropriate HTTP status code.
    
**Namespace:** GlyphWeaver.Backend.Api.IAP.Presentation  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/iap/presentation/iap.routes.ts  
**Description:** Defines the Express router for all IAP-related endpoints. It maps the HTTP route '/validate' to the corresponding controller method and applies necessary middleware like authentication and validation.  
**Template:** Express Router  
**Dependency Level:** 5  
**Name:** IapRouter  
**Type:** Router  
**Relative Path:** iap/presentation  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - API Routing
    
**Requirement Ids:**
    
    - REQ-8-001
    - REQ-8-013
    
**Purpose:** To configure the API routes for the IAP feature, creating a modular and self-contained routing setup.  
**Logic Description:** This file will create a new Express router instance. It will define a POST route for '/validate'. This route will be protected by an authentication middleware (to get the user ID) and a validation middleware (using the Joi schema from 'validateIap.validator.ts'). The final handler for the route will be the 'validate' method from an instance of 'IapController'. The configured router will be exported.  
**Documentation:**
    
    - **Summary:** This file sets up the routing for the IAP validation API. It defines the '/validate' endpoint, specifies it uses the POST method, and chains the authentication, validation, and controller logic together in the request-handling pipeline.
    
**Namespace:** GlyphWeaver.Backend.Api.IAP.Presentation  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/core/services/audit.service.ts  
**Description:** Defines the interface and implementation for the Audit Logging service. This is a cross-cutting concern used by the IAP service to log critical security and financial events.  
**Template:** TypeScript Service Template  
**Dependency Level:** 1  
**Name:** AuditLogService  
**Type:** Service  
**Relative Path:** core/services  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - Service Layer Pattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** logEvent  
**Parameters:**
    
    - eventType: string
    - details: object
    - userId?: string
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Audit Event Logging
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To provide a centralized, reusable service for logging important audit trail information, such as successful or failed IAP validations, ensuring these events are recorded for security and support purposes.  
**Logic Description:** This file will define an 'IAuditLogService' interface with a 'logEvent' method. The 'AuditLogService' class will implement this interface. The 'logEvent' method will create a new document using an 'AuditLog' Mongoose model and save it to the database. The details object will contain context-specific information about the event being logged.  
**Documentation:**
    
    - **Summary:** Provides a standardized service for creating audit log entries. The IAP validation service uses this to record the outcome of every validation attempt, creating a verifiable trail of all transactions and potential fraudulent activities.
    
**Namespace:** GlyphWeaver.Backend.Core.Services  
**Metadata:**
    
    - **Category:** Infrastructure
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  - MONGO_DB_CONNECTION_STRING
  - APPLE_IAP_SHARED_SECRET
  


---

