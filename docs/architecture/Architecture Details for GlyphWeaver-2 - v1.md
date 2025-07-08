# Architecture Design Specification

# 1. Style
LayeredArchitecture


---

# 2. Patterns

## 2.1. Client-Server Architecture
Separates the system into client (mobile app) and server (backend API) components, enabling distributed functionality and centralized data management.

### 2.1.3. Benefits

- Centralized data and logic on the server.
- Scalability of server resources.
- Clients can be developed independently for different platforms (iOS, Android).

### 2.1.4. Tradeoffs

- Network latency can affect performance.
- Requires managing communication protocols.
- Complexity in maintaining state across client and server.

## 2.2. Model-View-Controller (MVC) / Model-View-Presenter (MVP) / Model-View-ViewModel (MVVM)
Architectural patterns for organizing the user interface and application logic in the mobile client, promoting separation of concerns.

### 2.2.3. Benefits

- Improved testability of UI logic.
- Better separation between UI rendering and application state/logic.
- Enhanced maintainability and code organization.

### 2.2.4. Applicability

- **Scenarios:**
  
  - Mobile application UI development.
  

## 2.3. Repository Pattern
Mediates between the domain and data mapping layers (both client-side local storage and server-side database access) using a collection-like interface for accessing domain objects.

### 2.3.3. Benefits

- Decouples business logic from data access concerns.
- Improves testability by allowing mocking of data repositories.
- Centralizes data access logic.

## 2.4. Service Layer Pattern (Application Services)
Defines an application's boundary with a layer of services that establishes a set of available operations and coordinates the application's response in each operation.

### 2.4.3. Benefits

- Encapsulates business logic specific to use cases.
- Provides a clear API for the presentation layer or other clients.
- Promotes reusability of application logic.

## 2.5. Dependency Injection (DI)
A design pattern in which an object or function receives other objects or functions that it depends on, promoting loose coupling.

### 2.5.3. Benefits

- Increased modularity and flexibility.
- Improved testability by allowing dependencies to be mocked.
- Reduced boilerplate code for dependency management.

## 2.6. Domain-Driven Design (DDD) Principles
An approach to software development that centers the development on programming a domain model that has a rich understanding of the processes and rules of a domain.

### 2.6.3. Benefits

- Aligns software with business requirements.
- Creates a ubiquitous language shared by developers and domain experts.
- Manages complexity in large, domain-heavy applications.

## 2.7. Observer Pattern
A behavioral design pattern where an object, named the subject, maintains a list of its dependents, called observers, and notifies them automatically of any state changes.

### 2.7.3. Benefits

- Loose coupling between subjects and observers.
- Dynamic relationships between objects.
- Supports event-driven interactions within the client.

### 2.7.4. Applicability

- **Scenarios:**
  
  - Game event notifications (e.g., glyph connection, level completion).
  - UI updates in response to data changes.
  

## 2.8. Strategy Pattern
Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

### 2.8.3. Benefits

- Flexibility to change or add new algorithms (e.g., puzzle types, difficulty scaling).
- Avoids conditional statements for selecting behavior.

### 2.8.4. Applicability

- **Scenarios:**
  
  - Implementing different puzzle mechanics.
  - Handling various obstacle behaviors.
  

## 2.9. Procedural Generation (Template-Driven)
Algorithmically creating game content (levels) based on templates and configurable parameters, rather than manually.

### 2.9.3. Benefits

- High replayability with unique levels.
- Reduced manual content creation effort for endless modes.
- Scalable content generation.

### 2.9.4. Applicability

- **Scenarios:**
  
  - Generating new levels after hand-crafted ones are completed (REQ-CGLE-008).
  



---

# 3. Layers

## 3.1. Mobile Client - Presentation Layer
Handles user interface rendering, user input, and visual feedback on iOS and Android devices. This layer is responsible for everything the player sees and interacts with directly.

