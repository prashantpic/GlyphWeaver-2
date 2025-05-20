using UnityEngine;
using System;
using GlyphPuzzle.Mobile.ApplicationServices; // For IGridManager (placeholder)

// Placeholder for IGridManager if not defined elsewhere
#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.ApplicationServices
// {
//     public interface IGridManager 
//     {
//         Vector2Int ScreenToGridPosition(Vector2 screenPosition);
//         bool IsCellValid(Vector2Int cell); 
//     }
//      public class GridManagerPlaceholder : MonoBehaviour, IGridManager // Example implementation
//      {
//          public Vector2Int ScreenToGridPosition(Vector2 screenPosition) { return Vector2Int.zero; }
//          public bool IsCellValid(Vector2Int cell) { return true; }
//      }
// }
#endif


namespace GlyphPuzzle.Mobile.Presentation.Input
{
    /// <summary>
    /// Handles swipe input gestures for drawing paths on the game grid.
    /// Monitors touch/mouse input, translates to grid cells, and raises events.
    /// Implements REQ-CGLE-014.
    /// </summary>
    public class SwipeInputHandler : MonoBehaviour
    {
        /// <summary>
        /// Event raised when a path drawing segment is made. Parameters: (fromCell, toCell).
        /// </summary>
        public event Action<Vector2Int, Vector2Int> OnPathSegmentDrawn;

        /// <summary>
        /// Event raised when path drawing starts. Parameter: (startCell).
        /// </summary>
        public event Action<Vector2Int> OnPathDrawingStarted;

        /// <summary>
        /// Event raised when path drawing ends. Parameter: (endCell).
        /// </summary>
        public event Action<Vector2Int> OnPathDrawingEnded;

        [Tooltip("Reference to the GridManager for coordinate conversion.")]
        [SerializeField] private MonoBehaviour gridManagerComponent; // Use MonoBehaviour to allow assigning different IGridManager implementers
        private IGridManager gridManager;


        [Tooltip("The main camera used for screen to world point conversion.")]
        [SerializeField] private Camera mainCamera;

        private bool isDrawing = false;
        private Vector2Int lastCellPosition = -Vector2Int.one; // Using -Vector2Int.one as an invalid/uninitialized state

        void Awake()
        {
            if (gridManagerComponent is IGridManager manager)
            {
                gridManager = manager;
            }
            else
            {
                Debug.LogError("SwipeInputHandler: Assigned gridManagerComponent does not implement IGridManager.");
                this.enabled = false;
                return;
            }

            if (mainCamera == null)
            {
                mainCamera = Camera.main;
                if (mainCamera == null)
                {
                    Debug.LogError("SwipeInputHandler: Main camera not found and not assigned.");
                    this.enabled = false;
                }
            }
        }

        /// <summary>
        /// Unity lifecycle. Processes input each frame.
        /// </summary>
        void Update()
        {
            if (gridManager == null || mainCamera == null) return;

            // Using Unity's new Input System would be more robust, but for simplicity, using old Input manager.
            // This can be adapted for the new Input System by using Pointer events.
            if (Input.GetMouseButtonDown(0))
            {
                Vector2Int currentCell = gridManager.ScreenToGridPosition(Input.mousePosition);
                if (gridManager.IsCellValid(currentCell))
                {
                    isDrawing = true;
                    lastCellPosition = currentCell;
                    OnPathDrawingStarted?.Invoke(currentCell);
                    // Debug.Log($"Path Drawing Started at: {currentCell}");
                }
            }
            else if (Input.GetMouseButton(0) && isDrawing)
            {
                Vector2Int currentCell = gridManager.ScreenToGridPosition(Input.mousePosition);
                if (gridManager.IsCellValid(currentCell) && currentCell != lastCellPosition)
                {
                    // Basic adjacency check (can be more sophisticated in PathValidator)
                    if (Mathf.Abs(currentCell.x - lastCellPosition.x) <= 1 && Mathf.Abs(currentCell.y - lastCellPosition.y) <= 1)
                    {
                         OnPathSegmentDrawn?.Invoke(lastCellPosition, currentCell);
                         // Debug.Log($"Path Segment Drawn: {lastCellPosition} -> {currentCell}");
                         lastCellPosition = currentCell;
                    }
                }
            }
            else if (Input.GetMouseButtonUp(0) && isDrawing)
            {
                isDrawing = false;
                OnPathDrawingEnded?.Invoke(lastCellPosition);
                // Debug.Log($"Path Drawing Ended at: {lastCellPosition}");
                lastCellPosition = -Vector2Int.one;
            }
        }
    }
}