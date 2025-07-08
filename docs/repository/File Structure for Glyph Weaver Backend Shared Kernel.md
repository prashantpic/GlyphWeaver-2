# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the NPM package, its name (@glyph-weaver/shared-kernel), version, dependencies (e.g., mongoose, winston), main entry point, and scripts for building and publishing the shared library.  
**Template:** NPM package.json Template  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** ../  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Package Definition
    
**Requirement Ids:**
    
    
**Purpose:** To manage project metadata, dependencies, and scripts for the shared kernel library.  
**Logic Description:** This file will list 'mongoose', 'winston', and 'dotenv' as dependencies. The 'main' field will point to 'dist/index.js' and the 'types' field will point to 'dist/index.d.ts'. It will include scripts for 'build' (using tsc), 'lint', and 'test'.  
**Documentation:**
    
    - **Summary:** Standard NPM configuration file that makes this project a distributable package. It lists all external dependencies required for the shared library to function.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration for the shared library. It specifies the target ECMAScript version, module system, output directory ('dist'), strict type-checking options, and declaration file generation.  
**Template:** TypeScript tsconfig.json Template  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** ../  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Configuration
    
**Requirement Ids:**
    
    
**Purpose:** To configure how the TypeScript compiler transpiles the project's .ts files into JavaScript, ensuring compatibility and type safety.  
**Logic Description:** The configuration will set 'target' to 'ES2020', 'module' to 'CommonJS', 'outDir' to './dist', and enable 'declaration' to generate .d.ts files for consumers of the package. It will also enable strict mode and other best-practice compiler options.  
**Documentation:**
    
    - **Summary:** Defines the rules and settings for the TypeScript compiler, which is essential for building the distributable JavaScript and type definition files from the TypeScript source.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/index.ts  
**Description:** The main entry point of the shared kernel package. It exports all public-facing modules, interfaces, classes, and utilities, providing a single, clean import path for consuming services.  
**Template:** TypeScript Barrel File Template  
**Dependency Level:** 3  
**Name:** index  
**Type:** Entrypoint  
**Relative Path:**   
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    - Facade
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Public Module Export
    
**Requirement Ids:**
    
    
**Purpose:** To aggregate and expose all shared components, making them easily accessible to other backend microservices that install this package.  
**Logic Description:** This file will contain a series of 'export * from ...' statements for each public module, including './domain/BaseSchema', './infrastructure/logging/Logger', './errors/ApiError' and its subclasses, './errors/errorHandler', and all DTOs from './common/dtos'.  
**Documentation:**
    
    - **Summary:** Acts as the public API surface for the shared kernel library. Consuming services import shared functionality from this single file.
    
**Namespace:** @glyph-weaver/shared-kernel  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/domain/BaseSchema.ts  
**Description:** Defines a base Mongoose schema configuration that includes common, versioned fields like 'createdAt' and 'updatedAt'. Other microservices will extend this to create their specific data models, ensuring consistency.  
**Template:** TypeScript Mongoose Schema Template  
**Dependency Level:** 1  
**Name:** BaseSchema  
**Type:** SchemaDefinition  
**Relative Path:** domain  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** baseSchemaDefinition  
**Type:** SchemaDefinitionType  
**Attributes:** public|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Consistent Timestamps
    - Data Model Versioning Foundation
    
**Requirement Ids:**
    
    - REQ-8-004
    
**Purpose:** To provide a consistent, foundational schema with timestamps for all MongoDB documents across the backend ecosystem, satisfying REQ-8-004.  
**Logic Description:** This file defines a Mongoose SchemaDefinition object. It will not be a full schema, but an object containing common fields. It will include 'createdAt' and 'updatedAt' fields, managed automatically by Mongoose's 'timestamps: true' option. It will also include a 'schemaVersion' field to support data migrations.  
**Documentation:**
    
    - **Summary:** Provides a reusable base definition for Mongoose schemas, enforcing the inclusion of creation and update timestamps and a schema version number on all data models.
    
**Namespace:** @glyph-weaver/shared-kernel/domain  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/logging/Logger.ts  
**Description:** Creates and configures a standardized Winston logger instance for use across all backend services. It defines logging levels, formats (e.g., JSON for production, console-friendly for development), and transports.  
**Template:** TypeScript Utility Template  
**Dependency Level:** 1  
**Name:** Logger  
**Type:** Utility  
**Relative Path:** infrastructure/logging  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    - Singleton
    
