# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the project dependencies, scripts, and metadata for the IAP Validation Service. It includes libraries like express, mongoose, typescript, and development tools.  
**Template:** Node.js Package  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    - Project Scripts
    
**Requirement Ids:**
    
    
**Purpose:** To manage project dependencies and define scripts for running, building, and testing the microservice.  
**Logic Description:** This file will list production dependencies such as express, mongoose, axios, and dotenv. Dev dependencies will include typescript, ts-node, nodemon, jest, and supertest. Scripts will be defined for 'start', 'build', 'dev', and 'test'.  
**Documentation:**
    
    - **Summary:** Contains all metadata for the Node.js project, including dependencies and scripts required to operate the service.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration file. It specifies root files, compiler options like target ECMAScript version, module system, strict type-checking, and output directory.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Rules
    
**Requirement Ids:**
    
    
**Purpose:** To configure the TypeScript compiler options for the project, ensuring code quality, consistency, and correct compilation to JavaScript.  
**Logic Description:** The configuration will set 'target' to 'es2020' or later, 'module' to 'commonjs', 'outDir' to './dist', 'rootDir' to './src', and enable 'strict' mode. It will also include 'esModuleInterop' and 'resolveJsonModule'.  
**Documentation:**
    
    - **Summary:** Specifies the TypeScript compiler options and settings for the entire project.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/config/index.ts  
**Description:** Centralized configuration management. This file loads environment variables using a library like 'dotenv', validates them, and exports them as a strongly-typed configuration object for use throughout the application.  
**Template:** Node.js Module  
**Dependency Level:** 1  
**Name:** config  
**Type:** Configuration  
**Relative Path:** config  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** NODE_ENV  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** PORT  
**Type:** number  
**Attributes:** public|readonly  
    - **Name:** MONGO_URI  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** APPLE_VALIDATION_URL  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** APPLE_SHARED_SECRET  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** GOOGLE_PROJECT_ID  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** GOOGLE_CLIENT_EMAIL  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** GOOGLE_PRIVATE_KEY  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** PLAYER_SERVICE_URL  
**Type:** string  
**Attributes:** public|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment Configuration Loading
    
**Requirement Ids:**
    
    - REQ-SEC-002
    
**Purpose:** To provide a single, type-safe source for all application configuration, abstracting away the process of reading from environment variables.  
**Logic Description:** The file will use dotenv to load variables from a .env file for local development. It will parse and export an immutable config object containing database connection strings, port numbers, and external service URLs and secrets. It will throw an error if essential variables are missing.  
**Documentation:**
    
    - **Summary:** Loads, validates, and exports all environment-specific configurations for the application.
    
**Namespace:** GlyphWeaver.Backend.IAP.Config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/domain/iap-transaction/iap-transaction.aggregate.ts  
**Description:** Defines the IAPTransaction aggregate root. This is the core domain model representing a single purchase transaction, encapsulating its state and business rules.  
**Template:** TypeScript Class  
**Dependency Level:** 1  
**Name:** IAPTransaction  
**Type:** DomainModel  
**Relative Path:** domain/iap-transaction  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - DomainDrivenDesign
    - AggregateRoot
    
**Members:**
    
    - **Name:** id  
**Type:** string  
**Attributes:** private|readonly  
    - **Name:** userId  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** sku  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** platform  
**Type:** 'ios' | 'android'  
**Attributes:** public|readonly  
    - **Name:** platformTransactionId  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** purchaseDate  
**Type:** Date  
**Attributes:** public|readonly  
    - **Name:** status  
**Type:** 'pending' | 'validated' | 'failed' | 'fulfilled' | 'error'  
**Attributes:** private  
    - **Name:** validationResponse  
**Type:** any  
**Attributes:** private  
    - **Name:** fulfillmentDetails  
**Type:** any  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** markAsValidated  
**Parameters:**
    
    - validationResponse: any
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** markAsFailed  
**Parameters:**
    
    - failureReason: any
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** markAsFulfilled  
**Parameters:**
    
    - fulfillmentDetails: any
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** isAlreadyProcessed  
**Parameters:**
    
    
**Return Type:** boolean  
**Attributes:** public  
    - **Name:** create  
**Parameters:**
    
    - props: IAPTransactionProps
    
**Return Type:** IAPTransaction  
**Attributes:** public|static  
    
