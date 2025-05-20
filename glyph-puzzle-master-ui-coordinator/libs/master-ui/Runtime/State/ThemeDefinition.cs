using UnityEngine;
using UnityEngine.UIElements;
using System.Collections.Generic;

namespace GlyphPuzzle.UI.Coordinator.State
{
    /// <summary>
    /// Defines the visual attributes of a UI theme, loadable and applicable by the MasterThemeService.
    /// Implemented as a ScriptableObject for easy editing in the Unity Editor.
    /// Implemented Features: ThemeDataStorage, StyleSheetManagement, AccessibilityVariations
    /// Relevant Requirements: REQ-UIUX-009, REQ-ACC-002
    /// </summary>
    [CreateAssetMenu(fileName = "ThemeDefinition", menuName = "GlyphPuzzle/UI Coordinator/Theme Definition")]
    public class ThemeDefinition : ScriptableObject
    {
        /// <summary>
        /// Unique identifier for the theme (e.g., "DefaultDark", "HighContrastLight").
        /// </summary>
        [Tooltip("Unique identifier for the theme (e.g., \"DefaultDark\", \"HighContrastLight\").")]
        public string ThemeName;

        /// <summary>
        /// Primary stylesheet (.uss file) for this theme.
        /// </summary>
        [Tooltip("Primary stylesheet (.uss file) for this theme.")]
        public StyleSheet BaseStyleSheet;

        /// <summary>
        /// Reference to a ScriptableObject defining colors (e.g., semantic color palette).
        /// The actual type of this ScriptableObject would be custom-defined to hold color data.
        /// </summary>
        [Tooltip("Reference to a ScriptableObject defining the theme's color palette.")]
        public ScriptableObject ColorPaletteAsset; // Placeholder: Create a specific SO type like "ColorPaletteSO"

        /// <summary>
        /// Reference to a ScriptableObject defining font styles and assets for this theme.
        /// The actual type of this ScriptableObject would be custom-defined.
        /// </summary>
        [Tooltip("Reference to a ScriptableObject defining font styles and assets for this theme.")]
        public ScriptableObject FontSettingsAsset; // Placeholder: Create a specific SO type like "FontSettingsSO"

        /// <summary>
        /// Specific style adjustments for accessibility modes (e.g., per ColorblindMode).
        /// These stylesheets are applied on top of or replace parts of the BaseStyleSheet
        /// when a particular accessibility mode is active.
        /// </summary>
        [Tooltip("Additional stylesheets for accessibility overrides (e.g., for specific colorblind modes).")]
        public List<StyleSheet> AccessibilityStyleOverrides = new List<StyleSheet>();

        // Future consideration: Could add specific overrides per ColorblindMode
        // public SerializableDictionary<ColorblindMode, StyleSheet> ColorblindModeStyleSheets;
    }
}