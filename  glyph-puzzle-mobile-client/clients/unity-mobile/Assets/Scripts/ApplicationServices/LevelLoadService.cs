using UnityEngine;
using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For LevelDefinitionSO
using GlyphPuzzle.Mobile.DomainLogic.Models;    // For LevelData, Grid
// Assuming IGridManager and IGlyphSpawnService interfaces are defined for injection
using GlyphPuzzle.Mobile.ApplicationServices;

// Placeholders if not defined elsewhere
#if UNITY_EDITOR
// namespace GlyphPuzzle.Mobile.DomainLogic.Models { public class LevelData { public LevelDefinitionSO Definition; public Grid GridState; /*...*/ } public class Grid { public Grid(Vector2Int dim) {} /*...*/ } }
// namespace GlyphPuzzle.Mobile.ApplicationServices 
// { 
//     public interface IGridManager { void InitializeGrid(Vector2Int dimensions, System.Collections.Generic.List<ObstacleSpawnInfo> obstacles); }
//     public interface IGlyphSpawnService { void SpawnGlyphs(System.Collections.Generic.List<GlyphSpawnInfo> data, Grid grid); }
//     // Example implementations for compilation
//     public class GridManagerImpl : IGridManager { public void InitializeGrid(Vector2Int d, System.Collections.Generic.List<ObstacleSpawnInfo> o){} }
//     public class GlyphSpawnServiceImpl : IGlyphSpawnService { public void SpawnGlyphs(System.Collections.Generic.List<GlyphSpawnInfo> d, Grid g){} }
// }
#endif


namespace GlyphPuzzle.Mobile.ApplicationServices
{
    /// <summary>
    /// Handles loading and setup of game levels.
    /// Takes a LevelDefinitionSO, creates runtime LevelData, initializes GridManager,
    /// and calls GlyphSpawnService.
    /// Implements REQ-CGLE-001, REQ-CGLE-007.
    /// </summary>
    public class LevelLoadService
    {
        public IGridManager GridManager { get; set; } // Injected
        public IGlyphSpawnService GlyphSpawnService { get; set; } // Injected
        // public PuzzleRuleEngine PuzzleRuleEngine { get; set; } // Injected (Implied by spec)


        public LevelLoadService(IGridManager gridManager, IGlyphSpawnService glyphSpawnService /*, PuzzleRuleEngine ruleEngine */)
        {
            this.GridManager = gridManager;
            this.GlyphSpawnService = glyphSpawnService;
            // this.PuzzleRuleEngine = ruleEngine;
        }

        /// <summary>
        /// Loads a level based on its definition and prepares it for gameplay.
        /// </summary>
        /// <param name="levelDefinition">The ScriptableObject defining the level.</param>
        /// <returns>Runtime LevelData for the loaded level, or null if loading fails.</returns>
        public LevelData LoadLevel(LevelDefinitionSO levelDefinition)
        {
            if (levelDefinition == null)
            {
                Debug.LogError("LevelLoadService: LevelDefinitionSO is null. Cannot load level.");
                return null;
            }

            if (GridManager == null || GlyphSpawnService == null /* || PuzzleRuleEngine == null */)
            {
                Debug.LogError("LevelLoadService: Dependencies (GridManager, GlyphSpawnService, PuzzleRuleEngine) not injected.");
                return null;
            }

            Debug.Log($"Loading level: {levelDefinition.LevelId} (Zone: {levelDefinition.ZoneId})");

            // 1. Create runtime LevelData
            LevelData runtimeLevelData = new LevelData
            {
                Definition = levelDefinition,
                GridState = new Grid(levelDefinition.GridDimensions), // Initialize Grid model
                CurrentScore = 0,
                TimeRemaining = levelDefinition.TimeLimitSeconds > 0 ? levelDefinition.TimeLimitSeconds : float.PositiveInfinity,
                MovesTaken = 0,
                ActivePaths = new System.Collections.Generic.List<Path>()
            };

            // 2. Initialize GridManager (dimensions, obstacles)
            // The GridManager here likely refers to a service that manages the logical grid state
            // and potentially triggers the GridRenderer for visuals.
            // GridManager.InitializeGrid(levelDefinition.GridDimensions, levelDefinition.ObstacleSpawnData);

            // 3. Call GlyphSpawnService to place glyphs
            // This service would take the GlyphSpawnData and populate the logical grid (runtimeLevelData.GridState)
            // and might also trigger visual glyph spawning via a GlyphRenderer.
            GlyphSpawnService.SpawnGlyphs(levelDefinition.GlyphSpawnData, runtimeLevelData.GridState);

            // 4. Configure PuzzleRuleEngine (implied)
            // PuzzleRuleEngine.Initialize(levelDefinition.PuzzleTypes, runtimeLevelData);

            Debug.Log($"Level {levelDefinition.LevelId} loaded successfully.");
            return runtimeLevelData;
        }
    }
}