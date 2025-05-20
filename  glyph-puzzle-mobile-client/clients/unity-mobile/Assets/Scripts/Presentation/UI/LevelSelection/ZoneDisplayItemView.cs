using UnityEngine;
using TMPro;
using System.Collections.Generic;
using GlyphPuzzle.Mobile.DomainLogic.Models;    // For ZoneData, LevelProgressionData
using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For LevelDefinitionSO

// Placeholder for LevelProgressionData if not defined elsewhere
#if UNITY_EDITOR // To avoid duplicate definition errors if defined globally for thought process
// namespace GlyphPuzzle.Mobile.DomainLogic.Models
// {
//     [System.Serializable]
//     public class LevelProgressionData
//     {
//         public string LevelId;
//         public int StarsEarned;
//         public int HighScore;
//         public bool IsUnlocked;
//         public bool IsCompleted;
//     }
// }
#endif


namespace GlyphPuzzle.Mobile.Presentation.UI.LevelSelection
{
    /// <summary>
    /// Manages the view for a single game zone in the level selection menu.
    /// Populates UI elements with zone data and instantiates LevelButtonView for each level.
    /// Implements REQ-CGLE-001, REQ-UIUX-002.
    /// </summary>
    public class ZoneDisplayItemView : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private TextMeshProUGUI zoneNameText;
        [SerializeField] private Transform levelButtonContainer;
        [SerializeField] private TextMeshProUGUI zoneProgressText; // REQ-UIUX-002

        [Header("Prefabs")]
        [SerializeField] private LevelButtonView levelButtonPrefab;

        private ZoneData currentZoneData;

        /// <summary>
        /// Initializes the view with zone data and its level progressions.
        /// </summary>
        /// <param name="zoneData">The data for the zone to display.</param>
        /// <param name="levelProgressions">Progression data for levels within this zone.</param>
        public void Initialize(ZoneData zoneData, List<LevelProgressionData> levelProgressions)
        {
            currentZoneData = zoneData;

            if (zoneData == null || zoneData.Definition == null)
            {
                Debug.LogError("ZoneDisplayItemView: Invalid ZoneData provided.");
                gameObject.SetActive(false);
                return;
            }

            if (zoneNameText != null)
            {
                // Assuming ZoneNameKey is a localization key. For now, display it directly or use a placeholder.
                // zoneNameText.text = LocalizationService.GetString(zoneData.Definition.ZoneNameKey);
                zoneNameText.text = !string.IsNullOrEmpty(zoneData.Definition.ZoneNameKey) ? zoneData.Definition.ZoneNameKey : zoneData.Definition.ZoneId;
            }

            if (zoneProgressText != null) // REQ-UIUX-002
            {
                // Example: "Zone X: Y/Z completed"
                // This requires LevelsCompleted and TotalLevels from ZoneData, which are in the spec.
                zoneProgressText.text = $"Progress: {zoneData.LevelsCompleted}/{zoneData.TotalLevels}";
            }
            
            // Clear existing level buttons
            foreach (Transform child in levelButtonContainer)
            {
                Destroy(child.gameObject);
            }

            if (levelButtonPrefab == null)
            {
                Debug.LogError("LevelButtonPrefab is not assigned in ZoneDisplayItemView.");
                return;
            }

            if (zoneData.Definition.LevelsInZone != null)
            {
                foreach (LevelDefinitionSO levelDef in zoneData.Definition.LevelsInZone)
                {
                    if (levelDef == null) continue;

                    LevelButtonView buttonInstance = Instantiate(levelButtonPrefab, levelButtonContainer);
                    LevelProgressionData progress = levelProgressions.Find(p => p.LevelId == levelDef.LevelId);
                    
                    if (progress == null) // Should ideally always find one from PlayerProgressionService
                    {
                        progress = new LevelProgressionData { LevelId = levelDef.LevelId, IsUnlocked = false }; // Default if missing
                    }

                    // Determine if locked based on zone lock status and individual level dependencies (if any)
                    // For simplicity, assuming if zone is unlocked, first level is unlocked, or relies on PlayerProgressionData.IsUnlocked
                    bool isLevelLocked = !zoneData.IsUnlocked || !progress.IsUnlocked; 
                    
                    // A more robust lock check:
                    // bool isLevelLocked = !PlayerProgressionService.Instance.IsLevelUnlocked(levelDef.LevelId); // Example
                    
                    buttonInstance.Initialize(levelDef, progress, isLevelLocked);
                }
            }
        }
    }
}