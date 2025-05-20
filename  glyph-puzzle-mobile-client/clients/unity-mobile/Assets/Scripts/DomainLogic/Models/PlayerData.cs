using System.Collections.Generic;
using GlyphPuzzle.Mobile.Core.Enums; // For CatalystInputType

// Placeholder for AccessibilitySettingsDataModel for compilation
#if UNITY_EDITOR && !PLAYERDATA_ACCESSIBILITYMODEL_DEFINED
#define PLAYERDATA_ACCESSIBILITYMODEL_DEFINED
namespace GlyphPuzzle.Mobile.DomainLogic.Models
{
    [System.Serializable]
    public class AccessibilitySettingsDataModel
    {
        public float CatalystTimerMultiplier = 1.0f;
        public bool IsCatalystTimerDisabled = false;
        public CatalystInputType CatalystInputMethod = CatalystInputType.Tap;
    }
}
#endif


namespace GlyphPuzzle.Mobile.DomainLogic.Models
{
    /// <summary>
    /// Represents the persistent data for a player.
    /// This class is serialized/deserialized by the SaveLoadManager.
    /// Implements REQ-CGLE-001, REQ-ACC-010, REQ-PDP-002.
    /// </summary>
    [System.Serializable] // Make it serializable for SaveLoadManager
    public class PlayerData
    {
        public string PlayerId;

        public HashSet<string> CompletedLevelIds;
        public HashSet<string> UnlockedZoneIds;

        public Dictionary<string, int> LevelHighScores;
        public Dictionary<string, int> LevelStarRatings;

        /// <summary>
        /// Serializable form of AccessibilitySettingsSO data. (REQ-ACC-010)
        /// </summary>
        public AccessibilitySettingsDataModel AccessibilitySettingsData;

        public PlayerData()
        {
            // Initialize collections to prevent null reference exceptions
            CompletedLevelIds = new HashSet<string>();
            UnlockedZoneIds = new HashSet<string>();
            LevelHighScores = new Dictionary<string, int>();
            LevelStarRatings = new Dictionary<string, int>();
            AccessibilitySettingsData = new AccessibilitySettingsDataModel(); // Default settings
        }
    }
}