using System;
using UnityEngine;
using GlyphPuzzle.Mobile.DomainLogic.Settings; // For AccessibilitySettingsSO
using GlyphPuzzle.Mobile.DomainLogic.Accessibility; // For CatalystAccessibilityLogic
using GlyphPuzzle.Mobile.Presentation.Gameplay; // For CatalystGlyph (placeholder)
using System.Collections.Generic; // For List

// Placeholders if not defined elsewhere
#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.DomainLogic.Settings { public class AccessibilitySettingsSO : ScriptableObject { /* ... */ } }
// namespace GlyphPuzzle.Mobile.DomainLogic.Accessibility { public class CatalystAccessibilityLogic { public float GetEffectiveCatalystDuration(float bd, AccessibilitySettingsSO s) => bd; public bool IsCatalystActivationValid(CatalystGlyph c, Core.Enums.CatalystInputType cit, float ts, AccessibilitySettingsSO s) => true; } }
// namespace GlyphPuzzle.Mobile.Presentation.Gameplay { public class CatalystGlyph : MonoBehaviour { public float SpawnTime; public Vector2Int Position; /* ... */ } }
// namespace GlyphPuzzle.Mobile.Core.Enums { public enum CatalystInputType { Tap, SelectAndConfirm } }
#endif

namespace GlyphPuzzle.Mobile.ApplicationServices
{
    /// <summary>
    /// Manages all aspects of Catalyst glyph interactions and their accessibility modifications.
    /// Handles spawn, tap detection, timer management, and score bonuses.
    /// Implements REQ-ACC-001, REQ-CGLE-025, REQ-UIUX-005.
    /// </summary>
    public class CatalystInteractionService
    {
        // Injected or assigned dependencies
        public AccessibilitySettingsSO AccessibilitySettings { get; set; }
        public CatalystAccessibilityLogic CatalystAccessibilityLogic { get; set; }

        /// <summary>
        /// Event raised when a Catalyst is successfully activated. Parameters: (CatalystGlyph, scoreBonus).
        /// </summary>
        public event Action<CatalystGlyph, int> OnCatalystActivated;

        /// <summary>
        /// Event raised when a Catalyst is missed (e.g., timer expires or invalid tap).
        /// </summary>
        public event Action<CatalystGlyph> OnCatalystMissed;

        private List<CatalystGlyph> activeCatalysts = new List<CatalystGlyph>();
        // In a MonoBehaviour version, this could be a Coroutine for UpdateCatalystTimers
        // For a plain C# class, something external (like GameManager's Update) must call UpdateCatalystTimers.

        public CatalystInteractionService(AccessibilitySettingsSO settings, CatalystAccessibilityLogic logic)
        {
            this.AccessibilitySettings = settings;
            this.CatalystAccessibilityLogic = logic;

            if (this.AccessibilitySettings != null)
            {
                 // Optionally subscribe to settings changes if timers need dynamic updates
                 // this.AccessibilitySettings.OnSettingsChanged += HandleSettingsChanged;
            }
        }

        /// <summary>
        /// Handles a tap event on a Catalyst glyph.
        /// </summary>
        /// <param name="tappedCatalyst">The Catalyst glyph that was tapped.</param>
        public void HandleCatalystTap(CatalystGlyph tappedCatalyst)
        {
            if (tappedCatalyst == null || !activeCatalysts.Contains(tappedCatalyst) || 
                AccessibilitySettings == null || CatalystAccessibilityLogic == null)
            {
                return;
            }

            float timeSinceSpawn = Time.time - tappedCatalyst.SpawnTime; // Assuming CatalystGlyph has SpawnTime
            
            // Using the CatalystInputType from settings for validation.
            // The TapInputHandler just reports a tap; this service decides if it's valid for the current mode.
            bool isValid = CatalystAccessibilityLogic.IsCatalystActivationValid(
                tappedCatalyst,
                AccessibilitySettings.CatalystInputMethod, // This is the configured method
                timeSinceSpawn,
                AccessibilitySettings
            );

            if (isValid)
            {
                // Example score bonus
                int scoreBonus = 100; 
                OnCatalystActivated?.Invoke(tappedCatalyst, scoreBonus);
                activeCatalysts.Remove(tappedCatalyst);
                GameObject.Destroy(tappedCatalyst.gameObject); // Assuming it's a MonoBehaviour that should be removed
                Debug.Log($"Catalyst {tappedCatalyst.name} activated! Score bonus: {scoreBonus}");
            }
            else
            {
                // Invalid tap (e.g. wrong input type for current setting, or other custom logic in IsCatalystActivationValid)
                // This might not be a "miss" in the sense of timeout, but an incorrect interaction.
                // Depending on game design, this might trigger a negative feedback or just be ignored.
                // For now, let's consider it a miss if not valid.
                OnCatalystMissed?.Invoke(tappedCatalyst);
                // Do not remove or destroy yet, timer might still be running for 'Tap' mode if 'SelectAndConfirm' was attempted.
                // Or, if IsCatalystActivationValid implies it's fully invalid, then remove.
                // Let's assume IsCatalystActivationValid handles the finality. If it returns false, the interaction is over.
                Debug.LogWarning($"Catalyst {tappedCatalyst.name} tap was invalid.");
            }
        }