**Members:**
    
    - **Name:** logger  
**Type:** winston.Logger  
**Attributes:** public|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Centralized Logging Configuration
    - Environment-specific Logging Formats
    
**Requirement Ids:**
    
    - REQ-8-021
    
**Purpose:** To provide a consistent, pre-configured logging utility to all backend services, ensuring that logs are structured and comprehensive as required by REQ-8-021.  
**Logic Description:** This file will import Winston. It will check the 'NODE_ENV' environment variable. If 'production', it will create a logger that outputs JSON-formatted logs. If 'development', it will create a logger with a simple, colorized console format. The configured logger instance is then exported.  
**Documentation:**
    
    - **Summary:** Exports a ready-to-use Winston logger. Services import this logger to write standardized logs without needing to configure Winston themselves.
    
**Namespace:** @glyph-weaver/shared-kernel/infrastructure/logging  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/infrastructure/database/DbConnection.ts  
**Description:** Manages the connection to the MongoDB database. It provides a singleton function to connect to the database using the connection string from environment variables, handling connection events and errors centrally.  
**Template:** TypeScript Database Connection Template  
**Dependency Level:** 2  
**Name:** DbConnection  
**Type:** Utility  
**Relative Path:** infrastructure/database  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    - Singleton
    
**Members:**
    
    
**Methods:**
    
    - **Name:** connect  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - Centralized Database Connection Logic
    
**Requirement Ids:**
    
    
**Purpose:** To abstract and centralize the logic for connecting to MongoDB, preventing boilerplate code in every microservice.  
**Logic Description:** This file will import Mongoose and the shared logger. The 'connect' function will read the 'MONGO_URI' from environment variables. It will then call 'mongoose.connect' with appropriate options. It will log successful connections, and log and re-throw connection errors for the application to handle.  
**Documentation:**
    
    - **Summary:** Provides a single, reusable function to establish the application's connection to the MongoDB database, handling logging and basic error management.
    
**Namespace:** @glyph-weaver/shared-kernel/infrastructure/database  
**Metadata:**
    
    - **Category:** Infrastructure
    
- **Path:** src/errors/ApiError.ts  
**Description:** Defines a custom, abstract base error class 'ApiError' that all other specific HTTP errors will extend. It standardizes the structure of errors to include an HTTP status code and a serializable format.  
**Template:** TypeScript Class Template  
**Dependency Level:** 0  
**Name:** ApiError  
**Type:** Class  
**Relative Path:** errors  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** statusCode  
**Type:** number  
**Attributes:** public|readonly  
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - message: string
    - statusCode: number
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** serializeErrors  
**Parameters:**
    
    
**Return Type:** { message: string; field?: string }[]  
**Attributes:** public|abstract  
    
**Implemented Features:**
    
    - Standardized Error Structure
    
**Requirement Ids:**
    
    - REQ-8-021
    
**Purpose:** To create a predictable, consistent structure for all application-level errors that will be sent to the client.  
**Logic Description:** This abstract class will extend the built-in 'Error' class. The constructor will accept a message and a status code. It will define an abstract method 'serializeErrors' which subclasses must implement to return a standardized error object array.  
**Documentation:**
    
    - **Summary:** The base class for creating consistent, serializable HTTP-aware errors throughout the backend services.
    
**Namespace:** @glyph-weaver/shared-kernel/errors  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/errors/BadRequestError.ts  
**Description:** Defines a 'BadRequestError' class for handling HTTP 400 Bad Request scenarios, such as validation failures. It extends the base 'ApiError' class.  
**Template:** TypeScript Class Template  
**Dependency Level:** 1  
**Name:** BadRequestError  
**Type:** Class  
**Relative Path:** errors  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    - message: string
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** serializeErrors  
**Parameters:**
    
    
**Return Type:** { message: string; field?: string }[]  
**Attributes:** public  
    
**Implemented Features:**
    
    - Specific HTTP 400 Error Handling
    
**Requirement Ids:**
    
    - REQ-8-021
    
**Purpose:** To provide a specific, reusable error type for client-side input errors.  
**Logic Description:** This class extends 'ApiError'. The constructor calls the parent constructor with a hardcoded status code of 400. The 'serializeErrors' method returns an array containing an object with the error message.  
**Documentation:**
    
    - **Summary:** A concrete implementation of ApiError for representing HTTP 400 Bad Request errors.
    
