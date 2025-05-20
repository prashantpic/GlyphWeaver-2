using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For ZoneDefinitionSO
using GlyphPuzzle.Mobile.DomainLogic.Models;    // For PlayerData
using System.Linq; // For LINQ operations like Any()

#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels { public class ZoneDefinitionSO : UnityEngine.ScriptableObject { public string ZoneId; public ZoneDefinitionSO RequiredPreviousZoneCompleted; /*...*/ } }
// namespace GlyphPuzzle.Mobile.DomainLogic.Models { public class PlayerData { public System.Collections.Generic.HashSet<string> CompletedLevelIds; public System.Collections.Generic.HashSet<string> UnlockedZoneIds; /*...*/ } }
#endif

namespace GlyphPuzzle.Mobile.DomainLogic.Gameplay
{
    /// <summary>
    /// Determines if a player is eligible to unlock a specific game zone.
    /// Encapsulates the rules that govern unlocking new game zones. (REQ-CGLE-001)
    /// </summary>
    public class ZoneUnlockLogic
    {
        /// <summary>
        /// Checks if the player can unlock the specified zone based on their progression.
        /// </summary>
        /// <param name="zoneToUnlock">The definition of the zone to check unlock conditions for.</param>
        /// <param name="playerData">The player's current progression data.</param>
        /// <returns>True if the zone can be unlocked, false otherwise.</returns>
        public bool CanUnlockZone(ZoneDefinitionSO zoneToUnlock, PlayerData playerData)
        {
            if (zoneToUnlock == null || playerData == null)
            {
                UnityEngine.Debug.LogError("ZoneUnlockLogic: Invalid input parameters.");
                return false;
            }

            // If the zone is already unlocked, no need to check again.
            if (playerData.UnlockedZoneIds.Contains(zoneToUnlock.ZoneId))
            {
                return true; // Or false if we are strictly checking if it *can be* unlocked now, not if it *is* unlocked.
                             // Let's assume this method is about "can it be unlocked now based on conditions".
            }

            // Check if a required previous zone must be completed.
            if (zoneToUnlock.RequiredPreviousZoneCompleted != null)
            {
                // The required previous zone must itself be unlocked.
                if (!playerData.UnlockedZoneIds.Contains(zoneToUnlock.RequiredPreviousZoneCompleted.ZoneId))
                {
                    return false; // Prerequisite zone not even unlocked.
                }

                // All levels in the required previous zone must be completed.
                bool allLevelsInPreviousZoneCompleted = true;
                if (zoneToUnlock.RequiredPreviousZoneCompleted.LevelsInZone != null &&
                    zoneToUnlock.RequiredPreviousZoneCompleted.LevelsInZone.Count > 0)
                {
                    foreach (LevelDefinitionSO levelInPrevZone in zoneToUnlock.RequiredPreviousZoneCompleted.LevelsInZone)
                    {
                        if (!playerData.CompletedLevelIds.Contains(levelInPrevZone.LevelId))
                        {
                            allLevelsInPreviousZoneCompleted = false;
                            break;
                        }
                    }
                } 
                // else if (zoneToUnlock.RequiredPreviousZoneCompleted.LevelsInZone == null || 
                //          zoneToUnlock.RequiredPreviousZoneCompleted.LevelsInZone.Count == 0)
                // {
                //     // If previous zone has no levels, it's considered 'completed' once unlocked.
                //     // This case might need clarification based on game design.
                // }


                if (!allLevelsInPreviousZoneCompleted)
                {
                    return false; // Not all levels in the prerequisite zone are completed.
                }
            }
            
            // Add other conditions here if specified in ZoneDefinitionSO.UnlockConditionDescriptionKey
            // For example, minimum total stars, specific achievement, etc.
            // The UnlockConditionDescriptionKey is for UI, actual logic here.
            // For now, only previous zone completion is implemented as a hard rule.

            // If all conditions pass:
            return true;
        }
    }
}