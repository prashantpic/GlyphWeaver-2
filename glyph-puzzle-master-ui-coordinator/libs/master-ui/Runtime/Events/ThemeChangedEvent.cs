using GlyphPuzzle.UI.Coordinator.State;

namespace GlyphPuzzle.UI.Coordinator.Events
{
    /// <summary>
    /// Data structure for events indicating a change in the active UI theme.
    /// </summary>
    public struct ThemeChangedEvent
    {
        /// <summary>
        /// The newly activated theme.
        /// </summary>
        public ThemeDefinition NewTheme;

        /// <summary>
        /// Initializes a new instance of the <see cref="ThemeChangedEvent"/> struct.
        /// </summary>
        /// <param name="newTheme">The new theme that has been activated.</param>
        public ThemeChangedEvent(ThemeDefinition newTheme)
        {
            NewTheme = newTheme;
        }
    }
}