using System.Collections.Generic;
using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For LevelDefinitionSO

// Placeholders if not defined elsewhere
#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.DomainLogic.Models
// {
//     public class Grid { public Grid(UnityEngine.Vector2Int dim) {} /* Grid state representation */ }
//     public class Path { /* Path data */ }
// }
// namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels
// {
//     // public class LevelDefinitionSO : UnityEngine.ScriptableObject { /* ... */ }
// }
#endif

namespace GlyphPuzzle.Mobile.DomainLogic.Models
{
    /// <summary>
    /// Runtime data representation of a currently active Level.
    /// Instantiated by LevelLoadService from a LevelDefinitionSO.
    /// Updated by gameplay services as the player interacts with the level.
    /// Implements REQ-CGLE-007.
    /// </summary>
    public class LevelData
    {
        /// <summary>
        /// Static definition of the level.
        /// </summary>
        public LevelDefinitionSO Definition { get; set; }

        /// <summary>
        /// Current state of the grid, including paths and glyphs.
        /// This is the live, mutable model of the game board.
        /// </summary>
        public Grid GridState { get; set; }

        /// <summary>
        /// Player's current score in this level attempt.
        /// </summary>
        public int CurrentScore { get; set; }

        /// <summary>
        /// Time remaining for the level, if time-limited.
        /// Could be seconds or a TimeSpan. float for flexibility.
        /// </summary>
        public float TimeRemaining { get; set; }

        /// <summary>
        /// Number of moves made by the player in this attempt.
        /// </summary>
        public int MovesTaken { get; set; }

        /// <summary>
        /// List of paths currently drawn or completed on the grid for this level.
        /// </summary>
        public List<Path> ActivePaths { get; set; }
        
        public LevelData()
        {
            ActivePaths = new List<Path>();
        }
    }
}