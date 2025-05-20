using UnityEngine;
using GlyphPuzzle.Mobile.DomainLogic.Settings; // For AccessibilitySettingsSO
using GlyphPuzzle.Mobile.Core.Enums;         // For CatalystInputType
using GlyphPuzzle.Mobile.Presentation.Gameplay; // For CatalystGlyph

#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.DomainLogic.Settings { public class AccessibilitySettingsSO : ScriptableObject { public float CatalystTimerMultiplier; public bool IsCatalystTimerDisabled; public Core.Enums.CatalystInputType CatalystInputMethod; } }
// namespace GlyphPuzzle.Mobile.Core.Enums { public enum CatalystInputType { Tap, SelectAndConfirm } }
// namespace GlyphPuzzle.Mobile.Presentation.Gameplay { public class CatalystGlyph : MonoBehaviour { /* ... */ } }
#endif

namespace GlyphPuzzle.Mobile.DomainLogic.Accessibility
{
    /// <summary>
    /// Encapsulates the logic for applying accessibility settings to Catalyst glyph interactions.
    /// Provides methods to calculate effective timer durations and validate activation. (REQ-ACC-001)
    /// </summary>
    public class CatalystAccessibilityLogic
    {
        /// <summary>
        /// Calculates the effective duration for a Catalyst based on accessibility settings.
        /// </summary>
        /// <param name="baseDuration">The base duration of the Catalyst timer in seconds.</param>
        /// <param name="settings">The current accessibility settings.</param>
        /// <returns>The effective duration. Returns float.MaxValue if the timer is disabled.</returns>
        public float GetEffectiveCatalystDuration(float baseDuration, AccessibilitySettingsSO settings)
        {
            if (settings == null) return baseDuration;

            if (settings.IsCatalystTimerDisabled) // REQ-ACC-001.2
            {
                return float.MaxValue; // Timer is effectively infinite (disabled)
            }

            // REQ-ACC-001.1
            return baseDuration * settings.CatalystTimerMultiplier;
        }

        /// <summary>
        /// Validates if a Catalyst activation attempt is valid based on the input method used,
        /// time since spawn, and current accessibility settings.
        /// </summary>
        /// <param name="catalyst">The Catalyst glyph being interacted with.</param>
        /// <param name="inputMethodUsed">The input method the player actually used for this attempt.</param>
        /// <param name="timeSinceSpawn">Time in seconds since the Catalyst spawned.</param>
        /// <param name="settings">The current accessibility settings.</param>
        /// <returns>True if the activation is valid, false otherwise.</returns>
        public bool IsCatalystActivationValid(CatalystGlyph catalyst, CatalystInputType inputMethodUsed, float timeSinceSpawn, AccessibilitySettingsSO settings)
        {
            if (catalyst == null || settings == null) return false;

            // Check if within effective time limit (if applicable)
            float effectiveDuration = GetEffectiveCatalystDuration(5.0f, settings); // Assuming a base duration of 5s for example
            if (timeSinceSpawn > effectiveDuration)
            {
                // Debug.Log("Catalyst activation failed: Timer expired.");
                return false; // Too late, regardless of input method
            }

            // REQ-ACC-001.3: Validate against the configured input method
            if (settings.CatalystInputMethod == CatalystInputType.Tap)
            {
                // If configured for Tap, any tap (inputMethodUsed == Tap) is valid if within time.
                // (TapInputHandler would typically only send Tap events, so inputMethodUsed should match)
                return inputMethodUsed == CatalystInputType.Tap;
            }
            else if (settings.CatalystInputMethod == CatalystInputType.SelectAndConfirm)
            {
                // If configured for SelectAndConfirm, the interaction flow is more complex.
                // TapInputHandler might raise a "CellSelected" event first, then a "Confirm" action.
                // This method here would be called upon the "Confirm" action.
                // For now, assume if `inputMethodUsed` is `SelectAndConfirm`, it implies the full sequence was attempted.
                // The `TapInputHandler` and `CatalystInteractionService` would need to manage the two-step process.
                // This simple boolean might not be enough; state (e.g., "isCatalystSelected") might be needed.
                // Let's assume for now that `inputMethodUsed == CatalystInputType.SelectAndConfirm` means the player
                // has completed the "confirm" step of that method.
                return inputMethodUsed == CatalystInputType.SelectAndConfirm; 
            }
            
            return false; // Should not happen if enum is exhaustive
        }
    }
}