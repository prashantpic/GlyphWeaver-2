namespace GlyphPuzzle.Mobile.Core
{
    /// <summary>
    /// Global constants for the game.
    /// Centralizes constant values used throughout the application,
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
        public const string PlayerDataKey = "PlayerData"; // For SaveLoadManager
    }
}