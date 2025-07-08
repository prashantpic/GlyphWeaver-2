# Repository Specification

# 1. Name
Glyph Weaver Analytics Ingestion Service


---

# 2. Description
This repository houses the backend microservice designed as a high-throughput ingestion pipeline for analytics data. It provides an endpoint for the game client to send batches of telemetry events in a fire-and-forget manner. These events cover the full spectrum of player interaction, including level starts, completions, failures, hint usage, IAP funnel progression, session lengths, and custom performance metrics. The service is responsible for receiving these event batches, performing initial validation and sanitization, and potentially enriching them with server-side information (like timestamps or IP-based geolocation). The processed data is then efficiently written to a scalable data store (e.g., a dedicated MongoDB collection or streamed to a data lake like AWS S3) for later analysis, dashboarding, and game balancing by the design and business intelligence teams.


---

# 3. Type
Microservice


---

# 4. Namespace
GlyphWeaver.Backend.Analytics


---

# 5. Output Path
backend/services/analytics


---

# 6. Framework
Express.js


---

# 7. Language
TypeScript


---

# 8. Technology
Node.js, Express.js, MongoDB


---

# 9. Thirdparty Libraries



---

# 10. Dependencies

- REPO-GLYPH-SHARED-LIBS-BACKEND


---

# 11. Layer Ids

- backend-service-api-presentation
- backend-service-application-services
- backend-service-data-access


---

# 12. Requirements

- **Requirement Id:** REQ-13  


---

# 13. Generate Tests
True


---

# 14. Generate Documentation
True


---

# 15. Architecture Style
Microservices


---

# 16. Id
REPO-GLYPH-ANALYTICS


---

# 17. Architecture_Map

- backend-service-api-presentation
- backend-service-application-services
- backend-service-data-access


---

# 18. Components_Map

- backend-analytics-ingestion-controller
- backend-analytics-ingestion-service
- backend-raw-analytics-event-repository


---

# 19. Requirements_Map

- REQ-AMOT-001
- REQ-AMOT-002
- REQ-AMOT-003
- REQ-AMOT-004
- REQ-ACC-012


---

