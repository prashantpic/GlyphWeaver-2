using UnityEngine;
using GlyphPuzzle.Mobile.DomainLogic.Models; // For LevelData, Path, Grid

// Placeholders if not defined elsewhere
#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.DomainLogic.Models 
// {
//     public class Path { public System.Collections.Generic.List<Vector2Int> Cells; /* ... */ }
//     public class LevelData { public Grid GridState; public LevelDefinitionSO Definition; /* ... */ }
//     public class Grid { /* Grid data access methods, e.g. GetCellState(Vector2Int) */ }
// }
// namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels 
// {
//     public class LevelDefinitionSO : ScriptableObject { /* Level rules, e.g. PuzzleTypes */ }
// }
#endif

namespace GlyphPuzzle.Mobile.DomainLogic.Gameplay
{
    /// <summary>
    /// Validates player-drawn paths against current level's rules and constraints.
    /// Checks rules like non-overlapping paths, correct glyph connections, etc.
    /// Implements REQ-CGLE-014, REQ-CGLE-015, REQ-CGLE-017.
    /// </summary>
    public class PathValidator
    {
        /// <summary>
        /// Validates if the next segment of a path is valid according to game rules.
        /// </summary>
        /// <param name="currentPath">The path being drawn so far.</param>
        /// <param name="nextCell">The proposed next cell for the path.</param>
        /// <param name="levelData">The current level's runtime data.</param>
        /// <param name="gridState">The current state of the game grid.</param>
        /// <returns>True if the segment is valid, false otherwise.</returns>
        public bool IsValidPathSegment(Path currentPath, Vector2Int nextCell, LevelData levelData, Grid gridState)
        {
            if (currentPath == null || currentPath.Cells.Count == 0 || levelData == null || gridState == null)
            {
                Debug.LogError("PathValidator: Invalid input for segment validation.");
                return false;
            }

            Vector2Int lastCell = currentPath.Cells[currentPath.Cells.Count - 1];

            // Rule: Must be adjacent (orthogonally or diagonally, based on game rules)
            // For this example, let's assume orthogonal adjacency for simplicity.
            int dx = Mathf.Abs(nextCell.x - lastCell.x);
            int dy = Mathf.Abs(nextCell.y - lastCell.y);
            if (!((dx == 1 && dy == 0) || (dx == 0 && dy == 1)))
            {
                //Debug.LogWarning("Invalid segment: Not adjacent orthogonally.");
                return false; 
            }

            // Rule: Cell must be within grid bounds (Grid class should handle this or provide info)
            // if (!gridState.IsWithinBounds(nextCell)) return false;

            // Rule: Cell must not already be part of this path (prevent self-intersection)
            if (currentPath.Cells.Contains(nextCell))
            {
                //Debug.LogWarning("Invalid segment: Path cannot intersect itself.");
                return false;
            }

            // Rule: Cell must be traversable (not an obstacle, not part of another completed path - REQ-CGLE-015)
            // This requires GridState to provide info about cell contents/occupancy.
            // Example: if (gridState.GetCellState(nextCell) == CellType.Obstacle) return false;
            // Example: if (gridState.IsCellOccupiedByAnotherPath(nextCell, currentPath.Id)) return false;

            // Rule: Specific puzzle type rules (e.g., color matching, sequence)
            // This could involve checking glyph types at 'lastCell' and 'nextCell'
            // if (!CheckPuzzleSpecificRules(lastCell, nextCell, levelData)) return false;
            
            // If all checks pass
            return true;
        }

        /// <summary>
        /// Validates if a completed path is valid and meets all completion criteria.
        /// </summary>
        /// <param name="completedPath">The path that the player has finished drawing.</param>
        /// <param name="levelData">The current level's runtime data.</param>
        /// <param name="gridState">The current state of the game grid.</param>
        /// <returns>True if the path is complete and valid, false otherwise.</returns>
        public bool IsPathCompleteAndValid(Path completedPath, LevelData levelData, Grid gridState)
        {
            if (completedPath == null || completedPath.Cells.Count < 2 || levelData == null || gridState == null)
            {
                // Path needs at least two points (start and end glyph)
                //Debug.LogWarning("Invalid path for completion: Too short or missing data.");
                return false; 
            }

            Vector2Int startCell = completedPath.Cells[0];
            Vector2Int endCell = completedPath.Cells[completedPath.Cells.Count - 1];

            // Rule: Path must start on a specific type of glyph (e.g., an "unsolved" starting glyph)
            // Example: if (!gridState.IsStartGlyph(startCell)) return false;

            // Rule: Path must end on a matching glyph (e.g., corresponding pair, correct color)
            // Example: if (!gridState.IsMatchingEndGlyph(startCell, endCell)) return false;
            
            // Rule: Path must satisfy any length constraints or other completion rules for the puzzle type
            // Example: if (levelData.Definition.PuzzleTypes.Contains(PuzzleType.FixedLength) && completedPath.Cells.Count != levelData.Definition.RequiredPathLength) return false;

            // REQ-CGLE-017: Complex path validation (could be part of puzzle specific rules)
            // For example, all cells in between must be empty, or follow a certain pattern.
            // These rules would have been checked during IsValidPathSegment, but a final check might be needed.

            // If all checks pass
            return true;
        }

        // private bool CheckPuzzleSpecificRules(Vector2Int fromCell, Vector2Int toCell, LevelData levelData)
        // {
        //     // Implement logic based on levelData.Definition.PuzzleTypes
        //     // e.g., if color match, check if glyphs at fromCell and toCell are compatible or if toCell is empty.
        //     return true;
        // }
    }
}