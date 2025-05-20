using UnityEngine;
using System.Collections.Generic;

// Placeholder for ObstacleSpawnInfo, PuzzleType, ShiftingTilePattern if not defined elsewhere
// For the purpose of this generation, assume they are defined in this namespace or accessible.
namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels
{
    // Assuming ObstacleSpawnInfo is a struct similar to GlyphSpawnInfo
    [System.Serializable]
    public struct ObstacleSpawnInfo
    {
        // public ObstacleTypeDefinitionSO ObstacleType; // Example: Reference to an SO defining the obstacle
        public string ObstacleName; // Or some identifier
        public Vector2Int Position;
        // Add other obstacle properties here
    }

    // Assuming PuzzleType is an enum or a class/struct
    // Using an enum for simplicity here based on the example values in the spec
    public enum PuzzleTypeEnum
    {
        PathDrawing,
        ColorMatching,
        SequenceFollowing
        // Add more puzzle types as needed
    }

    // Assuming ShiftingTilePattern is a struct or class
    [System.Serializable]
    public struct ShiftingTilePattern
    {
        public int TileId; // Identifier for the tile or group of tiles
        public List<Vector2Int> MovementPoints; // Sequence of grid positions
        public float Interval; // Time between movements
        public bool Loop;
        // Add other pattern properties here
    }
}


namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels
{
    /// <summary>
    /// ScriptableObject for defining hand-crafted or procedurally generated level structures.
    /// Holds all necessary immutable information for a level, such as its layout, objectives, and any special mechanics.
    /// This data is used by the LevelLoadService to instantiate a playable level.
    /// Implements REQ-CGLE-001, REQ-CGLE-014, REQ-CGLE-007, REQ-CGLE-023.
    /// </summary>
    [CreateAssetMenu(fileName = "LevelDefinition", menuName = "GlyphPuzzle/Levels/Level Definition")]
    public class LevelDefinitionSO : ScriptableObject
    {
        [Tooltip("Unique identifier for the level (e.g., 'zone1-level01'). REQ-CGLE-007")]
        public string LevelId;

        [Tooltip("Identifier of the zone this level belongs to. REQ-CGLE-007")]
        public string ZoneId;

        [Tooltip("Rows and columns of the grid. REQ-CGLE-007")]
        public Vector2Int GridDimensions;

        [Tooltip("List of glyph types and their initial positions. REQ-CGLE-007")]
        public List<GlyphSpawnInfo> GlyphSpawnData;

        [Tooltip("List of obstacle types and their positions. REQ-CGLE-007")]
        public List<ObstacleSpawnInfo> ObstacleSpawnData;

        [Tooltip("Applicable puzzle types for this level. REQ-CGLE-007")]
        public List<PuzzleTypeEnum> PuzzleTypes; // Using the placeholder enum

        [Tooltip("Time limit in seconds, 0 if no limit. REQ-CGLE-007")]
        public int TimeLimitSeconds;

        [Tooltip("Move limit, 0 if no limit. REQ-CGLE-007")]
        public int MoveLimit;

        [Tooltip("Serialized representation of at least one solution. REQ-CGLE-007")]
        public List<string> VerifiedSolutionPaths;

        [Tooltip("Movement patterns for shifting tiles, if present. REQ-CGLE-007, REQ-CGLE-023")]
        public List<ShiftingTilePattern> ShiftingTilePatterns;

        [Tooltip("Parameters defining the level's complexity, related to REQ-CGLE-001.")]
        public LevelComplexityParams ComplexityParameters;
    }
}