using UnityEngine;
using System.Collections.Generic;
using GlyphPuzzle.Mobile.Presentation.Gameplay; // For GridCellView (placeholder)

// Placeholder for GridCellView if not defined elsewhere
#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.Presentation.Gameplay
// {
//     public class GridCellView : MonoBehaviour 
//     {
//         public Vector2Int GridPosition;
//         public void Initialize(Vector2Int position) { GridPosition = position; /* visual setup */ }
//     }
// }
#endif

namespace GlyphPuzzle.Mobile.Presentation.Rendering
{
    /// <summary>
    /// Renders the game board/grid by instantiating GridCellView prefabs.
    /// </summary>
    public class GridRenderer : MonoBehaviour
    {
        [Tooltip("Prefab for the visual representation of a single cell in the game grid.")]
        [SerializeField] private GridCellView gridCellPrefab;

        [Tooltip("Parent transform under which grid cells will be instantiated. Helps in organization.")]
        [SerializeField] private Transform gridContainer;

        private List<GridCellView> spawnedCells = new List<GridCellView>();

        void Awake()
        {
            if (gridCellPrefab == null)
            {
                Debug.LogError("GridRenderer: gridCellPrefab is not assigned.");
                this.enabled = false;
            }
            if (gridContainer == null)
            {
                // Default to this transform if not specified
                gridContainer = transform;
            }
        }

        /// <summary>
        /// Initializes and renders the grid based on the given dimensions.
        /// </summary>
        /// <param name="dimensions">The dimensions (rows, columns) of the grid.</param>
        /// <param name="cellSize">Optional: Size of each cell for positioning.</param>
        public void InitializeGrid(Vector2Int dimensions, float cellSize = 1.0f)
        {
            if (gridCellPrefab == null) return;

            ClearGrid(); // Clear any existing cells first

            // Assuming grid origin (0,0) is at bottom-left for positive coordinates
            for (int y = 0; y < dimensions.y; y++) // Rows
            {
                for (int x = 0; x < dimensions.x; x++) // Columns
                {
                    GridCellView cellInstance = Instantiate(gridCellPrefab, gridContainer);
                    
                    // Position the cell. Example: Centered grid if container is at (0,0)
                    // float xPos = (x - (dimensions.x - 1) / 2.0f) * cellSize;
                    // float yPos = (y - (dimensions.y - 1) / 2.0f) * cellSize;
                    // cellInstance.transform.localPosition = new Vector3(xPos, yPos, 0);
                    
                    // Simpler positioning: if (0,0) of grid is at (0,0) of container:
                    cellInstance.transform.localPosition = new Vector3(x * cellSize, y * cellSize, 0);
                    
                    cellInstance.name = $"Cell_{x}_{y}";
                    cellInstance.Initialize(new Vector2Int(x, y));
                    spawnedCells.Add(cellInstance);
                }
            }
        }

        /// <summary>
        /// Clears all spawned grid cells from the display.
        /// </summary>
        public void ClearGrid()
        {
            foreach (GridCellView cell in spawnedCells)
            {
                if (cell != null) Destroy(cell.gameObject);
            }
            spawnedCells.Clear();

            // Alternative: iterate through children of gridContainer if only cells are parented there
            // foreach (Transform child in gridContainer)
            // {
            //     Destroy(child.gameObject);
            // }
        }
    }
}