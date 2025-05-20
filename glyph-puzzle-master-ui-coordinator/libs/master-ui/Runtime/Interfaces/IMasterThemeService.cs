using System.Threading.Tasks;
using UnityEngine.UIElements;
using GlyphPuzzle.UI.Coordinator.State;
using System.Collections.Generic;

namespace GlyphPuzzle.UI.Coordinator.Interfaces
{
    /// <summary>
    /// Defines the contract for managing UI themes, including applying and switching themes.
    /// It handles loading theme assets and applying them globally or to specific elements,
    /// considering accessibility overrides.
    /// </summary>
    public interface IMasterThemeService
    {
        /// <summary>
        /// Initializes the theme service with the root visual element to apply the initial theme.
        /// </summary>
        /// <param name="rootVisualElementToTheme">The root visual element of the UI.</param>
        /// <returns>A task that completes when the service is initialized and the initial theme is applied.</returns>
        Task InitializeAsync(VisualElement rootVisualElementToTheme);

        /// <summary>
        /// Sets the active UI theme asynchronously.
        /// This involves loading the theme's assets and applying its styles to the UI.
        /// </summary>
        /// <param name="themeName">The name of the theme to activate.</param>
        /// <returns>A task that completes when the theme has been set and applied.</returns>
        Task SetActiveThemeAsync(string themeName);

        /// <summary>
        /// Gets the currently active theme definition.
        /// </summary>
        /// <returns>The current <see cref="ThemeDefinition"/>, or null if no theme is active.</returns>
        ThemeDefinition GetCurrentTheme();

        /// <summary>
        /// Applies the styles of a specific theme (or the current theme if null) to a single visual element and its hierarchy.
        /// This includes base stylesheets and accessibility overrides.
        /// </summary>
        /// <param name="element">The visual element to apply theme styles to.</param>
        /// <param name="theme">The theme to apply. If null, the current active theme is used.</param>
        void ApplyThemeStylesToElement(VisualElement element, ThemeDefinition theme = null);
        
        /// <summary>
        /// Applies the current theme and accessibility styles to the entire visual tree starting from the given root element.
        /// </summary>
        /// <param name="rootElement">The root visual element to apply styles to.</param>
        /// <param name="themeToApply">The specific theme to apply. If null, the current active theme is used.</param>
        void ApplyThemeToVisualTree(VisualElement rootElement, ThemeDefinition themeToApply = null);

        /// <summary>
        /// Gets a list of available theme names.
        /// </summary>
        /// <returns>A read-only list of available theme names.</returns>
        IReadOnlyList<string> GetAvailableThemeNames();
    }
}