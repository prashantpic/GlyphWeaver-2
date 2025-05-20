using System;
using UnityEngine;
using GlyphPuzzle.Mobile.DomainLogic.Gameplay; // For PathValidator
using GlyphPuzzle.Mobile.DomainLogic.Models;    // For LevelData, Path, PathSegment
// Assuming IGridManager is defined for injection
using GlyphPuzzle.Mobile.ApplicationServices; // For IGridManager

// Placeholders for Path, PathSegment, LevelData, PathValidator, IGridManager if not elsewhere
#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.DomainLogic.Models 
// {
//     public class Path { public System.Collections.Generic.List<Vector2Int> Segments = new System.Collections.Generic.List<Vector2Int>(); public int Id; }
//     public class PathSegment { public Vector2Int From, To; }
//     public class LevelData { /* ... */ public Grid GridState; }
//     public class Grid { /* ... */ }
// }
// namespace GlyphPuzzle.Mobile.DomainLogic.Gameplay
// {
//     public class PathValidator 
//     {
//         public bool IsValidPathSegment(Path p, Vector2Int next, LevelData ld, Grid gs) => true;
//         public bool IsPathCompleteAndValid(Path p, LevelData ld, Grid gs) => true;
//     }
// }
// namespace GlyphPuzzle.Mobile.ApplicationServices
// {
//     public interface IGridManager { /* ... */ }
// }
#endif

namespace GlyphPuzzle.Mobile.ApplicationServices
{
    /// <summary>
    /// Service for handling path drawing mechanics and validation.
    /// Manages the lifecycle of drawing a path, from input to validation and feedback.
    /// Implements REQ-CGLE-014, REQ-CGLE-015, REQ-CGLE-016.
    /// </summary>
    public class PathDrawingService
    {
        public IGridManager GridManager { get; set; } // Injected
        public PathValidator PathValidator { get; set; } // Injected
        
        public LevelData CurrentLevelData { get; set; } // Set when a level is loaded

        /// <summary>
        /// Event for successfully completed path.
        /// </summary>
        public event Action<Path> OnPathCompleted;

        /// <summary>
        /// Event for an invalid path segment attempt.
        /// </summary>
        public event Action<PathSegment> OnPathInvalidated; // PathSegment might represent the invalid segment

        private Path currentDrawingPath;
        private int nextPathId = 0; // Simple ID for paths

        public PathDrawingService(IGridManager gridManager, PathValidator pathValidator)
        {
            this.GridManager = gridManager;
            this.PathValidator = pathValidator;
        }

        /// <summary>
        /// Starts drawing a new path from the given cell.
        /// Called by SwipeInputHandler.OnPathDrawingStarted.
        /// </summary>
        /// <param name="startCell">The starting grid cell of the path.</param>
        public void StartPathDrawing(Vector2Int startCell)
        {
            if (CurrentLevelData == null || GridManager == null || PathValidator == null)
            {
                Debug.LogError("PathDrawingService not properly initialized or level data missing.");
                return;
            }

            currentDrawingPath = new Path { Id = nextPathId++, Cells = new System.Collections.Generic.List<Vector2Int>() };
            currentDrawingPath.Cells.Add(startCell);
            
            // Notify PathRenderer to start drawing visually (not directly called here, but via events/presentation layer)
            // Example: VisualFeedbackManager or PathRenderer might listen to an internal "PathUpdate" event.
            Debug.Log($"Path drawing started at {startCell}, Path ID: {currentDrawingPath.Id}");
        }

