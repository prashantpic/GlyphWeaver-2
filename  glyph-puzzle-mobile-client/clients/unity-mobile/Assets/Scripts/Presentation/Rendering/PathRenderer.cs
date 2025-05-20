using UnityEngine;
using System.Collections.Generic;
using GlyphPuzzle.Mobile.Presentation.Gameplay; // For PathSegmentView (placeholder)

// Placeholder for PathSegmentView and PathDrawState if not defined elsewhere
#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.Presentation.Gameplay
// {
//     public class PathSegmentView : MonoBehaviour 
//     {
//         public void Initialize(Vector2Int from, Vector2Int to, PathDrawState state) { /* visual logic */ }
//         public void SetState(PathDrawState state) { /* change color/effect */ }
//     }
// }
// namespace GlyphPuzzle.Mobile.Presentation.Rendering
// {
//    public enum PathDrawState { Drawing, Valid, Invalid }
// }
#endif


namespace GlyphPuzzle.Mobile.Presentation.Rendering
{
    /// <summary>
    /// Responsible for rendering paths on the grid.
    /// Instantiates PathSegmentView prefabs and manages their appearance.
    /// Implements REQ-CGLE-014, and supports REQ-CGLE-016 for path state visualization.
    /// </summary>
    public class PathRenderer : MonoBehaviour
    {
        [Tooltip("Prefab for a single segment of a drawn path.")]
        [SerializeField] private PathSegmentView pathSegmentPrefab;

        [Tooltip("Parent transform for instantiated path segments. Helps in organization.")]
        [SerializeField] private Transform pathContainer;

        // Store active path segments, perhaps keyed by a path ID if multiple paths can be drawn simultaneously
        private Dictionary<int, List<PathSegmentView>> activePaths = new Dictionary<int, List<PathSegmentView>>();
        private int nextPathId = 0; // Simple ID generation for this example

        void Awake()
        {
            if (pathSegmentPrefab == null)
            {
                Debug.LogError("PathRenderer: pathSegmentPrefab is not assigned.");
                this.enabled = false;
            }
            if (pathContainer == null)
            {
                // Default to this transform if not specified
                pathContainer = transform;
            }
        }
        
        /// <summary>
        /// Gets a new Path ID for tracking. In a real scenario, this might come from PathDrawingService.
        /// </summary>
        public int GetNewPathId()
        {
            return nextPathId++;
        }


        /// <summary>
        /// Draws a single segment of a path.
        /// </summary>
        /// <param name="fromCell">The grid cell where the segment starts.</param>
        /// <param name="toCell">The grid cell where the segment ends.</param>
        /// <param name="state">The visual state of the path segment (e.g., drawing, valid, invalid).</param>
        /// <param name="pathId">Identifier for the path this segment belongs to. Optional for simple cases.</param>
        public void DrawPathSegment(Vector2Int fromCell, Vector2Int toCell, PathDrawState state, int pathId = 0)
        {
            if (pathSegmentPrefab == null) return;

            PathSegmentView segmentInstance = Instantiate(pathSegmentPrefab, pathContainer);
            // Position the segment. This depends on how your grid and cell centers are set up.
            // Example: Assuming cells are unit sized and cell (0,0) is at world (0,0).
            // Vector3 fromWorld = new Vector3(fromCell.x, fromCell.y, 0);
            // Vector3 toWorld = new Vector3(toCell.x, toCell.y, 0);
            // segmentInstance.transform.position = (fromWorld + toWorld) / 2f;
            // segmentInstance.transform.right = (toWorld - fromWorld).normalized; // Align segment
            
            segmentInstance.Initialize(fromCell, toCell, state); // PathSegmentView handles its own visual setup

            if (!activePaths.ContainsKey(pathId))
            {
                activePaths[pathId] = new List<PathSegmentView>();
            }
            activePaths[pathId].Add(segmentInstance);
        }

        /// <summary>
        /// Clears all segments belonging to a specific path.
        /// </summary>
        /// <param name="pathId">The ID of the path to clear.</param>
        public void ClearPath(int pathId)
        {
            if (activePaths.TryGetValue(pathId, out List<PathSegmentView> segments))
            {
                foreach (PathSegmentView segment in segments)
                {
                    if (segment != null) Destroy(segment.gameObject);
                }
                segments.Clear();
                activePaths.Remove(pathId);
            }
        }

        /// <summary>
        /// Clears all drawn path segments from the display.
        /// </summary>
        public void ClearAllPaths()
        {
            foreach (var pathId in new List<int>(activePaths.Keys)) // Iterate over a copy of keys for safe removal
            {
                ClearPath(pathId);
            }
            activePaths.Clear();
            nextPathId = 0; // Reset path ID counter
        }

        // Example of updating a path's visual state (e.g., if it becomes invalid)
        public void UpdatePathState(int pathId, PathDrawState newState)
        {
            if (activePaths.TryGetValue(pathId, out List<PathSegmentView> segments))
            {
                foreach (PathSegmentView segment in segments)
                {
                    // segment.SetState(newState); // Assuming PathSegmentView has a method to update its visual state
                }
            }
        }
    }
}