**Namespace:** @glyph-weaver/shared-kernel/errors  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/errors/NotFoundError.ts  
**Description:** Defines a 'NotFoundError' class for handling HTTP 404 Not Found scenarios, used when a requested resource does not exist. It extends the base 'ApiError' class.  
**Template:** TypeScript Class Template  
**Dependency Level:** 1  
**Name:** NotFoundError  
**Type:** Class  
**Relative Path:** errors  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** constructor  
**Parameters:**
    
    
**Return Type:** void  
**Attributes:** public  
    - **Name:** serializeErrors  
**Parameters:**
    
    
**Return Type:** { message: string; field?: string }[]  
**Attributes:** public  
    
**Implemented Features:**
    
    - Specific HTTP 404 Error Handling
    
**Requirement Ids:**
    
    - REQ-8-021
    
**Purpose:** To provide a specific, reusable error type for when a resource cannot be found.  
**Logic Description:** This class extends 'ApiError'. The constructor calls the parent constructor with a message like 'Not Found' and a hardcoded status code of 404. The 'serializeErrors' method returns an array containing an object with the error message.  
**Documentation:**
    
    - **Summary:** A concrete implementation of ApiError for representing HTTP 404 Not Found errors.
    
**Namespace:** @glyph-weaver/shared-kernel/errors  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/errors/errorHandler.ts  
**Description:** An Express.js middleware function that acts as a global error handler. It catches instances of 'ApiError' and other errors, logs them, and sends a standardized JSON error response to the client.  
**Template:** TypeScript Middleware Template  
**Dependency Level:** 2  
**Name:** errorHandler  
**Type:** Middleware  
**Relative Path:** errors  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** errorHandler  
**Parameters:**
    
    - err: Error
    - req: Request
    - res: Response
    - next: NextFunction
    
**Return Type:** Response  
**Attributes:** public  
    
**Implemented Features:**
    
    - Centralized Error Handling
    - Standardized Error Response Formatting
    
**Requirement Ids:**
    
    - REQ-8-021
    
**Purpose:** To ensure all application errors are handled consistently, logged, and formatted correctly for API consumers, preventing stack traces from leaking to clients.  
**Logic Description:** This function will be an Express middleware. It checks if the incoming 'err' is an instance of 'ApiError'. If so, it uses the error's status code and 'serializeErrors' method to craft the response. If not, it logs the unexpected error and returns a generic 500 Internal Server Error response. It uses the shared logger to log the error details.  
**Documentation:**
    
    - **Summary:** Provides a global error handling middleware for Express.js applications. It intercepts errors, logs them, and sends a structured JSON response to the client.
    
**Namespace:** @glyph-weaver/shared-kernel/errors  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** src/common/dtos/PagedResult.dto.ts  
**Description:** Defines a generic Data Transfer Object (DTO) class for returning paginated data from API endpoints. It includes properties for the data array, total count, current page, and page size.  
**Template:** TypeScript DTO Template  
**Dependency Level:** 0  
**Name:** PagedResultDto  
**Type:** DTO  
**Relative Path:** common/dtos  
**Repository Id:** REPO-GLYPH-SHARED-LIBS-BACKEND  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** items  
**Type:** T[]  
**Attributes:** public  
    - **Name:** totalCount  
**Type:** number  
**Attributes:** public  
    - **Name:** page  
**Type:** number  
**Attributes:** public  
    - **Name:** pageSize  
**Type:** number  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Standardized Pagination Response
    
**Requirement Ids:**
    
    
**Purpose:** To provide a consistent structure for all API endpoints that return lists of data, simplifying client-side handling of pagination.  
**Logic Description:** This will be a generic TypeScript class 'PagedResultDto<T>'. It will define public properties for 'items' (an array of type T), 'totalCount', 'page', and 'pageSize', all typed as numbers. This standardizes how paginated results are sent from any service.  
**Documentation:**
    
    - **Summary:** A generic DTO representing a single page of results from a paginated query, including the data and metadata about the pagination state.
    
**Namespace:** @glyph-weaver/shared-kernel/common/dtos  
**Metadata:**
    
    - **Category:** Contracts
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  - MONGO_URI
  


---

