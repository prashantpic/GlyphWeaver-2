using System;
using System.Collections.Generic;
using System.Linq;
using GlyphPuzzle.Mobile.DomainLogic.Models;    // For PlayerData, ZoneData, LevelProgressionData
using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For ZoneDefinitionSO, LevelDefinitionSO
using GlyphPuzzle.Mobile.DomainLogic.Gameplay;  // For ZoneUnlockLogic
using GlyphPuzzle.Mobile.Infrastructure.DataPersistence; // For SaveLoadManager
using UnityEngine; // For Debug.Log and potentially if this becomes a MonoBehaviour for easy access

// Placeholder for LevelProgressionData for compilation within this file structure
#if UNITY_EDITOR && !PLAYERPROGRESSIONSERVICE_LEVELPROGRESSIONDATA_DEFINED
#define PLAYERPROGRESSIONSERVICE_LEVELPROGRESSIONDATA_DEFINED
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


namespace GlyphPuzzle.Mobile.ApplicationServices
{
    /// <summary>
    /// Manages all aspects of player progression.
    /// Tracks unlocked zones, completed levels, scores, and star ratings.
    /// Interfaces with SaveLoadManager for persistence.
    /// Implements REQ-CGLE-001, REQ-UIUX-002.
    /// </summary>
    public class PlayerProgressionService
    {
        private PlayerData playerData;
        private readonly ZoneUnlockLogic zoneUnlockLogic;
        private readonly List<ZoneDefinitionSO> allZoneDefinitions; // Assuming these are loaded from resources or injected
        private readonly List<LevelDefinitionSO> allLevelDefinitions;

        /// <summary>
        /// Event raised when progression data changes.
        /// </summary>
        public event Action OnProgressionUpdated;

        public PlayerProgressionService(List<ZoneDefinitionSO> allZones = null, List<LevelDefinitionSO> allLevels = null) // Dependencies
        {
            zoneUnlockLogic = new ZoneUnlockLogic();
            
            // In a real game, these definitions would be loaded from AssetBundles, Addressables, or Resources.
            // For this example, they can be passed in or loaded if this service is more integrated.
            this.allZoneDefinitions = allZones ?? LoadAllZoneDefinitions();
            this.allLevelDefinitions = allLevels ?? LoadAllLevelDefinitions();

            LoadProgression();
        }

        private List<ZoneDefinitionSO> LoadAllZoneDefinitions()
        {
            // Example: Resources.LoadAll<ZoneDefinitionSO>("Path/To/ZoneDefinitions");
            // This is a simplification. A robust system would use Addressables or another asset management strategy.
            return new List<ZoneDefinitionSO>(Resources.FindObjectsOfTypeAll<ZoneDefinitionSO>());
        }
        private List<LevelDefinitionSO> LoadAllLevelDefinitions()
        {
            return new List<LevelDefinitionSO>(Resources.FindObjectsOfTypeAll<LevelDefinitionSO>());
        }


        private void LoadProgression()
        {
            playerData = SaveLoadManager.LoadPlayerData();
            if (playerData == null)
            {
                playerData = new PlayerData
                {
                    PlayerId = System.Guid.NewGuid().ToString(), // Generate a new player ID
                    CompletedLevelIds = new HashSet<string>(),
                    UnlockedZoneIds = new HashSet<string>(),
                    LevelHighScores = new Dictionary<string, int>(),
                    LevelStarRatings = new Dictionary<string, int>(),
                    AccessibilitySettingsData = new AccessibilitySettingsDataModel() // Default accessibility settings
                };
                // Potentially unlock the first zone by default
                UnlockInitialZone();
                SaveProgression();
            }
        }
        
        private void UnlockInitialZone()
        {
            // Example: Unlock the first zone (e.g., lowest SortOrder or specific ID)
            var firstZone = allZoneDefinitions?.OrderBy(z => z.SortOrder).FirstOrDefault();
            if (firstZone != null)
            {
                playerData.UnlockedZoneIds.Add(firstZone.ZoneId);
            }
        }


        private void SaveProgression()
        {
            SaveLoadManager.SavePlayerData(playerData);
            OnProgressionUpdated?.Invoke();
        }

        /// <summary>
        /// Checks if a specific zone is unlocked for the player.
        /// </summary>
        /// <param name="zoneId">The ID of the zone to check.</param>
        /// <returns>True if the zone is unlocked, false otherwise.</returns>
        public bool IsZoneUnlocked(string zoneId)
        {
            if (playerData.UnlockedZoneIds.Contains(zoneId))
            {
                return true;
            }

            ZoneDefinitionSO zoneToUnlock = allZoneDefinitions.FirstOrDefault(z => z.ZoneId == zoneId);
            if (zoneToUnlock != null && zoneUnlockLogic.CanUnlockZone(zoneToUnlock, playerData))
            {
                playerData.UnlockedZoneIds.Add(zoneId);
                SaveProgression();
                return true;
            }
            return false;
        }

