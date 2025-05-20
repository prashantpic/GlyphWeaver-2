using UnityEngine; // For Vector2Int

// Placeholder for GlyphTypeDefinitionSO for compilation
#if UNITY_EDITOR && !GLYPHSPAWNINFO_GLYPHTYPEDEFSO_DEFINED
#define GLYPHSPAWNINFO_GLYPHTYPEDEFSO_DEFINED
namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels
{
    // Assuming GlyphTypeDefinitionSO is a ScriptableObject defining glyph properties
    // [CreateAssetMenu(fileName = "GlyphType", menuName = "GlyphPuzzle/Glyph Type Definition")]
    public class GlyphTypeDefinitionSO : ScriptableObject
    {
        public string TypeId;
        // public Sprite GlyphSprite;
        // public Color GlyphColor;
        // ... other properties
    }
}
#endif


namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels
{
    /// <summary>
    /// Defines the spawning parameters for a glyph in a level.
    /// Specifies how and where a glyph should be placed when a level is loaded. (REQ-CGLE-007)
    /// </summary>
    [System.Serializable] // To be used in lists within LevelDefinitionSO
    public struct GlyphSpawnInfo
    {
        [Tooltip("Reference to the ScriptableObject defining the glyph's properties.")]
        public GlyphTypeDefinitionSO GlyphType; // This should be a reference to an SO defining the glyph's appearance and behavior.

        [Tooltip("Initial (column, row) or (x,y) position on the grid.")]
        public Vector2Int Position;

        [Tooltip("Identifier to match pairs of glyphs (e.g., start and end glyphs of a path). Use 0 or -1 if not part of a pair.")]
        public int PairId;

        [Tooltip("Order for sequence puzzles. Use -1 if not applicable or if order is determined by PairId.")]
        public int SequenceOrder;

        // Add other properties as needed, e.g.:
        // public string SpecificGlyphInstanceId; // If individual glyphs need unique tracking beyond type/position
        // public InitialState GlyphState; // If glyphs can have initial states (e.g. active, inactive)
    }
}