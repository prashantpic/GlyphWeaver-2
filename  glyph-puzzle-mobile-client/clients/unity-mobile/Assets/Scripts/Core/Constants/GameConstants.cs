namespace GlyphPuzzle.Mobile.Core
{
    /// <summary>
    /// Global constants for the game.
    /// This class centralizes constant values used throughout the application,
    /// improving maintainability and reducing magic strings/numbers.
    /// </summary>
    public static class GameConstants
    {
        /// <summary>
        /// Name of the main menu scene.
        /// </summary>
        public const string MainMenuSceneName = "MainMenu";

        /// <summary>
        /// Name of the gameplay scene.
        /// </summary>
        public const string GameplaySceneName = "Gameplay";

        /// <summary>
        /// Name of the level selection scene.
        /// </summary>
        public const string LevelSelectionSceneName = "LevelSelection";

        /// <summary>
        /// PlayerPrefs key for master volume.
        /// </summary>
        public const string PlayerPrefsMasterVolumeKey = "MasterVolume";

        /// <summary>
        /// PlayerPrefs key for music volume.
        /// </summary>
        public const string PlayerPrefsMusicVolumeKey = "MusicVolume";

        /// <summary>
        /// PlayerPrefs key for sound effects volume.
        /// </summary>
        public const string PlayerPrefsSfxVolumeKey = "SfxVolume";

        /// <summary>
        /// PlayerPrefs key for serialized accessibility settings.
        /// </summary>
        public const string PlayerPrefsAccessibilitySettingsKey = "AccessibilitySettings";

        // Add other constants as needed, e.g., animation trigger names, tags, layer names.
        // public const string PlayerTag = "Player";
        // public const string EnemyTag = "Enemy";
    }
}