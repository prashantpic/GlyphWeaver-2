namespace GlyphPuzzle.UI.Accessibility
{
    using UnityEngine.UIElements;

    /// <summary>
    /// Interface for visual pattern application strategies.
    /// </summary>
    public interface IPatternApplicator
    {
        /// <summary>
        /// Applies the specified pattern to the visual element.
        /// </summary>
        /// <param name="element">The visual element to modify.</param>
        /// <param name="patternDef">The pattern definition to apply.</param>
        void ApplyPattern(VisualElement element, PatternDefinitionSO patternDef);

        /// <summary>
        /// Removes any applied pattern from the visual element.
        /// </summary>
        /// <param name="element">The visual element to modify.</param>
        void RemovePattern(VisualElement element);
    }
}