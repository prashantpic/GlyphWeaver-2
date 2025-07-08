# Specification

# 1. Sequence Design Overview

- **Sequence_Diagram:**
  ### . Secure Score Submission and Validation
  Details the backend process for receiving a score from the client, validating it for anomalies to prevent cheating, and persisting it to the leaderboards. This includes both the happy path and rejection.

  #### .4. Purpose
  To ensure leaderboard integrity and fair play, a core security requirement.

  #### .5. Type
  SecurityFlow

  #### .6. Participant Repository Ids
  
  - REPO-GLYPH-CLIENT-UNITY
  - REPO-GLYPH-LEADERBOARD
  - REPO-GLYPH-PLAYER
  
  #### .7. Key Interactions
  
  - Client sends score data, including a validation checksum, to REPO-GLYPH-LEADERBOARD.
  - Leaderboard service validates the checksum and checks score against level parameters (e.g., max possible score).
  - Leaderboard service may consult player history from REPO-GLYPH-PLAYER for anomaly detection.
  - If valid, the score is saved to the leaderboard database and the cache is updated.
  - If invalid, the attempt is logged for audit and an error is returned to the client.
  
  #### .8. Related Feature Ids
  
  - REQ-9
  - REQ-12.2
  
  #### .9. Domain
  Leaderboards

  #### .10. Metadata
  
  - **Complexity:** Medium
  - **Priority:** Critical
  


---

# 2. Sequence Diagram Details

- **Success:** True
- **Cache_Created:** True
- **Status:** refreshed
- **Cache_Id:** onkdl265mryjk70gmcxn7liiafz436j8l8hj0aml
- **Cache_Name:** cachedContents/onkdl265mryjk70gmcxn7liiafz436j8l8hj0aml
- **Cache_Display_Name:** repositories
- **Cache_Status_Verified:** True
- **Model:** models/gemini-2.5-pro-preview-03-25
- **Workflow_Id:** I9v2neJ0O4zJsz8J
- **Execution_Id:** AIzaSyCGei_oYXMpZW-N3d-yH-RgHKXz8dsixhc
- **Project_Id:** 8
- **Record_Id:** 10
- **Cache_Type:** repositories


---

