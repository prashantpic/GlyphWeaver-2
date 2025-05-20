using GlyphPuzzle.UI.Coordinator.Interfaces;
using GlyphPuzzle.UI.Coordinator.State;
using GlyphPuzzle.UI.Coordinator.Config;
using GlyphPuzzle.UI.Coordinator.Events; // For ThemeChangedEvent
using System;
using System.Linq;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.UIElements;
using UniRx; // Assuming UniRx for event bus or simple delegate for events

namespace GlyphPuzzle.UI.Coordinator.Services
{
    /// <summary>
    /// Manages UI themes, including color palettes and styles, and applies them globally,
    /// considering accessibility settings.
    /// </summary>
    public class MasterThemeService : IMasterThemeService
    {
        private readonly ICrossScreenStateManager _crossScreenStateManager;
        private readonly IMasterAccessibilityService _masterAccessibilityService;
        private readonly IAssetLoadingService _assetLoadingService; // Not directly used in this simplified version, but kept for signature
        private readonly UICoordinatorSettings _coordinatorSettings;

        private ThemeDefinition _currentTheme;
        private VisualElement _rootVisualElement;

        /// <summary>
        /// Event invoked when the active theme changes.
        /// Consider using a more robust event bus if available (e.g., UniRx MessageBroker).
        /// </summary>
        public static event Action<ThemeChangedEvent> OnThemeChanged;


        /// <summary>
        /// Initializes a new instance of the <see cref="MasterThemeService"/> class.
        /// </summary>
        public MasterThemeService(
            ICrossScreenStateManager crossScreenStateManager,
            IMasterAccessibilityService masterAccessibilityService,
            IAssetLoadingService assetLoadingService,
            UICoordinatorSettings coordinatorSettings)
        {
            _crossScreenStateManager = crossScreenStateManager ?? throw new ArgumentNullException(nameof(crossScreenStateManager));
            _masterAccessibilityService = masterAccessibilityService ?? throw new ArgumentNullException(nameof(masterAccessibilityService));
            _assetLoadingService = assetLoadingService ?? throw new ArgumentNullException(nameof(assetLoadingService)); // Retained
            _coordinatorSettings = coordinatorSettings ?? throw new ArgumentNullException(nameof(coordinatorSettings));

            // Subscribe to settings changes to react to theme name changes from elsewhere
            _crossScreenStateManager.SubscribeToSettingsChanges(HandleSettingsChange);
            // Subscribe to accessibility changes to re-apply theme with new accessibility context
            // This requires IMasterAccessibilityService to expose a similar subscription mechanism
            // For now, we'll rely on explicit calls or direct re-application when accessibility changes.
        }

        private void HandleSettingsChange(UISettingsState newSettings)
        {
            if (_currentTheme == null || _currentTheme.ThemeName != newSettings.ActiveThemeName)
            {
                if (!string.IsNullOrEmpty(newSettings.ActiveThemeName))
                {
                     SetActiveThemeAsync(newSettings.ActiveThemeName).Forget();
                }
            }
        }

        /// <summary>
        /// Initializes the theme service with the root visual element.
        /// Loads the default or saved theme and applies it.
        /// </summary>
        /// <param name="rootVisualElementToTheme">The root visual element of the UI.</param>
        public async Task InitializeAsync(VisualElement rootVisualElementToTheme)
        {
            _rootVisualElement = rootVisualElementToTheme ?? throw new ArgumentNullException(nameof(rootVisualElementToTheme));

            string initialThemeName = _crossScreenStateManager.GetSettingsState().ActiveThemeName;
            if (string.IsNullOrEmpty(initialThemeName))
            {
                initialThemeName = _coordinatorSettings.DefaultThemeName;
            }

            if (!string.IsNullOrEmpty(initialThemeName))
            {
                await SetActiveThemeAsync(initialThemeName);
            }
            else if (_coordinatorSettings.AvailableThemes.Any())
            {
                Debug.LogWarning("[MasterThemeService] No theme name set, falling back to the first available theme.");
                await SetActiveThemeAsync(_coordinatorSettings.AvailableThemes[0].ThemeName);
            }
            else
            {
                Debug.LogError("[MasterThemeService] No themes available in UICoordinatorSettings and no default theme set.");
            }
        }

