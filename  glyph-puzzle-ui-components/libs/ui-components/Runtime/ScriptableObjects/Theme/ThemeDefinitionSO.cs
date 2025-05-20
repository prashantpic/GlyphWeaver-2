namespace GlyphPuzzle.UI.Management
{
    using System.Collections.Generic;
    using UnityEngine;
    using UnityEngine.UIElements;

    /// <summary>
    /// ScriptableObject for defining a UI theme.
    /// </summary>
    [CreateAssetMenu(fileName = "ThemeDefinition", menuName = "GlyphPuzzle/UI/Theme Definition")]
    public class ThemeDefinitionSO : ScriptableObject
    {
        [Tooltip("A descriptive name for this theme (e.g., 'Dark Mode', 'Classic').")]
        public string ThemeName;

        [Tooltip("List of StyleSheet assets that constitute this theme. Applied in order.")]
        public List<StyleSheet> ThemeStyleSheets = new List<StyleSheet>();
    }
}