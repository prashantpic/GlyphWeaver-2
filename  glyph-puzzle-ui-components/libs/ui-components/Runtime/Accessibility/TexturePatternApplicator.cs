using UnityEngine;
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Accessibility
{
    /// <summary>
    /// Concrete strategy that applies texture-based patterns to UI elements.
    /// Implements IPatternApplicator to apply texture overlays (from PatternDefinitionSO)
    /// as background images to UI elements for colorblind modes.
    /// </summary>
    public class TexturePatternApplicator : IPatternApplicator
    {
        /// <summary>
        /// Applies the specified pattern to the visual element.
        /// Sets the element's background image to the pattern's texture and applies a tint.
        /// </summary>
        /// <param name="element">The visual element to apply the pattern to.</param>
        /// <param name="patternDef">The pattern definition containing the texture and tint color.</param>
        public void ApplyPattern(VisualElement element, PatternDefinitionSO patternDef)
        {
            if (element == null || patternDef == null)
            {
                Debug.LogWarning("TexturePatternApplicator: Element or PatternDefinitionSO is null. Cannot apply pattern.");
                return;
            }

            element.style.backgroundImage = new StyleBackground(patternDef.PatternTexture);
            element.style.unityBackgroundImageTintColor = patternDef.TintColor;
        }

        /// <summary>
        /// Removes any applied pattern from the visual element.
        /// Clears the background image and resets the tint.
        /// </summary>
        /// <param name="element">The visual element to remove the pattern from.</param>
        public void RemovePattern(VisualElement element)
        {
            if (element == null)
            {
                Debug.LogWarning("TexturePatternApplicator: Element is null. Cannot remove pattern.");
                return;
            }

            element.style.backgroundImage = null;
            element.style.unityBackgroundImageTintColor = Color.white; // Reset to default or clear tint
        }
    }
}