        /// <summary>
        /// Sets the active UI theme.
        /// </summary>
        /// <param name="themeName">The name of the theme to activate.</param>
        public async Task SetActiveThemeAsync(string themeName)
        {
            if (string.IsNullOrEmpty(themeName))
            {
                Debug.LogError("[MasterThemeService] Theme name cannot be null or empty.");
                return;
            }

            if (_currentTheme?.ThemeName == themeName && _rootVisualElement != null) // Avoid reloading if already active and applied
            {
                 // Still re-apply to ensure accessibility styles are current if they changed independently.
                 ApplyThemeToVisualTree(_rootVisualElement, _currentTheme);
                 return;
            }

            ThemeDefinition themeToActivate = _coordinatorSettings.AvailableThemes.FirstOrDefault(t => t.ThemeName == themeName);

            if (themeToActivate == null)
            {
                Debug.LogError($"[MasterThemeService] Theme '{themeName}' not found in UICoordinatorSettings.");
                return;
            }
            
            // In a more complex scenario, theme assets (stylesheets) might be loaded asynchronously here via _assetLoadingService
            // e.g., themeToActivate.BaseStyleSheet = await _assetLoadingService.LoadStyleSheetAsync(themeToActivate.BaseStyleSheetPath);
            // For this implementation, we assume ThemeDefinition.BaseStyleSheet is already populated.

            _currentTheme = themeToActivate;

            if (_rootVisualElement != null)
            {
                ApplyThemeToVisualTree(_rootVisualElement, _currentTheme);
            }

            UISettingsState currentSettings = _crossScreenStateManager.GetSettingsState();
            if (currentSettings.ActiveThemeName != themeName)
            {
                currentSettings.ActiveThemeName = themeName;
                _crossScreenStateManager.UpdateSettingsState(currentSettings);
            }
            
            OnThemeChanged?.Invoke(new ThemeChangedEvent { NewTheme = _currentTheme });
            Debug.Log($"[MasterThemeService] Active theme set to: {themeName}");
        }

        /// <summary>
        /// Gets the currently active theme definition.
        /// </summary>
        /// <returns>The current <see cref="ThemeDefinition"/>.</returns>
        public ThemeDefinition GetCurrentTheme()
        {
            return _currentTheme;
        }

        /// <summary>
        /// Applies the styles of a specific theme (or the current theme if null) to a single visual element and its hierarchy.
        /// </summary>
        /// <param name="element">The visual element to apply the theme to.</param>
        /// <param name="theme">The theme to apply. If null, the current active theme is used.</param>
        public void ApplyThemeStylesToElement(VisualElement element, ThemeDefinition theme = null)
        {
            if (element == null) throw new ArgumentNullException(nameof(element));
            ThemeDefinition themeToApply = theme ?? _currentTheme;

            if (themeToApply == null)
            {
                Debug.LogWarning("[MasterThemeService] Cannot apply styles, no theme provided and no current theme set.");
                return;
            }
            
            // Clear existing theme-specific stylesheets first to avoid conflicts (optional, depends on strategy)
            // This part needs careful management if elements can have multiple non-theme stylesheets.
            // A common approach is to tag theme stylesheets and only remove those.
            // For simplicity, we'll assume we remove all and re-add.
            // This is a naive approach. A better way would be to manage specific theme stylesheets.
            // element.styleSheets.Clear(); 

            if (themeToApply.BaseStyleSheet != null)
            {
                if (!element.styleSheets.Contains(themeToApply.BaseStyleSheet))
                {
                    element.styleSheets.Add(themeToApply.BaseStyleSheet);
                }
            }

            // Apply accessibility overrides
            // This logic would depend on how IMasterAccessibilityService exposes current settings
            // and how ThemeDefinition stores overrides (e.g., one override sheet per colorblind mode)
            var colorblindMode = _masterAccessibilityService.GetCurrentColorblindMode();
            // Example: if (colorblindMode != Enums.ColorblindMode.None) { ... apply specific sheet ... }
            // For now, just a placeholder for applying all accessibility overrides.
            foreach (var overrideSheet in themeToApply.AccessibilityStyleOverrides)
            {
                if (overrideSheet != null && !element.styleSheets.Contains(overrideSheet))
                {
                     // Logic to determine IF this specific override should be applied based on current accessibility settings
                     // For instance, an override stylesheet might be named "ProtanopiaOverride.uss"
                     // This is simplified; a real system would map current settings to specific override sheets.
                    element.styleSheets.Add(overrideSheet);
                }
            }
        }

