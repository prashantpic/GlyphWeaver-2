using UnityEngine;
using System.Collections.Generic;
using GlyphPuzzle.Mobile.ApplicationServices; // For PlayerProgressionService
using GlyphPuzzle.Mobile.DomainLogic.Models;  // For ZoneData, LevelProgressionData
using GlyphPuzzle.Mobile.Core; // For GameManager

// Placeholder for PlayerProgressionService if not a MonoBehaviour Singleton
// For this example, assume PlayerProgressionService is accessible, e.g. via a Service Locator or GameManager
// If it's a MonoBehaviour, it could be [SerializeField]
// For now, let's assume it's a plain C# class and we get an instance.

namespace GlyphPuzzle.Mobile.Presentation.UI.LevelSelection
{
    /// <summary>
    /// Manages the level selection screen, populating it with zones and levels.
    /// Fetches zone and level data from PlayerProgressionService.
    /// Instantiates ZoneDisplayItemView and LevelButtonView UI elements.
    /// Implements REQ-CGLE-001, REQ-UIUX-002.
    /// </summary>
    public class LevelSelectionScreenController : MonoBehaviour
    {
        [Header("UI Setup")]
        [Tooltip("Parent transform for instantiating zone UI elements.")]
        [SerializeField] private Transform zoneContainer;

        [Tooltip("Prefab for displaying a single zone.")]
        [SerializeField] private ZoneDisplayItemView zoneDisplayPrefab;

        // Assuming PlayerProgressionService is a plain C# class accessible via a central point or DI
        // For simplicity in this example, let's assume it's a Singleton or provided by GameManager.
        // If using a proper DI framework, this would be injected.
        private PlayerProgressionService playerProgressionService;

        void Awake()
        {
            // Obtain PlayerProgressionService instance.
            // This is a simplified way. In a larger project, use a service locator or DI.
            // Example: playerProgressionService = ServiceLocator.Get<PlayerProgressionService>();
            // For now, let's assume we new it up if it's simple or get from GameManager
            playerProgressionService = new PlayerProgressionService(); // Simplified
            // playerProgressionService.Initialize(SaveLoadManager.Instance); // If it needs init
        }

        /// <summary>
        /// Unity lifecycle. Refreshes the display when screen becomes active.
        /// </summary>
        void OnEnable()
        {
            PopulateLevelSelection();
        }

        /// <summary>
        /// Fetches zone and level data and populates the UI.
        /// </summary>
        public void PopulateLevelSelection()
        {
            if (zoneContainer == null || zoneDisplayPrefab == null)
            {
                Debug.LogError("LevelSelectionScreenController: UI references not set.");
                return;
            }

            if (playerProgressionService == null)
            {
                Debug.LogError("PlayerProgressionService not available.");
                // Attempt to re-initialize or fetch it.
                playerProgressionService = new PlayerProgressionService(); // Simplified retry
                if (playerProgressionService == null) return;
            }


            // Clear existing zone items
            foreach (Transform child in zoneContainer)
            {
                Destroy(child.gameObject);
            }

            List<ZoneData> allZoneData = playerProgressionService.GetAllZoneDataWithProgress();

            if (allZoneData == null || allZoneData.Count == 0)
            {
                Debug.LogWarning("No zone data found to display.");
                // Potentially display a "No levels available" message
                return;
            }

            // Sort zones by SortOrder if needed (assuming list from service is already sorted or ZoneData has SortOrder)
            // allZoneData.Sort((a, b) => a.Definition.SortOrder.CompareTo(b.Definition.SortOrder));


            foreach (ZoneData zoneData in allZoneData)
            {
                ZoneDisplayItemView zoneItemInstance = Instantiate(zoneDisplayPrefab, zoneContainer);
                
                // Fetch progression for levels in this zone
                List<LevelProgressionData> levelProgressions = new List<LevelProgressionData>();
                if (zoneData.Definition != null && zoneData.Definition.LevelsInZone != null)
                {
                    foreach (var levelDef in zoneData.Definition.LevelsInZone)
                    {
                        if (levelDef != null)
                        {
                             levelProgressions.Add(playerProgressionService.GetLevelProgression(levelDef.LevelId));
                        }
                    }
                }
                zoneItemInstance.Initialize(zoneData, levelProgressions);
            }
        }
    }
}