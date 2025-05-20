using GlyphPuzzle.UI.Coordinator.Enums;

namespace GlyphPuzzle.UI.Coordinator.State
{
    /// <summary>
    /// Represents the persistent state of UI settings, managed by CrossScreenStateManager
    /// and potentially saved via MobileClientFacade.
    /// Implemented Features: UserSettingsStorage
    /// Relevant Requirements: REQ-UIUX-015, REQ-ACC-002, REQ-UIUX-009
    /// </summary>
    [System.Serializable]
    public struct UISettingsState
    {
        /// <summary>
        /// Currently selected language code (e.g., "en", "fr").
        /// </summary>
        public string SelectedLanguageCode;

        /// <summary>
        /// Name of the currently active theme.
        /// </summary>
        public string ActiveThemeName;

        /// <summary>
        /// Active colorblind mode.
        /// </summary>
        public ColorblindMode CurrentColorblindMode;

        /// <summary>
        /// Flag for reduced motion accessibility setting.
        /// True if reduced motion is enabled, false otherwise.
        /// </summary>
        public bool IsReducedMotionEnabled;

        /// <summary>
        /// Multiplier for text size adjustments.
        /// e.g., 1.0f for default, 1.2f for 20% larger.
        /// </summary>
        public float TextScaleFactor;

        /// <summary>
        /// Initializes a new instance of the <see cref="UISettingsState"/> struct with default values.
        /// </summary>
        /// <param name="defaultLanguageCode">The default language code.</param>
        /// <param name="defaultThemeName">The default theme name.</param>
        public UISettingsState(string defaultLanguageCode = "en", string defaultThemeName = "Default")
        {
            SelectedLanguageCode = defaultLanguageCode;
            ActiveThemeName = defaultThemeName;
            CurrentColorblindMode = ColorblindMode.None;
            IsReducedMotionEnabled = false;
            TextScaleFactor = 1.0f;
        }

        /// <summary>
        /// Returns a default initialized UISettingsState.
        /// </summary>
        public static UISettingsState Default => new UISettingsState
        {
            SelectedLanguageCode = "en", // Consider linking to a global default or UICoordinatorSettings
            ActiveThemeName = "Default", // Consider linking to a global default or UICoordinatorSettings
            CurrentColorblindMode = ColorblindMode.None,
            IsReducedMotionEnabled = false,
            TextScaleFactor = 1.0f
        };
    }
}