**Implemented Features:**
    
    - Transaction State Management
    - Business Rule Enforcement
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To encapsulate the state and behavior of an IAP transaction, ensuring its integrity and enforcing business rules like preventing re-processing of a completed transaction.  
**Logic Description:** This class will contain the core properties of a transaction. Methods like 'markAsValidated' and 'markAsFailed' will enforce state transitions (e.g., a 'failed' transaction cannot become 'validated'). A static factory method 'create' will be used for instantiation, ensuring all new transactions start in a valid 'pending' state.  
**Documentation:**
    
    - **Summary:** Represents the IAPTransaction aggregate, holding all data and rules related to a single in-app purchase.
    
**Namespace:** GlyphWeaver.Backend.IAP.Domain.IAPTransaction  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/domain/iap-transaction/iap-transaction.repository.interface.ts  
**Description:** Defines the contract for the IAP transaction repository. This interface is part of the domain layer and dictates how transaction data is persisted, abstracting the data access mechanism.  
**Template:** TypeScript Interface  
**Dependency Level:** 2  
**Name:** IIAPTransactionRepository  
**Type:** Interface  
**Relative Path:** domain/iap-transaction  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - DomainDrivenDesign
    - RepositoryPattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** findById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<IAPTransaction | null>  
**Attributes:** public  
    - **Name:** findByPlatformTransactionId  
**Parameters:**
    
    - platform: 'ios' | 'android'
    - transactionId: string
    
**Return Type:** Promise<IAPTransaction | null>  
**Attributes:** public  
    - **Name:** save  
**Parameters:**
    
    - transaction: IAPTransaction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** create  
**Parameters:**
    
    - transaction: IAPTransaction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Data Persistence Contract
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To decouple the domain and application layers from the specific data persistence technology (MongoDB), allowing for easier testing and maintenance.  
**Logic Description:** This interface will define the essential CRUD-like operations needed by the application service to manage IAPTransaction aggregates. It specifies methods for finding transactions by various IDs and for saving (creating or updating) them.  
**Documentation:**
    
    - **Summary:** Provides the interface contract for persisting and retrieving IAPTransaction aggregates.
    
**Namespace:** GlyphWeaver.Backend.IAP.Domain.IAPTransaction  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/infrastructure/mongodb/schemas/iap-transaction.schema.ts  
**Description:** Defines the Mongoose schema for the IAPTransaction document. This maps the IAPTransaction domain aggregate to a MongoDB document structure.  
**Template:** Mongoose Schema  
**Dependency Level:** 2  
**Name:** IAPTransactionSchema  
**Type:** Schema  
**Relative Path:** infrastructure/mongodb/schemas  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - DataAccessObject
    
**Members:**
    
    - **Name:** _id  
**Type:** String  
**Attributes:**   
    - **Name:** userId  
**Type:** String  
**Attributes:** required  
    - **Name:** sku  
**Type:** String  
**Attributes:** required  
    - **Name:** platform  
**Type:** String  
**Attributes:** required  
    - **Name:** platformTransactionId  
**Type:** String  
**Attributes:** required|unique  
    - **Name:** purchaseDate  
**Type:** Date  
**Attributes:** required  
    - **Name:** status  
**Type:** String  
**Attributes:** required  
    - **Name:** validationResponse  
**Type:** Object  
**Attributes:**   
    - **Name:** fulfillmentDetails  
**Type:** Object  
**Attributes:**   
    - **Name:** createdAt  
**Type:** Date  
**Attributes:**   
    - **Name:** updatedAt  
**Type:** Date  
**Attributes:**   
    
**Methods:**
    
    
**Implemented Features:**
    
    - Data to Document Mapping
    
**Requirement Ids:**
    
    - REQ-8-013
    
**Purpose:** To define the structure, data types, validation, and indexes for the 'iap_transactions' collection in MongoDB.  
**Logic Description:** This file will create a Mongoose Schema instance. It will define fields corresponding to the IAPTransaction aggregate properties. It will set up a unique compound index on 'platform' and 'platformTransactionId' to prevent duplicate transaction entries. Timestamps will be enabled.  
**Documentation:**
    
    - **Summary:** Specifies the MongoDB document schema for storing IAP transaction records.
    
**Namespace:** GlyphWeaver.Backend.IAP.Infrastructure.MongoDB  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/application/interfaces/platform-validator.gateway.interface.ts  
**Description:** Defines a generic interface for a platform-specific IAP validator (e.g., for Apple or Google). This allows the application service to be agnostic of the specific platform being validated.  
**Template:** TypeScript Interface  
**Dependency Level:** 3  
**Name:** IPlatformValidatorGateway  
**Type:** Interface  
**Relative Path:** application/interfaces  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - GatewayPattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** validateReceipt  
**Parameters:**
    
    - receiptData: string
    - sku: string
    
