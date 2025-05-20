using UnityEngine;
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Coordinator.Interfaces
{
    /// <summary>
    /// Defines the contract for enforcing design system consistency across UI elements.
    /// Provides utilities for applying design tokens (colors, typography, spacing) and styles.
    /// </summary>
    public interface IDesignSystemEnforcer
    {
        /// <summary>
        /// Applies default styles to a visual element based on its generic element type (e.g., "Button", "Label").
        /// These styles are derived from the design system and current theme.
        /// </summary>
        /// <param name="element">The visual element to style.</param>
        /// <param name="elementType">A string identifying the type of element (e.g., "PrimaryButton", "BodyText").</param>
        void ApplyElementStyles(VisualElement element, string elementType);

        /// <summary>
        /// Retrieves a semantic color value from the current theme's color palette.
        /// Semantic colors are defined by their role (e.g., "PrimaryAction", "ErrorText").
        /// </summary>
        /// <param name="colorRole">The semantic role of the color (e.g., "background-primary", "text-accent").</param>
        /// <returns>The <see cref="Color"/> defined for the role in the current theme.</returns>
        Color GetSemanticColor(string colorRole);

        /// <summary>
        /// Applies a set of predefined USS classes or inline styles derived from the design system.
        /// This method considers the active theme and accessibility settings.
        /// </summary>
        /// <param name="visualElement">The visual element to apply styles to.</param>
        /// <param name="styleClassesFromDesignSystem">An array of USS class names or style identifiers from the design system.</param>
        void ApplyStylesToVisualElement(VisualElement visualElement, params string[] styleClassesFromDesignSystem);

        /// <summary>
        /// Gets the USS class name corresponding to a specific typography role.
        /// </summary>
        /// <param name="typographyRole">The role of the typography (e.g., "Heading1", "BodyText", "Caption").</param>
        /// <returns>The USS class name for the specified typography role.</returns>
        string GetTypographyUSSClass(string typographyRole);
    }
}