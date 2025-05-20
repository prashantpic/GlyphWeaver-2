using System.Collections.Generic;
using UnityEngine;

// Assuming PatternDefinitionSO is defined in this namespace or accessible
// namespace GlyphPuzzle.UI.Accessibility { public class PatternDefinitionSO : ScriptableObject { ... } }


namespace GlyphPuzzle.UI.Accessibility
{
    [System.Serializable]
    public class ColorMappingEntry
    {
        [Tooltip("The original color to be adapted.")]
        public Color OriginalColor = Color.white;
        [Tooltip("The adapted color for the specified colorblind mode.")]
        public Color AdaptedColor = Color.white;
    }

    [System.Serializable]
    public class PatternAssignmentEntry
    {
        [Tooltip("A unique identifier for the UI element or type (e.g., 'GlyphTypeA', 'PathTypeUrgent').")]
        public string Identifier;
        [Tooltip("The pattern definition to apply for this identifier in this colorblind mode.")]
        public PatternDefinitionSO Pattern; // This type is not generated in this batch but is referenced
    }

    [CreateAssetMenu(fileName = "ColorPaletteProfile", menuName = "GlyphPuzzle/UI/Accessibility/Color Palette Profile")]
    public class ColorPaletteProfileSO : ScriptableObject
    {
        [Tooltip("The colorblind mode this profile is designed for.")]
        public ColorblindMode Mode = ColorblindMode.Off;

        [Tooltip("List of color mappings. The system will try to find an OriginalColor and replace it with AdaptedColor.")]
        public List<ColorMappingEntry> ColorMappings = new List<ColorMappingEntry>();

        [Tooltip("List of pattern assignments. UI elements with a matching Identifier will apply the specified Pattern.")]
        public List<PatternAssignmentEntry> PatternAssignments = new List<PatternAssignmentEntry>();
    }
}