**Return Type:** Promise<{ isValid: boolean; transactionId: string; purchaseDate: Date; rawResponse: any; }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Platform Validation Contract
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To provide a consistent contract for validating receipts, abstracting the differences between Apple's and Google's validation services.  
**Logic Description:** This interface will declare a single method, 'validateReceipt', which takes the platform-specific receipt data and returns a standardized validation result object. This ensures the application service can handle validation for any platform in a uniform way.  
**Documentation:**
    
    - **Summary:** Provides a standardized interface for any platform-specific receipt validation service.
    
**Namespace:** GlyphWeaver.Backend.IAP.Application.Ports  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/application/interfaces/player-service.gateway.interface.ts  
**Description:** Defines the contract for communicating with the external Player Service to grant items to a player's account.  
**Template:** TypeScript Interface  
**Dependency Level:** 3  
**Name:** IPlayerServiceGateway  
**Type:** Interface  
**Relative Path:** application/interfaces  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - GatewayPattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** creditPlayer  
**Parameters:**
    
    - userId: string
    - sku: string
    - transactionId: string
    
**Return Type:** Promise<{ success: boolean; details?: any; }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Player Item Granting Contract
    
**Requirement Ids:**
    
    - REQ-8-017
    
**Purpose:** To abstract the communication with the external Player Service, decoupling the IAP service from the specific implementation details of the Player Service's API.  
**Logic Description:** This interface defines a 'creditPlayer' method. It specifies the necessary parameters (userId, sku, transactionId) to credit a player and the expected success/failure response format.  
**Documentation:**
    
    - **Summary:** Defines the contract for the gateway responsible for communicating with the Player Service to credit purchased items.
    
**Namespace:** GlyphWeaver.Backend.IAP.Application.Ports  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/infrastructure/repositories/mongoose-iap-transaction.repository.ts  
**Description:** Implements the IIAPTransactionRepository interface using Mongoose for MongoDB. It handles all database operations for IAPTransaction documents.  
**Template:** TypeScript Class  
**Dependency Level:** 3  
**Name:** MongooseIAPTransactionRepository  
**Type:** Repository  
**Relative Path:** infrastructure/repositories  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** transactionModel  
**Type:** Model<IAPTransactionDoc>  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** findById  
**Parameters:**
    
    - id: string
    
**Return Type:** Promise<IAPTransaction | null>  
**Attributes:** public  
    - **Name:** findByPlatformTransactionId  
**Parameters:**
    
    - platform: 'ios' | 'android'
    - transactionId: string
    
**Return Type:** Promise<IAPTransaction | null>  
**Attributes:** public  
    - **Name:** save  
**Parameters:**
    
    - transaction: IAPTransaction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** create  
**Parameters:**
    
    - transaction: IAPTransaction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - MongoDB IAP Transaction Persistence
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To provide a concrete implementation for persisting and retrieving IAPTransaction domain objects to and from a MongoDB database.  
**Logic Description:** This class will implement the methods defined in IIAPTransactionRepository. It will use the Mongoose model for IAPTransaction to perform find, save, and update operations. It will also handle the mapping between the domain aggregate and the Mongoose document.  
**Documentation:**
    
    - **Summary:** Handles the persistence of IAPTransaction aggregates in a MongoDB collection using Mongoose.
    
**Namespace:** GlyphWeaver.Backend.IAP.Infrastructure.Repositories  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/gateways/apple-app-store.validator.ts  
**Description:** Implements the IPlatformValidatorGateway for Apple's App Store. This service communicates with Apple's verifyReceipt endpoint.  
**Template:** TypeScript Class  
**Dependency Level:** 4  
**Name:** AppleAppStoreValidator  
**Type:** Service  
**Relative Path:** infrastructure/gateways  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - GatewayPattern
    - AdapterPattern
    
**Members:**
    
    - **Name:** httpClient  
**Type:** AxiosInstance  
**Attributes:** private  
    - **Name:** validationUrl  
**Type:** string  
**Attributes:** private  
    - **Name:** sharedSecret  
**Type:** string  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** validateReceipt  
**Parameters:**
    
    - receiptData: string
    - sku: string
    
