using UnityEngine;
using System.Collections.Generic;
using GlyphPuzzle.UI.Coordinator.State;

namespace GlyphPuzzle.UI.Coordinator.Config
{
    /// <summary>
    /// ScriptableObject for global UI coordinator configurations,
    /// such as default language, themes, and fallback UXML path.
    /// </summary>
    [CreateAssetMenu(fileName = "UICoordinatorSettings", menuName = "GlyphPuzzle/UI Coordinator/Settings")]
    public class UICoordinatorSettings : ScriptableObject
    {
        /// <summary>
        /// Initial language code (e.g., 'en', 'fr-CA').
        /// This should match a code known by Unity Localization.
        /// </summary>
        [Tooltip("Initial language code (e.g., 'en', 'fr-CA'). Must match a code in Unity Localization settings.")]
        public string DefaultLanguageCode = "en";

        /// <summary>
        /// List of all available theme assets.
        /// </summary>
        [Tooltip("List of all available ThemeDefinition assets.")]
        public List<ThemeDefinition> AvailableThemes = new List<ThemeDefinition>();

        /// <summary>
        /// Name of the theme to apply on startup. Must match a ThemeName in one of the AvailableThemes.
        /// </summary>
        [Tooltip("Name of the theme to apply on startup. Must match a ThemeName in one of the AvailableThemes.")]
        public string DefaultThemeName;

        /// <summary>
        /// Path to a fallback UXML VisualTreeAsset for error states or when a screen fails to load.
        /// This path is typically an Addressables key or a Resources path.
        /// </summary>
        [Tooltip("Path (Addressables key or Resources path) to a fallback UXML for error states.")]
        public string FallbackUXMLPath;
    }
}