        /// <summary>
        /// Continues drawing the current path to the next cell.
        /// Called by SwipeInputHandler.OnPathSegmentDrawn.
        /// </summary>
        /// <param name="nextCell">The next grid cell in the path.</param>
        public void ContinuePathDrawing(Vector2Int nextCell)
        {
            if (currentDrawingPath == null || CurrentLevelData == null || PathValidator == null) return;

            // Check if segment is valid
            if (PathValidator.IsValidPathSegment(currentDrawingPath, nextCell, CurrentLevelData, CurrentLevelData.GridState))
            {
                currentDrawingPath.Cells.Add(nextCell);
                // Notify PathRenderer to draw this segment
                // Example: A "PathSegmentAdded" event could be raised here for PathRenderer to consume.
                 Debug.Log($"Path segment added to {nextCell}, Path ID: {currentDrawingPath.Id}");
            }
            else
            {
                // Path segment is invalid
                PathSegment invalidSegment = new PathSegment { From = currentDrawingPath.Cells[currentDrawingPath.Cells.Count-1], To = nextCell };
                OnPathInvalidated?.Invoke(invalidSegment);
                // Optionally, stop drawing or revert last segment. For now, just notify.
                Debug.LogWarning($"Invalid path segment to {nextCell}. Path drawing might be interrupted or handled by UI.");
                // currentDrawingPath = null; // Stop current path drawing on invalid segment
            }
        }

        /// <summary>
        /// Ends the current path drawing at the given cell.
        /// Called by SwipeInputHandler.OnPathDrawingEnded.
        /// </summary>
        /// <param name="endCell">The final grid cell of the path.</param>
        public void EndPathDrawing(Vector2Int endCell)
        {
            if (currentDrawingPath == null || CurrentLevelData == null || PathValidator == null) return;

            // The endCell should already be part of the path if ContinuePathDrawing handled it correctly
            // Or, it might be the last cell if no new segment was added since the last ContinuePathDrawing.
            // For simplicity, assume endCell is the last point of the drawn path.
            // If the path has only one point (a tap, not a swipe), it might not be a valid path.
            if (currentDrawingPath.Cells.Count < 2 && currentDrawingPath.Cells[0] != endCell)
            {
                 // If it's not the same cell as start and only one point, it might be an issue with input sequence
                 // Or, if it is the same, it's a tap. PathValidator should handle this.
                 // Let's ensure the endCell is the last one if it's a new valid segment.
                 if (currentDrawingPath.Cells[currentDrawingPath.Cells.Count-1] != endCell)
                 {
                    // This case implies the last segment wasn't validated/added yet, or it's a distinct end event.
                    // We might need to call IsValidPathSegment for the final segment if input handler doesn't.
                    // For now, assume previous calls to ContinuePathDrawing have built up currentDrawingPath.Cells.
                 }
            }


            if (PathValidator.IsPathCompleteAndValid(currentDrawingPath, CurrentLevelData, CurrentLevelData.GridState))
            {
                OnPathCompleted?.Invoke(currentDrawingPath);
                // Update game state (e.g., mark glyphs as solved, update score in LevelData)
                // This logic might reside in another service called after OnPathCompleted.
                CurrentLevelData.ActivePaths.Add(currentDrawingPath); // Example state update
                Debug.Log($"Path ID {currentDrawingPath.Id} completed successfully at {endCell}. Length: {currentDrawingPath.Cells.Count}");
            }
            else
            {
                // Path is not complete or not valid according to rules upon ending.
                // Example: Notify PathRenderer to show the path as invalid or clear it.
                // OnPathInvalidated could be used more broadly for the whole path.
                // For now, just log. Visual feedback handled by listeners to OnPathInvalidated.
                 PathSegment lastSegmentAttempt = currentDrawingPath.Cells.Count > 1 ? 
                    new PathSegment { From = currentDrawingPath.Cells[currentDrawingPath.Cells.Count-2], To = currentDrawingPath.Cells[currentDrawingPath.Cells.Count-1] } :
                    new PathSegment { From = currentDrawingPath.Cells[0], To = currentDrawingPath.Cells[0] }; // A point, if path is too short
                OnPathInvalidated?.Invoke(lastSegmentAttempt); // Or a more general "PathFailed" event
                Debug.LogWarning($"Path ID {currentDrawingPath.Id} ended at {endCell} but was not valid or complete.");
            }
            currentDrawingPath = null; // Reset for next path
        }
        
        public void SetLevelData(LevelData levelData)
        {
            this.CurrentLevelData = levelData;
            this.currentDrawingPath = null; // Reset any ongoing path drawing
            this.nextPathId = 0; // Reset path ID counter for the new level
        }
    }
}