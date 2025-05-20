using UnityEngine;
using System;
using GlyphPuzzle.Mobile.Presentation.Gameplay; // For CatalystGlyph (placeholder)

// Placeholder for CatalystGlyph if not defined elsewhere
#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.Presentation.Gameplay
// {
//     public class CatalystGlyph : MonoBehaviour 
//     { 
//         public string Id; // Example property 
//     }
// }
#endif

namespace GlyphPuzzle.Mobile.Presentation.Input
{
    /// <summary>
    /// Handles tap input for UI and gameplay elements like Catalysts.
    /// Uses raycasting to determine tapped objects and raises events.
    /// Implements REQ-ACC-001, REQ-CGLE-025, REQ-UIUX-005.
    /// </summary>
    public class TapInputHandler : MonoBehaviour
    {
        /// <summary>
        /// Event raised when a grid cell is tapped. Parameter: (tappedCell).
        /// </summary>
        public event Action<Vector2Int> OnGridCellTapped;

        /// <summary>
        /// Event raised when a Catalyst glyph is tapped. Parameter: (tappedCatalyst).
        /// </summary>
        public event Action<CatalystGlyph> OnCatalystTapped;

        [Tooltip("The main camera used for raycasting.")]
        [SerializeField] private Camera mainCamera;
        
        [Tooltip("Layer mask for tappable game objects (e.g., Catalysts, Grid Cells for alternative input).")]
        [SerializeField] private LayerMask tappableLayerMask;


        void Awake()
        {
            if (mainCamera == null)
            {
                mainCamera = Camera.main;
                if (mainCamera == null)
                {
                    Debug.LogError("TapInputHandler: Main camera not found and not assigned.");
                    this.enabled = false;
                }
            }
        }

        /// <summary>
        /// Unity lifecycle. Processes input each frame.
        /// </summary>
        void Update()
        {
            if (mainCamera == null) return;

            // Using Unity's new Input System (Pointer.OnClick) would be cleaner for taps.
            // For old Input Manager:
            if (Input.GetMouseButtonDown(0))
            {
                ProcessTap(Input.mousePosition);
            }
        }

        private void ProcessTap(Vector2 screenPosition)
        {
            Ray ray = mainCamera.ScreenPointToRay(screenPosition);
            RaycastHit hit;

            // First, check for UI taps (usually handled by EventSystem, but can be explicit for game world UI)
            // If using UnityEngine.EventSystems.EventSystem, it usually blocks raycasts to world if UI is hit.
            // For this example, we focus on world-space objects like Catalysts or Grid Cells.

            if (Physics.Raycast(ray, out hit, Mathf.Infinity, tappableLayerMask))
            {
                // Check for CatalystGlyph component
                CatalystGlyph catalyst = hit.collider.GetComponent<CatalystGlyph>();
                if (catalyst != null)
                {
                    OnCatalystTapped?.Invoke(catalyst);
                    // Debug.Log($"Catalyst Tapped: {catalyst.name}");
                    return; // Stop further processing if Catalyst is tapped
                }

                // Example: Check for a specific GridCell tap handler or identifiable component
                // This part is more abstract as grid cells might not always be individual GameObjects
                // or might be handled differently for tap (e.g., via SwipeInputHandler's ScreenToGridPosition)
                // For REQ-ACC-001 (SelectAndConfirm for Catalysts), this might select a cell.
                // For now, let's assume a 'TappableGridCell' component or similar.
                // TappableGridCell tappableCell = hit.collider.GetComponent<TappableGridCell>();
                // if (tappableCell != null)
                // {
                //     OnGridCellTapped?.Invoke(tappableCell.GridPosition);
                //     Debug.Log($"Grid Cell Tapped: {tappableCell.GridPosition}");
                //     return;
                // }

                // Fallback: if no specific component, but hit something on the tappable layer.
                // Could convert hit.point to a grid cell if that's the desired behavior.
                // Vector2Int gridPos = GridManager.Instance.WorldToGridPosition(hit.point); // Example conversion
                // OnGridCellTapped?.Invoke(gridPos); 
                // Debug.Log($"Tapped on layer at world pos: {hit.point}");

            }
            // If using 2D physics for a 2D game:
            // RaycastHit2D hit2D = Physics2D.GetRayIntersection(ray, Mathf.Infinity, tappableLayerMask);
            // if (hit2D.collider != null)
            // {
            //    CatalystGlyph catalyst = hit2D.collider.GetComponent<CatalystGlyph>();
            //    if (catalyst != null) { OnCatalystTapped?.Invoke(catalyst); return; }
            //    // ... other 2D checks
            // }
        }
    }
}