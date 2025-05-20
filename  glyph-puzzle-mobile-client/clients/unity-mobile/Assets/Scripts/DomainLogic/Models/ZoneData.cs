using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For ZoneDefinitionSO

#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels
// {
//     // public class ZoneDefinitionSO : UnityEngine.ScriptableObject { /* ... */ }
// }
#endif

namespace GlyphPuzzle.Mobile.DomainLogic.Models
{
    /// <summary>
    /// Runtime data representation of a Zone, including player progress.
    /// Typically created by PlayerProgressionService.
    /// Used by LevelSelectionScreenController.
    /// Implements REQ-CGLE-001, REQ-UIUX-002.
    /// </summary>
    public class ZoneData
    {
        /// <summary>
        /// Static definition of the zone.
        /// </summary>
        public ZoneDefinitionSO Definition { get; set; }

        /// <summary>
        /// Whether the player has unlocked this zone.
        /// </summary>
        public bool IsUnlocked { get; set; }

        /// <summary>
        /// Number of levels completed by the player in this zone. (REQ-UIUX-002)
        /// </summary>
        public int LevelsCompleted { get; set; }

        /// <summary>
        /// Total number of levels in this zone. (REQ-UIUX-002)
        /// </summary>
        public int TotalLevels { get; set; }
    }
}