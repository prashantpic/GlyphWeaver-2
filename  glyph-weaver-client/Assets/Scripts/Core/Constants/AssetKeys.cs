namespace GlyphWeaver.Client.Core.Constants
{
    public static class AssetKeys
    {
        // UI Prefabs
        public static class UIPrefabs
        {
            public const string MainMenuScreen = "UI/Screens/MainMenuScreen";
            public const string LevelSelectionScreen = "UI/Screens/LevelSelectionScreen";
            public const string GameplayScreen = "UI/Screens/GameplayScreen";
            public const string SettingsScreen = "UI/Screens/SettingsScreen";
            public const string StoreScreen = "UI/Screens/StoreScreen";
            public const string ModalDialog = "UI/Common/ModalDialog";
            public const string LevelItem = "UI/Components/LevelItem";
            public const string StoreItem = "UI/Components/StoreItem";
        }

        // Gameplay Prefabs
        public static class GameplayPrefabs
        {
            public const string GridCell = "Gameplay/Grid/GridCellVisual";
            public const string PathSegment = "Gameplay/Paths/PathSegmentVisual";
            // Specific Glyph Prefabs (examples, actual keys might be derived from GlyphDefinition)
            public const string StandardGlyph = "Gameplay/Glyphs/StandardGlyph";
            public const string CatalystGlyph = "Gameplay/Glyphs/CatalystGlyph";
            // Specific Obstacle Prefabs
            public const string BlockerStone = "Gameplay/Obstacles/BlockerStone";
            public const string ShiftingTile = "Gameplay/Obstacles/ShiftingTile";
        }

        // ScriptableObjects - Level Definitions (Handcrafted)
        // Example: public const string LevelDefinition_Zone1_Level1 = "Levels/Handcrafted/Zone1/Level1_Data";
        // These would typically be direct references or loaded via AssetDatabase in Editor,
        // or loaded via Addressables by path if structured that way for runtime.

        // ScriptableObjects - Other Definitions
        public static class Definitions
        {
            public const string Zone1Definition = "Definitions/Zones/Zone1_Definition";
            public const string AudioClipsData = "Definitions/Audio/AudioClipsData";
            // Keys for various GlyphDefinitions, ObstacleDefinitions, etc. if loaded by key
        }

        // Audio Clips (if loaded by Addressables key)
        public static class AudioClips
        {
            public const string MainMenuMusic = "Audio/Music/MainMenuMusic";
            public const string GameplayMusic_Zone1 = "Audio/Music/GameplayMusic_Zone1";
            public const string ButtonClickSFX = "Audio/SFX/ButtonClick";
            public const string PathDrawSFX = "Audio/SFX/PathDraw";
            public const string GlyphConnectSFX = "Audio/SFX/GlyphConnect";
            public const string InvalidActionSFX = "Audio/SFX/InvalidAction";
        }

        // Localization Tables (if using Addressables for tables)
        public static class LocalizationTables
        {
            public const string MainStringsTable = "Localization/Tables/MainStrings";
            public const string GameStringsTable = "Localization/Tables/GameStrings";
        }
    }
}