        /// <summary>
        /// Spawns a new Catalyst glyph at the given position.
        /// </summary>
        /// <param name="position">The grid position to spawn the Catalyst.</param>
        /// <param name="catalystPrefab">The prefab to instantiate for the Catalyst.</param>
        /// <returns>The spawned CatalystGlyph instance, or null if spawn failed.</returns>
        public CatalystGlyph SpawnCatalyst(Vector2Int position, GameObject catalystPrefab)
        {
            if (catalystPrefab == null)
            {
                Debug.LogError("Catalyst prefab is null.");
                return null;
            }
            
            // Instantiate the prefab. Positioning logic depends on grid system.
            // Vector3 worldPosition = GridManager.GridToWorldPosition(position); // Example
            GameObject catalystGO = GameObject.Instantiate(catalystPrefab, new Vector3(position.x, position.y, 0), Quaternion.identity);
            CatalystGlyph newCatalyst = catalystGO.GetComponent<CatalystGlyph>();

            if (newCatalyst != null)
            {
                newCatalyst.SpawnTime = Time.time;
                newCatalyst.GridPosition = position; // Assuming CatalystGlyph has these properties
                activeCatalysts.Add(newCatalyst);
                Debug.Log($"Catalyst spawned at {position}");
                return newCatalyst;
            }
            else
            {
                Debug.LogError($"Spawned object at {position} is not a CatalystGlyph.");
                GameObject.Destroy(catalystGO);
                return null;
            }
        }

        /// <summary>
        /// Called regularly (e.g., every frame or fixed update) to update active Catalyst timers.
        /// </summary>
        public void UpdateCatalystTimers()
        {
            if (AccessibilitySettings == null || CatalystAccessibilityLogic == null) return;

            // Iterate backwards for safe removal
            for (int i = activeCatalysts.Count - 1; i >= 0; i--)
            {
                CatalystGlyph catalyst = activeCatalysts[i];
                if (catalyst == null) // Should not happen if list is managed well
                {
                    activeCatalysts.RemoveAt(i);
                    continue;
                }

                float baseDuration = 5.0f; // Example: Base duration for a catalyst
                float effectiveDuration = CatalystAccessibilityLogic.GetEffectiveCatalystDuration(baseDuration, AccessibilitySettings);

                if (Time.time - catalyst.SpawnTime > effectiveDuration)
                {
                    // Timer expired
                    OnCatalystMissed?.Invoke(catalyst);
                    activeCatalysts.RemoveAt(i);
                    GameObject.Destroy(catalyst.gameObject); // Clean up
                    Debug.Log($"Catalyst {catalyst.name} at {catalyst.GridPosition} missed (timer expired).");
                }
            }
        }
        
        // private void HandleSettingsChanged()
        // {
        //     // If settings change, active catalyst timers might need re-evaluation.
        //     // This could be complex if timers are already running.
        //     // For simplicity, new settings usually apply to newly spawned catalysts
        //     // or one might iterate activeCatalysts and adjust their effective end times.
        //     Debug.Log("Accessibility settings changed, Catalyst timers might be affected.");
        // }

        public void ClearAllCatalysts()
        {
            for (int i = activeCatalysts.Count - 1; i >= 0; i--)
            {
                if (activeCatalysts[i] != null && activeCatalysts[i].gameObject != null)
                {
                    GameObject.Destroy(activeCatalysts[i].gameObject);
                }
            }
            activeCatalysts.Clear();
        }
    }
}