        /// <summary>
        /// Applies the base theme stylesheet and accessibility overrides to a root visual element and its descendants.
        /// This is the primary method used during initialization and screen/popup loading.
        /// </summary>
        /// <param name="rootElement">The root visual element of the tree to theme.</param>
        /// <param name="theme">The theme definition to apply.</param>
        public void ApplyThemeToVisualTree(VisualElement rootElement, ThemeDefinition theme)
        {
            if (rootElement == null) throw new ArgumentNullException(nameof(rootElement));
            if (theme == null) throw new ArgumentNullException(nameof(theme));

            // Clear previous theme stylesheets from the root.
            // This needs to be more intelligent to not remove non-theme related stylesheets.
            // A common pattern is to add/remove specific theme classes to the root,
            // and have USS selectors target those classes.
            // Or, manage stylesheets added by this service explicitly.
            
            // Naive removal of all stylesheets for simplicity here. NOT PRODUCTION READY.
            // rootElement.styleSheets.Clear(); 
            
            // More robust: Remove only stylesheets previously added by this service.
            // This requires tracking them or using a convention.
            // For example, if all theme stylesheets are known:
            if (_currentTheme != null && _currentTheme != theme) // If switching themes
            {
                if (_currentTheme.BaseStyleSheet != null) rootElement.styleSheets.Remove(_currentTheme.BaseStyleSheet);
                foreach(var oldOverride in _currentTheme.AccessibilityStyleOverrides)
                {
                    if (oldOverride != null) rootElement.styleSheets.Remove(oldOverride);
                }
            }


            // Add base theme stylesheet
            if (theme.BaseStyleSheet != null)
            {
                if (!rootElement.styleSheets.Contains(theme.BaseStyleSheet))
                {
                    rootElement.styleSheets.Add(theme.BaseStyleSheet);
                }
            }
            else
            {
                Debug.LogWarning($"[MasterThemeService] Theme '{theme.ThemeName}' has no BaseStyleSheet assigned.");
            }

            // Add accessibility-specific stylesheets
            // This is a simplified application; actual logic would be more nuanced
            // based on current accessibility settings from _masterAccessibilityService.
            var currentMode = _masterAccessibilityService.GetCurrentColorblindMode();
            // Example: Find an override stylesheet matching currentMode.ToString() + "Override.uss" in theme.AccessibilityStyleOverrides

            foreach (var accessibilitySheet in theme.AccessibilityStyleOverrides)
            {
                if (accessibilitySheet != null)
                {
                    // TODO: Add logic to conditionally add this sheet based on _masterAccessibilityService state.
                    // For example, if the sheet is named "Protanopia.uss", only add if Protanopia mode is active.
                    // This requires a naming convention or metadata on the StyleSheet assets.
                    // For now, adding all available overrides for demonstration if any mode is active.
                    if (currentMode != Enums.ColorblindMode.None) // Simplified condition
                    {
                        if (!rootElement.styleSheets.Contains(accessibilitySheet))
                        {
                             rootElement.styleSheets.Add(accessibilitySheet);
                        }
                    }
                    else // If no colorblind mode, ensure these overrides are removed
                    {
                        rootElement.styleSheets.Remove(accessibilitySheet);
                    }
                }
            }
            // Force re-evaluation of styles (might be needed in some UI Toolkit versions/scenarios)
            rootElement.MarkDirtyRepaint();
        }
    }
}