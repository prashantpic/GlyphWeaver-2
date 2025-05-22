namespace GlyphWeaver.Client.Core.Constants
{
    public static class GameConstants
    {
        // Scene Names
        public static class SceneNames
        {
            public const string BootstrapScene = "Bootstrap";
            public const string MainMenuScene = "MainMenu";
            public const string GameplayScene = "Gameplay";
            // Add other scene names as needed
        }

        // PlayerPrefs Keys
        public static class PlayerPrefsKeys
        {
            public const string MasterVolume = "Settings.MasterVolume";
            public const string MusicVolume = "Settings.MusicVolume";
            public const string SfxVolume = "Settings.SfxVolume";
            public const string Language = "Settings.Language";
            public const string PlayerDataSave = "PlayerData.Save";
            public const string GameSettingsSave = "GameSettings.Save";
            // Add other PlayerPrefs keys as needed
        }

        // Tags
        public static class TagNames
        {
            public const string PlayerTag = "Player";
            public const string GlyphTag = "Glyph";
            public const string ObstacleTag = "Obstacle";
            public const string GridCellTag = "GridCell";
            // Add other tags as needed
        }

        // Layers
        public static class LayerNames
        {
            public const string UILayer = "UI";
            public const string GameplayLayer = "Gameplay";
            // Add other layers as needed
        }

        // Animation Triggers/Parameters
        public static class AnimationParameters
        {
            public const string IsOpen = "IsOpen";
            public const string TriggerFadeIn = "FadeIn";
            public const string TriggerFadeOut = "FadeOut";
            // Add other animation parameters as needed
        }
        
        // Default Values
        public const float DefaultMusicVolume = 0.75f;
        public const float DefaultSfxVolume = 0.75f;
        public const string DefaultLanguage = "en";
    }
}