namespace GlyphPuzzle.UI.Components
{
    using UnityEngine;

    /// <summary>
    /// Data structure representing the properties of a glyph.
    /// </summary>
    public class GlyphData
    {
        public string GlyphId { get; set; }
        public string GlyphType { get; set; } // Used as pattern identifier key
        public Color BaseColor { get; set; }
        public string PatternIdentifier { get; set; } // Often same as GlyphType, or specific for pattern lookup
        public string Symbol { get; set; } // The actual symbol/text to display for the glyph

        public GlyphData(string glyphId, string glyphType, Color baseColor, string patternIdentifier, string symbol)
        {
            GlyphId = glyphId;
            GlyphType = glyphType;
            BaseColor = baseColor;
            PatternIdentifier = patternIdentifier;
            Symbol = symbol;
        }
    }
}