**Return Type:** Promise<{ isValid: boolean; transactionId: string; purchaseDate: Date; rawResponse: any; }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Apple IAP Receipt Validation
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To handle the specific logic and network communication required to validate an iOS purchase receipt with Apple's servers.  
**Logic Description:** This class will implement the 'validateReceipt' method. It will construct the required JSON payload for Apple's endpoint, including the receipt-data and password (shared secret). It will use an HTTP client (like axios) to make a secure POST request and parse the JSON response from Apple, handling various status codes and extracting relevant transaction details.  
**Documentation:**
    
    - **Summary:** Communicates with the Apple App Store's verification service to validate iOS purchase receipts.
    
**Namespace:** GlyphWeaver.Backend.IAP.Infrastructure.Gateways  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/infrastructure/gateways/google-play.validator.ts  
**Description:** Implements the IPlatformValidatorGateway for the Google Play Store. This service uses the Google Play Developer API to validate Android purchases.  
**Template:** TypeScript Class  
**Dependency Level:** 4  
**Name:** GooglePlayValidator  
**Type:** Service  
**Relative Path:** infrastructure/gateways  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - GatewayPattern
    - AdapterPattern
    
**Members:**
    
    - **Name:** googleAuth  
**Type:** GoogleAuth  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** validateReceipt  
**Parameters:**
    
    - receiptData: string
    - sku: string
    
**Return Type:** Promise<{ isValid: boolean; transactionId: string; purchaseDate: Date; rawResponse: any; }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Google Play IAP Receipt Validation
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To handle the authentication and API calls necessary to validate an Android purchase receipt with Google's servers.  
**Logic Description:** This class will implement the 'validateReceipt' method. It will use the Google Auth library with service account credentials to authenticate with the Google Play Developer API. It will then call the 'purchases.products.get' endpoint with the package name, product ID (sku), and purchase token (receiptData) to verify the purchase state and consumption state of the transaction.  
**Documentation:**
    
    - **Summary:** Communicates with the Google Play Developer API to validate Android purchase receipts.
    
**Namespace:** GlyphWeaver.Backend.IAP.Infrastructure.Gateways  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/infrastructure/gateways/http-player.service.gateway.ts  
**Description:** Implements the IPlayerServiceGateway interface. It makes secure HTTP calls to the external Player Service to credit items to a player's account.  
**Template:** TypeScript Class  
**Dependency Level:** 4  
**Name:** HttpPlayerServiceGateway  
**Type:** Service  
**Relative Path:** infrastructure/gateways  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - GatewayPattern
    
**Members:**
    
    - **Name:** httpClient  
**Type:** AxiosInstance  
**Attributes:** private  
    - **Name:** playerServiceUrl  
**Type:** string  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** creditPlayer  
**Parameters:**
    
    - userId: string
    - sku: string
    - transactionId: string
    
**Return Type:** Promise<{ success: boolean; details?: any; }>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Player Service Communication
    
**Requirement Ids:**
    
    - REQ-8-017
    
**Purpose:** To provide a concrete implementation for communicating with the Player Service API, handling item crediting after a successful IAP validation.  
**Logic Description:** This class will implement the 'creditPlayer' method. It will use an HTTP client like axios to make a secure POST request to the Player Service's '/credit' endpoint, sending the userId, sku, and transactionId in the payload. It will handle the response to confirm if the crediting was successful.  
**Documentation:**
    
    - **Summary:** Handles making HTTP requests to the external Player Service to fulfill a validated purchase.
    
**Namespace:** GlyphWeaver.Backend.IAP.Infrastructure.Gateways  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/application/services/iap-validation.service.ts  
**Description:** The core application service that orchestrates the entire IAP validation process. It coordinates between the domain, repositories, and external gateways.  
**Template:** TypeScript Class  
**Dependency Level:** 5  
**Name:** IAPValidationService  
**Type:** Service  
**Relative Path:** application/services  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - ServiceLayerPattern
    
**Members:**
    
    - **Name:** transactionRepo  
**Type:** IIAPTransactionRepository  
**Attributes:** private|readonly  
    - **Name:** validatorFactory  
**Type:** PlatformValidatorFactory  
**Attributes:** private|readonly  
    - **Name:** playerServiceGateway  
**Type:** IPlayerServiceGateway  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** validateAndFulfillPurchase  
**Parameters:**
    
    - data: ValidateReceiptDto
    
**Return Type:** Promise<ValidationResult>  
**Attributes:** public  
    
**Implemented Features:**
    
    - IAP Validation Orchestration
    - Transaction Management
    - Purchase Fulfillment Coordination
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    - REQ-8-017
    
