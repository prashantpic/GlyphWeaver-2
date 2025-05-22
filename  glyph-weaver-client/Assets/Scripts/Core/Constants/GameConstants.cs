namespace GlyphWeaver.Client.Core.Constants
{
    public static class GameConstants
    {
        // Scene Names
        public static readonly string MainMenuScene = "MainMenu";
        public static readonly string GameplayScene = "Gameplay";
        public static readonly string LoadingScene = "Loading";

        // PlayerPrefs Keys
        public static readonly string MasterVolumeKey = "Settings_MasterVolume";
        public static readonly string MusicVolumeKey = "Settings_MusicVolume";
        public static readonly string SfxVolumeKey = "Settings_SfxVolume";
        public static readonly string LanguageKey = "Settings_Language";
        public static readonly string PlayerIdKey = "Player_Id"; // Example, if a custom ID is stored

        // Tags
        public static readonly string PlayerTag = "Player";
        public static readonly string GlyphTag = "Glyph";
        public static readonly string ObstacleTag = "Obstacle";
        public static readonly string GridCellTag = "GridCell";

        // Layers
        public static readonly int UILayer = 5; // Unity's default UI layer index

        // Animation Parameters
        public static readonly string AnimFadeIn = "FadeIn";
        public static readonly string AnimFadeOut = "FadeOut";

        // Default Values
        public const float DefaultMusicVolume = 0.75f;
        public const float DefaultSfxVolume = 0.85f;
        public const string DefaultLanguage = "en";
    }
}