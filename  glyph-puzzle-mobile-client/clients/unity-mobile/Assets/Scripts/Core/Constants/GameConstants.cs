namespace GlyphPuzzle.Mobile.Core
{
    /// <summary>
    /// Global constants for the game.
    /// Contains static readonly or const fields for various game-wide constant values,
    /// improving maintainability and reducing magic strings/numbers.
    /// </summary>
    public static class GameConstants
    {
        public const string MainMenuSceneName = "MainMenu";
        public const string GameplaySceneName = "Gameplay";
        public const string LevelSelectionSceneName = "LevelSelection";

        public const string PlayerPrefsMasterVolumeKey = "MasterVolume";
        public const string PlayerPrefsMusicVolumeKey = "MusicVolume";
        public const string PlayerPrefsSfxVolumeKey = "SfxVolume";
        public const string PlayerPrefsAccessibilitySettingsKey = "AccessibilitySettings";
        // Add other PlayerPrefs keys, tags, layer names, etc. as needed.
    }
}