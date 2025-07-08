# Repository Specification

# 1. Name
Glyph Weaver Player Data Service


---

# 2. Description
This repository houses the core microservice dedicated to managing all aspects of a player's data and progression. It is the authoritative source for the player's profile, including their alias and linked platform IDs. It meticulously tracks level progress, storing high scores, star ratings, completion times, and attempts for every level. The service also manages the player's inventory, including server-authoritative virtual currency ('Glyph Orbs') and consumable items like hints and undos, processing debits and credits from gameplay and IAP fulfillment. It stores all user preferences, such as audio settings and accessibility options, and handles the logic for cloud save data synchronization, including conflict resolution. Furthermore, it manages player achievement status and provides endpoints for data access and deletion to comply with privacy regulations like GDPR and CCPA.


---

# 3. Type
Microservice


---

# 4. Namespace
GlyphWeaver.Backend.Player


---

# 5. Output Path
backend/services/player


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

- **Requirement Id:** REQ-11  
- **Requirement Id:** REQ-8  
- **Requirement Id:** REQ-12.4  


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
REPO-GLYPH-PLAYER


---

# 17. Architecture_Map

- backend-service-api-presentation
- backend-service-application-services
- backend-service-domain-logic
- backend-service-data-access


---

# 18. Components_Map

- backend-player-data-management-service
- backend-player-repository
- backend-level-progress-repository
- backend-player-inventory-repository


---

# 19. Requirements_Map

- REQ-PDP-001
- REQ-PDP-002
- REQ-PDP-004
- REQ-PDP-005
- REQ-PDP-006
- REQ-ACC-010
- REQ-SEC-012
- REQ-8-004


---