        /// <summary>
        /// Marks a level as completed, updates score, stars, and checks for new zone unlocks.
        /// </summary>
        /// <param name="levelId">The ID of the completed level.</param>
        /// <param name="score">The score achieved on the level.</param>
        /// <param name="stars">The number of stars earned.</param>
        public void CompleteLevel(string levelId, int score, int stars)
        {
            playerData.CompletedLevelIds.Add(levelId);

            if (!playerData.LevelHighScores.ContainsKey(levelId) || score > playerData.LevelHighScores[levelId])
            {
                playerData.LevelHighScores[levelId] = score;
            }

            if (!playerData.LevelStarRatings.ContainsKey(levelId) || stars > playerData.LevelStarRatings[levelId])
            {
                playerData.LevelStarRatings[levelId] = stars;
            }
            
            // After completing a level, check if any new zones are unlocked
            foreach (var zoneDef in allZoneDefinitions)
            {
                if (!playerData.UnlockedZoneIds.Contains(zoneDef.ZoneId))
                {
                    if (zoneUnlockLogic.CanUnlockZone(zoneDef, playerData))
                    {
                        playerData.UnlockedZoneIds.Add(zoneDef.ZoneId);
                    }
                }
            }

            SaveProgression();
        }

        /// <summary>
        /// Retrieves progression data for a specific level.
        /// </summary>
        /// <param name="levelId">The ID of the level.</param>
        /// <returns>LevelProgressionData for the level.</returns>
        public LevelProgressionData GetLevelProgression(string levelId)
        {
            LevelDefinitionSO levelDef = allLevelDefinitions.FirstOrDefault(l => l.LevelId == levelId);
            if (levelDef == null) return new LevelProgressionData { LevelId = levelId, IsUnlocked = false };

            // Determine if the zone containing this level is unlocked
            bool zoneUnlocked = IsZoneUnlocked(levelDef.ZoneId);
            bool isLevelUnlocked = zoneUnlocked; // Base unlock on zone

            // More sophisticated: A level might depend on previous level completion within the same zone.
            // For now, if zone is unlocked, assume levels are sequentially unlocked or all available.
            // Actual level unlock logic might be:
            // isLevelUnlocked = zoneUnlocked && (IsFirstLevelInZone(levelDef) || HasCompletedPreviousLevel(levelDef));


            return new LevelProgressionData
            {
                LevelId = levelId,
                StarsEarned = playerData.LevelStarRatings.TryGetValue(levelId, out int stars) ? stars : 0,
                HighScore = playerData.LevelHighScores.TryGetValue(levelId, out int score) ? score : 0,
                IsCompleted = playerData.CompletedLevelIds.Contains(levelId),
                IsUnlocked = isLevelUnlocked // Simplified, should consider specific level unlock conditions
            };
        }

        /// <summary>
        /// Retrieves data for all zones, including player's progress within them. REQ-UIUX-002
        /// </summary>
        /// <returns>A list of ZoneData objects.</returns>
        public List<ZoneData> GetAllZoneDataWithProgress()
        {
            List<ZoneData> result = new List<ZoneData>();
            if (allZoneDefinitions == null) return result;

            foreach (ZoneDefinitionSO zoneDef in allZoneDefinitions.OrderBy(z => z.SortOrder))
            {
                int levelsCompletedInZone = 0;
                int totalLevelsInZone = zoneDef.LevelsInZone?.Count ?? 0;

                if (zoneDef.LevelsInZone != null)
                {
                    foreach (LevelDefinitionSO levelDef in zoneDef.LevelsInZone)
                    {
                        if (playerData.CompletedLevelIds.Contains(levelDef.LevelId))
                        {
                            levelsCompletedInZone++;
                        }
                    }
                }
                
                result.Add(new ZoneData
                {
                    Definition = zoneDef,
                    IsUnlocked = IsZoneUnlocked(zoneDef.ZoneId), // This might unlock it if criteria met
                    LevelsCompleted = levelsCompletedInZone,
                    TotalLevels = totalLevelsInZone
                });
            }
            return result;
        }

        public void ResetProgression()
        {
            playerData = new PlayerData
            {
                PlayerId = playerData?.PlayerId ?? System.Guid.NewGuid().ToString(), // Keep player ID or make new
                CompletedLevelIds = new HashSet<string>(),
                UnlockedZoneIds = new HashSet<string>(),
                LevelHighScores = new Dictionary<string, int>(),
                LevelStarRatings = new Dictionary<string, int>(),
                // Keep accessibility settings or reset them too? For now, keep.
                AccessibilitySettingsData = playerData?.AccessibilitySettingsData ?? new AccessibilitySettingsDataModel() 
            };
            UnlockInitialZone();
            SaveProgression();
            Debug.Log("Player progression has been reset.");
        }
    }
}