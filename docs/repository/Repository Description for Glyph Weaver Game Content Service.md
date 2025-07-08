# Repository Specification

# 1. Name
Glyph Weaver Game Content Service


---

# 2. Description
This repository contains the microservice that acts as the Content Management System (CMS) for the game. It is the definitive source for all game design and level data. It stores and serves configurations for all hand-crafted levels, including grid layouts, glyph positions, and pre-defined solutions. It also manages the templates, parameters, and rules for the procedural generation algorithm, ensuring a consistent and balanced experience for endless play. This service holds the definitions for all game entities, such as puzzle types, obstacle behaviors (e.g., shifting tile patterns), special glyph rules, and zone progression criteria. By centralizing game content, this service allows for dynamic updates, A/B testing of level designs, and seasonal events without requiring a new client release.


---

# 3. Type
Microservice


---

# 4. Namespace
GlyphWeaver.Backend.GameContent


---

# 5. Output Path
backend/services/gamecontent


---

# 6. Framework
Express.js


---

# 7. Language
TypeScript


---

# 8. Technology
Node.js, Express.js, MongoDB, Mongoose


---

# 9. Thirdparty Libraries



---

# 10. Dependencies

- REPO-GLYPH-SHARED-LIBS-BACKEND
- REPO-GLYPH-DB-MIGRATIONS


---

# 11. Layer Ids

- backend-service-api-presentation
- backend-service-application-services
- backend-service-domain-logic
- backend-service-data-access


---

# 12. Requirements

- **Requirement Id:** REQ-1  
- **Requirement Id:** REQ-2  


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
REPO-GLYPH-GAMECONTENT


---

# 17. Architecture_Map

- backend-service-api-presentation
- backend-service-application-services
- backend-service-domain-logic
- backend-service-data-access


---

# 18. Components_Map

- backend-procedural-level-data-service
- backend-procedural-level-data-repository


---

# 19. Requirements_Map

- REQ-CGLE-001
- REQ-CGLE-002
- REQ-CGLE-008
- REQ-CGLE-011
- REQ-8-004
- REQ-8-027


---