### 3.1.4. Technologystack
Unity Engine (C#) with UI Toolkit/UGUI, or Native (iOS: Swift/SwiftUI/UIKit; Android: Kotlin/Jetpack Compose/XML)

### 3.1.5. Language
C# or Swift/Kotlin

### 3.1.6. Type
Presentation

### 3.1.7. Responsibilities

- Render game grid, glyphs, paths, and obstacles.
- Display Main Menu, Level Selection, In-Game HUD, Store, Settings, Leaderboards.
- Process player input (swipes for path drawing, taps for Catalysts and UI elements).
- Provide visual and auditory feedback for actions (path connection, invalid moves, level completion).
- Implement interactive tutorials and display level objectives.
- Support accessibility features in UI rendering (e.g., colorblind patterns, adjustable text size).

### 3.1.8. Components

- MainMenuScreenView
- LevelSelectionView
- GameplayView (HUD, GridRenderer, PathRenderer, GlyphRenderer)
- StoreView
- SettingsView
- LeaderboardView
- TutorialView
- InputHandlerComponent
- FeedbackAnimator

### 3.1.9. Interfaces

### 3.1.9.1. IGameplayInputListener
#### 3.1.9.1.2. Type
Interface

#### 3.1.9.1.3. Operations

- OnSwipe(startCell, endCell)
- OnTap(cell)

### 3.1.9.2. IUIView
#### 3.1.9.2.2. Type
Interface

#### 3.1.9.2.3. Operations

- Show()
- Hide()
- UpdateData(data)


### 3.1.10. Dependencies

- **Layer Id:** mobile-client-application-services  
**Type:** Required  

## 3.2. Mobile Client - Application Services Layer
Orchestrates client-side application logic, manages game flow, and handles use cases by coordinating domain logic and infrastructure services.

### 3.2.4. Technologystack
C# (Unity) or Swift/Kotlin (Native)

### 3.2.5. Language
C# or Swift/Kotlin

### 3.2.6. Type
ApplicationServices

### 3.2.7. Responsibilities

- Manage game sessions (start, pause, resume, end level).
- Load and initialize level data (hand-crafted or procedural).
- Process player moves and validate them against puzzle rules.
- Manage undo/redo functionality and hint system logic.
- Handle Catalyst glyph interaction timing and reward logic.
- Coordinate with IAP service for purchases and item grants.
- Track tutorial progression and skip status.
- Interface with platform services for login, achievements, leaderboards, cloud save.
- Relay analytics events to the analytics service.

### 3.2.8. Components

- GameSessionManager
- LevelOrchestratorService
- PlayerActionService (handles moves, undo, hint requests)
- IAPOrchestrationService (client-side flow)
- TutorialProgressionManager
- PlatformServiceCoordinator (facade for GameCenter/PlayGames)

### 3.2.9. Dependencies

- **Layer Id:** mobile-client-domain-logic  
**Type:** Required  
- **Layer Id:** mobile-client-infrastructure  
**Type:** Required  

## 3.3. Mobile Client - Domain Logic Layer
Contains the core game logic, entities, rules, and algorithms. This layer is the heart of the gameplay mechanics.

### 3.3.4. Technologystack
C# (Unity) or Swift/Kotlin (Native)

### 3.3.5. Language
C# or Swift/Kotlin

### 3.3.6. Type
BusinessLogic

### 3.3.7. Responsibilities

- Define game entities (Level, Zone, Glyph, Path, Obstacle).
- Implement rules for Path Puzzles, Sequence Puzzles, Color Match Puzzles, Constraint Puzzles.
- Define behavior of Blocker Stones and Shifting Tiles (including movement patterns).
- Implement logic for Catalyst, Mirror, and Linked Glyphs.
- Implement procedural level generation algorithms (based on templates and parameters).
- Calculate scores and determine win/loss conditions.
- Validate solution paths for generated levels.
- Manage time/move limits.

### 3.3.8. Components

- LevelDefinition
- GlyphDefinition
- ObstacleDefinition
- PuzzleRuleEngine (with strategies for different puzzle types)
- PathValidator
- ProceduralLevelGenerator
- ScoreCalculator
- WinLossConditionEvaluator
- GridManager

### 3.3.9. Dependencies


## 3.4. Mobile Client - Infrastructure & Integration Layer
Handles external concerns such as data persistence, network communication, platform-specific integrations, and device hardware access.

### 3.4.4. Technologystack
C# (Unity with relevant plugins/SDKs) or Native (Swift/Kotlin with platform SDKs), SQLite

### 3.4.5. Language
C# or Swift/Kotlin

### 3.4.6. Type
Infrastructure

### 3.4.7. Responsibilities

- Persist player progress, settings, and unlocked content locally (e.g., using SQLite or PlayerPrefs).
- Communicate with the backend API (RESTful calls for scores, IAP validation, player data sync).
- Integrate with Apple Game Center and Google Play Games Services (authentication, achievements, leaderboards, cloud save).
- Handle In-App Purchases via StoreKit (iOS) and Google Play Billing Library (Android).
- Manage audio playback for background music and sound effects.
- Collect and send analytics data to the analytics backend.
- Implement crash reporting.
- Manage localization resources.
- Implement accessibility features (screen reader integration, alternative input methods).

### 3.4.8. Components

- LocalDataRepository (e.g., PlayerProgressRepository, SettingsRepository)
- BackendAPIClient (handles HTTP requests and DTOs)
- PlatformAuthenticationService
- PlatformSocialService (leaderboards, achievements)
- PlatformIAPService
- PlatformCloudSaveService
- AudioManager
- AnalyticsTrackerClient
- CrashReporterClient
- LocalizationProvider
- AccessibilityServiceAdapter

### 3.4.9. Dependencies

- **Layer Id:** backend-service-api-presentation  
**Type:** Optional  

## 3.5. Backend Service - API Presentation Layer
Exposes the backend functionalities as RESTful API endpoints, handling incoming requests, routing them to appropriate services, and formatting responses.

### 3.5.4. Technologystack
Node.js (Latest LTS), Express.js (Latest stable)

### 3.5.5. Language
JavaScript/TypeScript

### 3.5.6. Type
Presentation

### 3.5.7. Responsibilities

- Define and implement RESTful API endpoints (e.g., for player authentication, score submission, IAP validation, data sync).
- Handle HTTP request parsing and basic input validation (e.g., DTO validation).
- Serialize responses into JSON format.
- Implement API versioning.
- Provide Swagger/OpenAPI documentation for all endpoints (REQ-8-003).

### 3.5.8. Components

- PlayerAuthController
- LeaderboardController
- IAPValidationController
- PlayerDataSyncController
- ProceduralLevelDataController
- AnalyticsIngestionController
- AdminOperationsController
- RequestValidationMiddleware

### 3.5.9. Dependencies

- **Layer Id:** backend-service-application-services  
**Type:** Required  

## 3.6. Backend Service - Application Services Layer
Contains the core business logic for backend operations, orchestrating domain entities and data access to fulfill use cases initiated via the API.

### 3.6.4. Technologystack
Node.js (Latest LTS)

### 3.6.5. Language
JavaScript/TypeScript

### 3.6.6. Type
ApplicationServices

### 3.6.7. Responsibilities

- Implement logic for player account management (if custom accounts are used).
- Process and validate score submissions, applying cheat detection rules.
- Manage global and event-based leaderboards (ranking, tie-breaking).
- Validate In-App Purchase receipts with platform providers (Apple/Google).
- Manage synchronization of player data (e.g., virtual currency, server-authoritative consumables).
- Store and retrieve procedural level generation seeds and parameters.
- Ingest and process analytics data from clients.
- Handle administrative tasks (e.g., managing game configurations, user support requests).

### 3.6.8. Components

- AuthenticationService
- LeaderboardManagementService
- IAPReceiptValidationService
- PlayerDataService
- ProceduralLevelSeedService
- AnalyticsProcessingService
- CheatDetectionService
- AdminActionService

### 3.6.9. Dependencies

- **Layer Id:** backend-service-domain-logic  
**Type:** Required  
- **Layer Id:** backend-service-data-access  
**Type:** Required  
- **Layer Id:** backend-service-infrastructure  
**Type:** Optional  

## 3.7. Backend Service - Domain Logic Layer
Defines backend-specific domain entities, value objects, and their intrinsic business rules and logic, primarily using Mongoose schemas.

### 3.7.4. Technologystack
Node.js (Latest LTS), Mongoose (Latest stable)

### 3.7.5. Language
JavaScript/TypeScript

### 3.7.6. Type
BusinessLogic

### 3.7.7. Responsibilities

- Define data schemas for PlayerProfile, LevelProgress, Scores, IAPInventory, VirtualCurrency, LeaderboardEntries, etc. (REQ-8-004).
- Implement validation rules within Mongoose schemas.
- Encapsulate domain-specific logic related to these entities (e.g., how scores are aggregated, how currency is debited/credited).
- Define relationships between domain entities.

### 3.7.8. Components

- PlayerProfileSchema (Mongoose Model)
- ScoreSchema (Mongoose Model)
- IAPTransactionSchema (Mongoose Model)
- LeaderboardEntrySchema (Mongoose Model)
- VirtualCurrencyLogic
- GameConfigurationModel

### 3.7.9. Dependencies


## 3.8. Backend Service - Data Access Layer
Manages all interactions with the MongoDB database, abstracting database operations from the application services layer using repositories.

### 3.8.4. Technologystack
Node.js (Latest LTS), Mongoose (Latest stable), MongoDB (Latest stable)

### 3.8.5. Language
JavaScript/TypeScript

### 3.8.6. Type
DataAccess

### 3.8.7. Responsibilities

- Implement CRUD (Create, Read, Update, Delete) operations for all domain entities.
- Execute complex queries for leaderboards, player data retrieval, etc.
- Manage database connections and transactions (if applicable with MongoDB specific patterns).
- Utilize Mongoose ODM for object-data mapping and schema enforcement.
- Implement database indexing strategies for performance (REQ-SCF-012, REQ-8-015).

### 3.8.8. Components

- PlayerRepository
- ScoreRepository
- IAPTransactionRepository
- LeaderboardRepository
- ProceduralLevelDataRepository
- AuditLogRepository
- GameConfigurationRepository

### 3.8.9. Dependencies

- **Layer Id:** backend-service-domain-logic  
**Type:** Required  

## 3.9. Backend Service - Infrastructure & Integration Layer
Handles communication with external third-party services, manages configurations, and provides common utilities for the backend.

### 3.9.4. Technologystack
Node.js (Latest LTS), Cloud Platform SDKs (AWS, GCP, Azure), Redis (Optional for Caching)

### 3.9.5. Language
JavaScript/TypeScript

### 3.9.6. Type
Infrastructure

### 3.9.7. Responsibilities

- Integrate with Apple App Store and Google Play Store validation servers for IAP receipts (REQ-8-013, REQ-SEC-008).
- Manage secure storage and retrieval of API keys, database credentials, and other secrets (REQ-8-012, REQ-SEC-002).
- Implement caching strategies (e.g., Redis for leaderboards REQ-SCF-012).
- Handle deployment automation (CI/CD pipeline integration REQ-8-008).
- Provide utilities for tasks like date/time manipulation, string formatting.
- Manage message queue integration if used for asynchronous tasks (REQ-8-028).

### 3.9.8. Components

- PlatformIAPValidatorClient
- SecretManagementService
- CacheService (e.g., RedisClientWrapper)
- ConfigurationProvider
- ExternalAPIConsumer

### 3.9.9. Dependencies


## 3.10. System-Wide Security Layer
Encompasses security measures across both client and backend, including authentication, authorization, data protection, and threat mitigation.

### 3.10.4. Technologystack
HTTPS/TLS, JWT, OAuth (for platform services), bcrypt/scrypt, Platform-specific security features, Server-side validation logic

### 3.10.5. Language
N/A (Concept spanning multiple languages/tech)

### 3.10.6. Type
Security

### 3.10.7. Responsibilities

- Ensure secure communication (HTTPS/TLS) between client and backend (REQ-SEC-001, REQ-8-011).
- Implement client-side authentication with platform services (Game Center, Google Play Games).
- Implement backend API authentication and authorization (e.g., using JWTs or session tokens).
- Validate In-App Purchase receipts securely on the server-side (REQ-SEC-008, REQ-8-013).
- Implement server-side validation for score submissions to prevent cheating (REQ-SEC-005, REQ-8-014).
- Protect against common web vulnerabilities (XSS, CSRF, SQLi - though NoSQL here) on backend APIs.
- Securely manage API keys, secrets, and credentials (REQ-SEC-002, REQ-8-012).
- Handle PII according to privacy policies and regulations (data encryption at rest and in transit) (REQ-SEC-010).
- Implement rate limiting on APIs (REQ-SEC-006).

### 3.10.8. Components

- ClientAuthHandler (integrates with platform SDKs)
- BackendAuthMiddleware (validates tokens)
- SecureCredentialStorage (backend)
- IAPReceiptValidator (server-side component)
- ScoreValidationEngine (server-side component)
- DataEncryptionUtility (client & server for sensitive data)

### 3.10.9. Dependencies


## 3.11. System-Wide Cross-Cutting Concerns
Addresses concerns that span multiple layers and components, such as logging, monitoring, configuration, error handling, and localization.

### 3.11.4. Technologystack
Logging frameworks (e.g., Winston for Node.js, platform-native for client), APM tools (e.g., Prometheus, New Relic), Analytics SDKs (e.g., Firebase Analytics), Crash Reporting SDKs (e.g., Firebase Crashlytics), Localization frameworks (e.g., Unity Localization, i18next).

### 3.11.5. Language
N/A (Concept spanning multiple languages/tech)

### 3.11.6. Type
CrossCutting

### 3.11.7. Responsibilities

- Provide comprehensive logging on both client and backend (REQ-AMOT-006, REQ-8-021).
- Implement client-side performance monitoring (FPS, memory) and crash reporting (REQ-AMOT-004, REQ-AMOT-006).
- Implement backend Application Performance Monitoring (APM) and alerting (REQ-AMOT-005, REQ-AMOT-008, REQ-8-020).
- Manage application configuration (client settings, backend feature flags) (REQ-8-023).
- Standardize error handling and reporting mechanisms.
- Support localization of UI text and assets on the client (REQ-GF-001, REQ-UIUX-015).
- Track and log analytics events for user behavior analysis (REQ-AMOT-001, REQ-AMOT-002, REQ-AMOT-003).
- Implement audit logging for critical backend operations (REQ-SEC-019, REQ-8-019, REQ-8-016).

### 3.11.8. Components

- ClientLogger
- BackendLogger (e.g., integrated with ELK/CloudWatch)
- ClientPerformanceMonitor
- BackendAPMClient
- ClientCrashReporterAgent
- ConfigurationManager (client & backend)
- GlobalErrorHandler
- LocalizationService (client)
- AnalyticsService (client & backend ingestion point)
- AuditLoggingService (backend)

### 3.11.9. Dependencies




---

# 4. Quality Attributes

## 4.1. Performance
Ensuring responsive gameplay on client and fast API responses from backend.

### 4.1.3. Metrics

- Client FPS > 30
- Level Load Time < 3s
- Backend API P95 < 500ms (REQ-8-005)

### 4.1.4. Tactics

- Optimized rendering and algorithms on client (Unity performance best practices)
- Efficient database queries and indexing (MongoDB)
- Backend caching for frequently accessed data (e.g., leaderboards using Redis)
- Asynchronous processing for non-critical backend tasks (REQ-8-028 consideration)

## 4.2. Scalability
Ability of the backend to handle a growing number of concurrent users and data.

### 4.2.3. Metrics

- Support [TBD_Concurrent_Users_Number] users (REQ-8-006)
- Maintain performance under increasing load

### 4.2.4. Tactics

- Stateless backend services
- Horizontal scaling of backend application servers (Node.js instances)
- MongoDB replica sets and sharding (if necessary)
- Efficient load balancing
- Connection pooling for database

## 4.3. Reliability / Availability
Ensuring the system is operational and data is durable.

### 4.3.3. Metrics

- Backend uptime > 99.9% (REQ-8-007)
- RTO < 4h, RPO < 24h (REQ-8-025)

### 4.3.4. Tactics

- Redundant backend infrastructure (multiple instances, availability zones)
- Automated database backups (MongoDB daily full, frequent incremental - REQ-8-024)
- Robust error handling and graceful degradation
- Disaster Recovery plan and regular testing (REQ-8-025)
- Client-side offline capabilities with local data persistence (REQ-PDP-008)

## 4.4. Security
Protecting user data, preventing unauthorized access, and ensuring fair gameplay.

### 4.4.3. Metrics

- Compliance with data privacy regulations (GDPR, CCPA - REQ-SEC-014)
- No critical vulnerabilities found in penetration tests (REQ-SEC-003 consideration)
- Secure IAP validation

### 4.4.4. Tactics

- HTTPS/TLS for all client-server communication
- Server-side validation of all critical operations (scores, IAPs)
- Secure credential management (no hardcoding secrets)
- Regular security audits and code reviews
- Input validation and sanitization
- Role-Based Access Control (RBAC) for admin interfaces (REQ-AMOT-009)
- Audit logging for sensitive operations

## 4.5. Maintainability
Ease of modifying, fixing, and enhancing the system.

### 4.5.3. Metrics

- Code complexity (e.g., cyclomatic complexity)
- Time to implement new features
- Bug fix turnaround time

### 4.5.4. Tactics

- Layered architecture with clear separation of concerns
- Modular design (client and backend components)
- Consistent coding standards and naming conventions
- Comprehensive API documentation (Swagger/OpenAPI - REQ-8-003)
- Automated testing (unit, integration)
- Well-documented code
- CI/CD pipeline for automated builds and deployments (REQ-8-008)

## 4.6. Extensibility
Ability to add new features, puzzle types, levels, and IAP items with minimal impact.

### 4.6.3. Metrics

- Effort to add a new puzzle mechanic
- Effort to integrate a new third-party service

### 4.6.4. Tactics

- Data-driven design for levels and game content
- Use of design patterns like Strategy for varying behaviors (e.g., puzzle types)
- Abstract interfaces for services and components
- Configuration-driven features (e.g., remote config for events - REQ-8-023)
- Versioned APIs

## 4.7. Accessibility
Ensuring the game is usable by players with diverse abilities.

### 4.7.3. Metrics

- Conformance with WCAG 2.1 Level AA for mobile (REQ-ACC-008)
- Availability of all specified accessibility features

### 4.7.4. Tactics

- Implementation of colorblind modes (patterns/shapes - REQ-ACC-002)
- Adjustable text size (REQ-ACC-003)
- Reduced motion option (REQ-ACC-006)
- Screen reader compatibility (REQ-ACC-004)
- Alternative input mechanisms (REQ-ACC-007)
- Sufficient touch target sizes (REQ-ACC-005)

## 4.8. Testability
Ease of testing individual components and the system as a whole.

### 4.8.3. Metrics

- Unit test coverage percentage
- Ease of writing integration and end-to-end tests

### 4.8.4. Tactics

- Dependency Injection to allow mocking
- Clear separation of concerns (layers)
- Well-defined interfaces between components
- Automated testing frameworks (e.g., Jest for Node.js, NUnit/Unity Test Framework for client)
- Testable procedural level generation (using seeds - REQ-CGLE-011, REQ-8-027)



---

