# Repository Specification

# 1. Name
Glyph Weaver IAP Validation Service


---

# 2. Description
This repository contains the highly critical microservice for handling server-side In-App Purchase (IAP) validation. Its sole purpose is to provide a secure endpoint for the game client to submit purchase receipts. The service then communicates directly and securely with the respective platform's validation servers (Apple App Store and Google Play Store) to verify the authenticity and status of the transaction. This server-to-server validation prevents common fraud vectors like replay attacks and receipt tampering. Upon successful validation, it coordinates with the Player Service to credit the player's account with the purchased goods (e.g., virtual currency, hint packs, ad removal). Every transaction attempt, its validation status, and the final fulfillment outcome are meticulously logged in a dedicated transaction table for customer support, auditing, and financial reconciliation purposes.


---

# 3. Type
Microservice


---

# 4. Namespace
GlyphWeaver.Backend.IAP


---

# 5. Output Path
backend/services/iap


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

- **Requirement Id:** REQ-8  
- **Requirement Id:** REQ-12.3  


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
REPO-GLYPH-IAP


---

# 17. Architecture_Map

- backend-service-api-presentation
- backend-service-application-services
- backend-service-domain-logic
- backend-service-data-access


---

# 18. Components_Map

- backend-iap-validation-controller
- backend-iap-validation-service
- backend-platform-iap-validator-gateway
- backend-iap-transaction-repository


---

# 19. Requirements_Map

- REQ-8-001
- REQ-8-013
- REQ-8-017
- REQ-SEC-008


---

