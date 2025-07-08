# Repository Specification

# 1. Name
Authentication API Endpoint


---

# 2. Description
Handles user authentication for custom game accounts. This includes registration, login (credential exchange for a JWT), and token refresh. It also provides a mechanism to link a platform-specific ID (Game Center, Google Play Games) to a custom game account to unify progression. It serves as the primary entry point for securing backend services.


---

# 3. Type
RESTfulAPI


---

# 4. Namespace
GlyphWeaver.Backend.Api.Auth


---

# 5. Output Path
backend/src/api/auth


---

# 6. Framework
Express.js


---

# 7. Language
TypeScript


---

# 8. Technology
HTTP/S, REST, JSON, JWT, bcrypt


---

# 9. Thirdparty Libraries

- jsonwebtoken
- bcryptjs
- joi
- passport


---

# 10. Dependencies

- backend-auth-controller
- backend-authentication-service
- backend-player-repository
- backend-audit-logging-service


---

# 11. Layer Ids

- backend-service-api-presentation
- backend-service-application-services


---

# 12. Requirements

- **Requirement Id:** REQ-SCF-002  
- **Requirement Id:** REQ-SEC-001  
- **Requirement Id:** REQ-SEC-010  
- **Requirement Id:** REQ-SEC-019  


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
REPO-GLYPH-AUTH


---

# 17. Architecture_Map

- backend-service-api-presentation
- backend-service-application-services
- backend-service-data-access


---

# 18. Components_Map

- backend-auth-controller
- backend-authentication-service
- backend-player-repository
- backend-audit-logging-service


---

# 19. Requirements_Map

- REQ-SCF-002
- REQ-SEC-001
- REQ-8-011
- REQ-SEC-010
- REQ-SEC-019
- REQ-8-019


---

