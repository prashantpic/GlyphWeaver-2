namespace GlyphPuzzle.UI.Accessibility
{
    using UnityEngine;

    /// <summary>
    /// ScriptableObject for defining a single visual pattern.
    /// </summary>
    [CreateAssetMenu(fileName = "PatternDefinition", menuName = "GlyphPuzzle/UI/Accessibility/Pattern Definition")]
    public class PatternDefinitionSO : ScriptableObject
    {
        [Tooltip("Descriptive name for the pattern (e.g., 'Stripes', 'Dots')")]
        public string PatternName;

        [Tooltip("The texture asset used for this pattern.")]
        public Texture2D PatternTexture;

        [Tooltip("Tint color to apply to the pattern texture. Use white for no tint.")]
        public Color TintColor = Color.white;

        // Future considerations: Tiling, Scale, Offset parameters
        // public Vector2 Tiling = Vector2.one;
        // public Vector2 Offset = Vector2.zero;
    }
}