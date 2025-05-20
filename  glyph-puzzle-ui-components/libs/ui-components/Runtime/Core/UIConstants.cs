namespace GlyphPuzzle.UI.Core
{
    /// <summary>
    /// Shared constants used across UI components and systems.
    /// To centralize UI-related constant values for consistency, maintainability, and ease of modification.
    /// Defines static constant values for things like common USS class names (e.g., `hidden`, `disabled`),
    /// default animation durations, or widely used string keys.
    /// </summary>
    public static class UIConstants
    {
        /// <summary>
        /// Default duration for UI animations in seconds.
        /// </summary>
        public const float DefaultAnimationDuration = 0.3f;

        /// <summary>
        /// USS style class used to hide visual elements.
        /// </summary>
        public const string HiddenStyleClass = "hidden";

        /// <summary>
        /// USS style class used to disable visual elements.
        /// </summary>
        public const string DisabledStyleClass = "disabled";

        // Add other UI-related constants here as needed
        // Example:
        // public const string ErrorTextStyleClass = "error-text";
        // public const string PrimaryButtonClass = "primary-button";
    }
}