namespace GlyphWeaver.Client.Core.Constants
{
    public static class AssetKeys
    {
        // Audio Clips - Music
        public static readonly string MusicMainMenu = "Audio/Music/MainMenuTheme";
        public static readonly string MusicZone1 = "Audio/Music/Zone1Theme";
        public static readonly string MusicPuzzleGameplay = "Audio/Music/PuzzleGameplay";

        // Audio Clips - SFX
        public static readonly string SfxButtonClick = "Audio/SFX/ButtonClick";
        public static readonly string SfxPathDrawValid = "Audio/SFX/PathDrawValid";
        public static readonly string SfxPathDrawInvalid = "Audio/SFX/PathDrawInvalid";
        public static readonly string SfxGlyphConnect = "Audio/SFX/GlyphConnect";
        public static readonly string SfxLevelComplete = "Audio/SFX/LevelComplete";
        public static readonly string SfxLevelFail = "Audio/SFX/LevelFail";
        public static readonly string SfxCatalystActivate = "Audio/SFX/CatalystActivate";
        public static readonly string SfxHintUsed = "Audio/SFX/HintUsed";
        public static readonly string SfxUndo = "Audio/SFX/Undo";

        // Prefabs - UI
        public static readonly string PrefabLevelSelectItem = "Prefabs/UI/LevelSelectItem";
        public static readonly string PrefabStoreItem = "Prefabs/UI/StoreItem";
        public static readonly string PrefabLeaderboardEntry = "Prefabs/UI/LeaderboardEntry";
        public static readonly string PrefabModalDialog = "Prefabs/UI/ModalDialogView";

        // Prefabs - Gameplay
        public static readonly string PrefabGridCell = "Prefabs/Gameplay/GridCellVisual";
        public static readonly string PrefabPathSegment = "Prefabs/Gameplay/PathSegmentVisual";
        // Specific Glyph/Obstacle prefabs might be referenced directly in their ScriptableObject definitions
        // or use a naming convention like: "Prefabs/Gameplay/Glyphs/StandardGlyph"

        // ScriptableObjects - Definitions
        public static readonly string DefZoneBasePath = "Definitions/Zones/"; // e.g., DefZoneBasePath + "Zone1Definition"
        public static readonly string DefLevelBasePath = "Definitions/Levels/"; // e.g., DefLevelBasePath + "Zone1/Level1_01"
        public static readonly string DefGlyphBasePath = "Definitions/Glyphs/";
        public static readonly string DefObstacleBasePath = "Definitions/Obstacles/";
        public static readonly string DefAudioClipsData = "Definitions/Audio/AudioClipsData";

        // Localization Tables
        public static readonly string LocalizationTableUI = "Localization/UITable";
        public static readonly string LocalizationTableGameplay = "Localization/GameplayTable";
        public static readonly string LocalizationTableStore = "Localization/StoreTable";
    }
}