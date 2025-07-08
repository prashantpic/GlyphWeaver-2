# Repository Specification

# 1. Name
Glyph Weaver Authentication Service


---

# 2. Description
This repository contains the backend microservice responsible for all player authentication and authorization concerns. It manages player identity by integrating with platform-specific services like Apple Game Center and Google Play Games Services, handling their authentication tokens. It also provides the foundation for an optional custom email/password account system. Its core responsibilities include verifying player credentials, issuing, refreshing, and validating JSON Web Tokens (JWTs) used to secure all subsequent API requests across the entire backend ecosystem. It acts as the gatekeeper, ensuring that only authenticated users can access protected resources like player data and leaderboards. It maintains a minimal player identity record linked to the main player profile in the Player Service and logs all authentication attempts for security auditing.


---

# 3. Type
AuthenticationService


---

# 4. Namespace
GlyphWeaver.Backend.Auth


---

# 5. Output Path
backend/services/auth


---

# 6. Framework
Express.js


---

# 7. Language
TypeScript


---

# 8. Technology
Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt


---

# 9. Thirdparty Libraries

- jsonwebtoken
- bcryptjs
- passport
- passport-jwt


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

- **Requirement Id:** REQ-10  
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
REPO-GLYPH-AUTH


---

# 17. Architecture_Map

- backend-service-api-presentation
- backend-service-application-services
- backend-service-domain-logic
- backend-service-data-access


---

# 18. Components_Map

- backend-auth-controller
- backend-authentication-service


---

# 19. Requirements_Map

- REQ-SCF-001
- REQ-SCF-002
- REQ-SEC-001
- REQ-SEC-010
- REQ-SEC-019


---

