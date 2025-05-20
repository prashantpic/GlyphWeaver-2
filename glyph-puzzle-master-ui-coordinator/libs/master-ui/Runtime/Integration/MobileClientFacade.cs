using GlyphPuzzle.UI.Coordinator.State;
using System;
using System.Threading.Tasks;
using UnityEngine; // For PlayerPrefs and Debug

namespace GlyphPuzzle.UI.Coordinator.Integration
{
    /// <summary>
    /// Provides a simplified and controlled interface for the UI Coordinator
    /// to request persistence of UI-related settings and tutorial state
    /// via the main mobile client application (REPO-MOBILE-CLIENT).
    /// This is a placeholder implementation using PlayerPrefs.
    /// </summary>
    public class MobileClientFacade
    {
        private const string UISettingsKey = "GlyphPuzzle_UISettings";
        private const string TutorialProgressKey = "GlyphPuzzle_TutorialProgress";

        /// <summary>
        /// Asynchronously loads the player's UI settings.
        /// (Placeholder implementation using PlayerPrefs).
        /// </summary>
        /// <returns>A task that resolves to the loaded <see cref="UISettingsState"/>.</returns>
        public Task<UISettingsState> LoadPlayerUISettingsAsync()
        {
            // In a real scenario, this would call into REPO-MOBILE-CLIENT's persistence layer.
            // For this placeholder, we use PlayerPrefs.
            if (PlayerPrefs.HasKey(UISettingsKey))
            {
                string json = PlayerPrefs.GetString(UISettingsKey);
                try
                {
                    UISettingsState settings = JsonUtility.FromJson<UISettingsState>(json);
                    Debug.Log("[MobileClientFacade] Loaded Player UI Settings from PlayerPrefs.");
                    return Task.FromResult(settings);
                }
                catch (Exception ex)
                {
                    Debug.LogError($"[MobileClientFacade] Error deserializing UI settings: {ex.Message}. Returning default.");
                    return Task.FromResult(new UISettingsState()); // Return default or a newly constructed state
                }
            }
            Debug.Log("[MobileClientFacade] No Player UI Settings found in PlayerPrefs. Returning default.");
            return Task.FromResult(new UISettingsState()); // Default state
        }

        /// <summary>
        /// Asynchronously saves the player's UI settings.
        /// (Placeholder implementation using PlayerPrefs).
        /// </summary>
        /// <param name="settings">The <see cref="UISettingsState"/> to save.</param>
        /// <returns>A task representing the save operation.</returns>
        public Task SavePlayerUISettingsAsync(UISettingsState settings)
        {
            // In a real scenario, this would call into REPO-MOBILE-CLIENT's persistence layer.
            try
            {
                string json = JsonUtility.ToJson(settings);
                PlayerPrefs.SetString(UISettingsKey, json);
                PlayerPrefs.Save(); // Ensure data is written to disk (use with caution on frequent calls)
                Debug.Log("[MobileClientFacade] Saved Player UI Settings to PlayerPrefs.");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[MobileClientFacade] Error serializing UI settings: {ex.Message}");
                return Task.FromException(ex);
            }
            return Task.CompletedTask;
        }

        /// <summary>
        /// Asynchronously loads the player's tutorial progress.
        /// (Placeholder implementation using PlayerPrefs).
        /// </summary>
        /// <returns>A task that resolves to the loaded <see cref="TutorialFlowState"/>.</returns>
        public Task<TutorialFlowState> LoadTutorialProgressAsync()
        {
            // In a real scenario, this would call into REPO-MOBILE-CLIENT's persistence layer.
            if (PlayerPrefs.HasKey(TutorialProgressKey))
            {
                string json = PlayerPrefs.GetString(TutorialProgressKey);
                try
                {
                    TutorialFlowState tutorialState = JsonUtility.FromJson<TutorialFlowState>(json);
                     // JsonUtility doesn't handle HashSet directly, so re-initialize if needed or use a list then convert.
                    if (tutorialState.CompletedTutorials == null)
                    {
                        tutorialState.CompletedTutorials = new System.Collections.Generic.HashSet<string>();
                    }
                    Debug.Log("[MobileClientFacade] Loaded Tutorial Progress from PlayerPrefs.");
                    return Task.FromResult(tutorialState);
                }
                catch (Exception ex)
                {
                    Debug.LogError($"[MobileClientFacade] Error deserializing tutorial progress: {ex.Message}. Returning default.");
                     return Task.FromResult(new TutorialFlowState());
                }
            }
            Debug.Log("[MobileClientFacade] No Tutorial Progress found in PlayerPrefs. Returning default.");
            return Task.FromResult(new TutorialFlowState()); // Default state
        }

        /// <summary>
        /// Asynchronously saves the player's tutorial progress.
        /// (Placeholder implementation using PlayerPrefs).
        /// </summary>
        /// <param name="tutorialState">The <see cref="TutorialFlowState"/> to save.</param>
        /// <returns>A task representing the save operation.</returns>
        public Task SaveTutorialProgressAsync(TutorialFlowState tutorialState)
        {
            // In a real scenario, this would call into REPO-MOBILE-CLIENT's persistence layer.
            try
            {
                // JsonUtility doesn't serialize HashSet well.
                // A common workaround is to convert to List<string> for serialization.
                // For this placeholder, if TutorialFlowState is simple fields, it might work.
                // If CompletedTutorials is a List<string> in TutorialFlowState, it's fine.
                // If it's HashSet, you'd need a DTO or custom serialization.
                // Assuming TutorialFlowState is designed to be JsonUtility-friendly for this placeholder.
                string json = JsonUtility.ToJson(tutorialState);
                PlayerPrefs.SetString(TutorialProgressKey, json);
                PlayerPrefs.Save();
                Debug.Log("[MobileClientFacade] Saved Tutorial Progress to PlayerPrefs.");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[MobileClientFacade] Error serializing tutorial progress: {ex.Message}");
                return Task.FromException(ex);
            }
            return Task.CompletedTask;
        }
    }
}