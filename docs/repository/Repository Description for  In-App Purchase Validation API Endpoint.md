# Repository Specification

# 1. Name
In-App Purchase Validation API Endpoint


---

# 2. Description
A critical security endpoint responsible for handling server-side validation of in-app purchases. The client sends the purchase receipt obtained from the Apple App Store or Google Play Store to this endpoint. The backend then communicates directly with the respective platform's validation servers to confirm the transaction's authenticity before granting the purchased content (e.g., virtual currency, hint packs, ad removal) to the player's account. This prevents fraud and replay attacks.


---

# 3. Type
RESTfulAPI


---

# 4. Namespace
GlyphWeaver.Backend.Api.IAP


---

# 5. Output Path
backend/src/api/iap


---

# 6. Framework
Express.js


---

# 7. Language
TypeScript


---

# 8. Technology
HTTP/S, REST, JSON, JWT


---

# 9. Thirdparty Libraries

- joi
- mongoose
- google-play-billing
- apple-receipt-verify


---

# 10. Dependencies

- backend-iap-validation-controller
- backend-iap-validation-service
- backend-platform-iap-validator-gateway
- backend-iap-transaction-repository
- backend-player-inventory-repository


---

# 11. Layer Ids

- backend-service-api-presentation
- backend-service-application-services
- backend-service-infrastructure


---

# 12. Requirements

- **Requirement Id:** REQ-8-001  
- **Requirement Id:** REQ-8-013  
- **Requirement Id:** REQ-SEC-008  


---

# 13. Generate Tests
True


---

# 14. Generate Documentation
True


---

# 15. Architecture Style
LayeredArchitecture


---

# 16. Id
REPO-GLYPH-IAP


---

# 17. Architecture_Map

- backend-service-api-presentation
- backend-service-application-services
- backend-service-data-access
- backend-service-infrastructure


---

# 18. Components_Map

- backend-iap-validation-controller
- backend-iap-validation-service
- backend-platform-iap-validator-gateway
- backend-iap-transaction-repository
- backend-player-inventory-repository
- backend-audit-logging-service


---

# 19. Requirements_Map

- REQ-8-001
- REQ-8-013
- REQ-SEC-008
- REQ-8-017


---

