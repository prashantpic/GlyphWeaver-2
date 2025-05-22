namespace GlyphWeaver.Client.Core.Constants
{
    public static class GameConstants
    {
        public static class SceneNames
        {
            public const string BootstrapScene = "Bootstrap";
            public const string MainMenuScene = "MainMenu";
            public const string GameplayScene = "Gameplay";
            // Add other scene names as needed
        }

        public static class PlayerPrefsKeys
        {
            public const string MasterVolume = "Settings.MasterVolume";
            public const string MusicVolume = "Settings.MusicVolume";
            public const string SfxVolume = "Settings.SfxVolume";
            public const string Language = "Settings.Language";
            public const string PlayerDataKey = "PlayerData";
            public const string GameSettingsKey = "GameSettings";
            // Add other PlayerPrefs keys as needed
        }

        public static class TagNames
        {
            public const string PlayerTag = "Player";
            public const string GlyphTag = "Glyph";
            public const string ObstacleTag = "Obstacle";
            public const string GridCellTag = "GridCell";
            // Add other tag names as needed
        }

        public static class LayerNames
        {
            public const string UILayer = "UI";
            public const string GameplayLayer = "Gameplay";
            // Add other layer names as needed
        }
        
        public const int MaxUndoCount = 5; // Example related to REQ-8-005
        public const string DefaultPlayerId = "DefaultPlayer";

        // Add other general game constants here
    }
}