**Purpose:** To execute the IAP validation use case, ensuring all steps from receipt validation to item fulfillment are performed correctly and atomically.  
**Logic Description:** This service's main method will orchestrate the flow: 1. Check if the transaction ID has already been processed using the repository. 2. Use a factory to get the correct platform validator (Apple or Google). 3. Call the validator to verify the receipt with the external platform. 4. Create or update the IAPTransaction aggregate with the validation result. 5. If validation is successful, call the Player Service gateway to credit the player. 6. Update the transaction aggregate to a 'fulfilled' state. 7. Persist all state changes via the repository. It will handle errors at each step.  
**Documentation:**
    
    - **Summary:** Orchestrates the complete business logic for validating a purchase receipt, saving the transaction, and coordinating with other services to fulfill the purchase.
    
**Namespace:** GlyphWeaver.Backend.IAP.Application.Services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** src/api/v1/dtos/validate-receipt.dto.ts  
**Description:** Data Transfer Object for the IAP validation request. Defines the expected structure and includes validation decorators (e.g., from class-validator).  
**Template:** TypeScript Class  
**Dependency Level:** 5  
**Name:** ValidateReceiptDto  
**Type:** DTO  
**Relative Path:** api/v1/dtos  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - DataTransferObject
    
**Members:**
    
    - **Name:** receiptData  
**Type:** string  
**Attributes:** public  
    - **Name:** sku  
**Type:** string  
**Attributes:** public  
    - **Name:** platform  
**Type:** 'ios' | 'android'  
**Attributes:** public  
    - **Name:** userId  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Request Data Contract
    - Input Validation
    
**Requirement Ids:**
    
    - REQ-8-013
    
**Purpose:** To define a clear and validated contract for the data the client must send when requesting a purchase validation.  
**Logic Description:** This is a simple class with properties for the receipt data, sku, platform, and userId. It will use decorators from a library like 'class-validator' (@IsString, @IsNotEmpty, @IsIn(['ios', 'android'])) to ensure incoming request data is well-formed before being processed by the service.  
**Documentation:**
    
    - **Summary:** Defines the shape and validation rules for the incoming IAP validation request payload.
    
**Namespace:** GlyphWeaver.Backend.IAP.API.V1.DTOs  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/api/v1/controllers/iap.controller.ts  
**Description:** The Express.js controller for handling all IAP-related HTTP requests. It receives requests, uses DTOs for validation, calls the application service, and formats the HTTP response.  
**Template:** Express.js Controller  
**Dependency Level:** 6  
**Name:** IAPController  
**Type:** Controller  
**Relative Path:** api/v1/controllers  
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    - ModelViewController
    
**Members:**
    
    - **Name:** iapValidationService  
**Type:** IAPValidationService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** validatePurchase  
**Parameters:**
    
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - HTTP Request Handling
    - API Endpoint Definition
    
**Requirement Ids:**
    
    - REQ-8-013
    - REQ-SEC-008
    
**Purpose:** To expose the IAP validation functionality as a secure RESTful API endpoint, serving as the bridge between the web and the application layer.  
**Logic Description:** This controller will define a route handler for 'POST /api/v1/iap/validate'. The handler will instantiate the ValidateReceiptDto with the request body, trigger validation, and then call the 'iapValidationService.validateAndFulfillPurchase' method. It will map the service result to an appropriate HTTP status code (200 for success, 400 for bad request, 500 for server error) and JSON response.  
**Documentation:**
    
    - **Summary:** Handles HTTP requests for the IAP validation endpoint, validates input, and delegates business logic to the application service.
    
**Namespace:** GlyphWeaver.Backend.IAP.API.V1.Controllers  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** src/index.ts  
**Description:** The main entry point for the IAP Validation microservice. It initializes the Express server, sets up middleware, connects to the database, and starts listening for requests.  
**Template:** Node.js Entrypoint  
**Dependency Level:** 7  
**Name:** index  
**Type:** Application  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-IAP  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Application Bootstrap
    
**Requirement Ids:**
    
    
**Purpose:** To bootstrap and run the entire microservice.  
**Logic Description:** This file will: 1. Import the application configuration. 2. Create an instance of the Express app. 3. Configure essential middleware (e.g., json body-parser, cors, security headers with helmet, logging). 4. Establish the connection to MongoDB. 5. Set up the API routes by wiring up the IAPController. 6. Implement a global error handling middleware. 7. Start the server to listen on the configured port.  
**Documentation:**
    
    - **Summary:** The bootstrap file that initializes and starts the Node.js Express application.
    
**Namespace:** GlyphWeaver.Backend.IAP  
**Metadata:**
    
    - **Category:** Application
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  - MONGO_URI
  


---

