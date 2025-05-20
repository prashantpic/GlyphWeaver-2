```csharp
using GlyphPuzzle.UI.Coordinator.Enums;
using GlyphPuzzle.UI.Coordinator.Interfaces;
using GlyphPuzzle.UI.Coordinator.State;
using System;
using System.Collections.Generic;
using System.Globalization; // Required for CultureInfo
using UniRx; // Assuming UniRx is used for IReactiveProperty and IReactiveCommand

namespace GlyphPuzzle.UI.Coordinator.ViewModels
{
    /// <summary>
    /// ViewModel for managing and exposing global UI settings to views.
    /// Follows MVVM principles, providing data binding and command handling for UI elements
    /// related to global settings. This would be bound to a global settings UI screen/panel.
    /// </summary>
    public class GlobalSettingsViewModel : IDisposable
    {
        private readonly ICrossScreenStateManager _crossScreenStateManager;
        private readonly IMasterLocalizationService _localizationService;
        private readonly IMasterThemeService _themeService;
        private readonly IMasterAccessibilityService _accessibilityService;
        private readonly CompositeDisposable _disposables = new CompositeDisposable();

        /// <summary>
        /// Gets the reactive property for the selected language code.
        /// </summary>
        public IReactiveProperty<string> SelectedLanguageCode { get; }

        /// <summary>
        /// Gets the reactive property for the active theme name.
        /// </summary>
        public IReactiveProperty<string> ActiveThemeName { get; }

        /// <summary>
        /// Gets the reactive property for the current colorblind mode.
        /// </summary>
        public IReactiveProperty<Enums.ColorblindMode> CurrentColorblindMode { get; }

        /// <summary>
        /// Gets the reactive property for whether reduced motion is enabled.
        /// </summary>
        public IReactiveProperty<bool> IsReducedMotionEnabled { get; }

        /// <summary>
        /// Gets the reactive property for the text scale factor.
        /// </summary>
        public IReactiveProperty<float> TextScaleFactor { get; }

        /// <summary>
        /// Gets the list of available language codes (e.g., "en", "fr").
        /// This would typically be populated from IMasterLocalizationService.
        /// </summary>
        public IReadOnlyList<string> AvailableLanguages { get; private set; } // Example: { "en", "es", "fr" }

        /// <summary>
        /// Gets the list of available theme names.
        /// This would typically be populated from IMasterThemeService or UICoordinatorSettings.
        /// </summary>
        public IReadOnlyList<string> AvailableThemes { get; private set; } // Example: { "Default", "Dark", "HighContrast" }

        /// <summary>
        /// Command to update the application language. Parameter is the language code (string).
        /// </summary>
        public ReactiveCommand<string> UpdateLanguageCommand { get; }

        /// <summary>
        /// Command to select and apply a new UI theme. Parameter is the theme name (string).
        /// </summary>
        public ReactiveCommand<string> SelectThemeCommand { get; }

        /// <summary>
        /// Command to set the colorblind mode. Parameter is the ColorblindMode enum.
        /// </summary>
        public ReactiveCommand<Enums.ColorblindMode> SetColorblindModeCommand { get; }

        /// <summary>
        /// Command to toggle the reduced motion setting.
        /// </summary>
        public ReactiveCommand ToggleReducedMotionCommand { get; }
        
        /// <summary>
        /// Command to change the text scale factor. Parameter is the new scale factor (float).
        /// </summary>
        public ReactiveCommand<float> ChangeTextScaleCommand { get; }

        public GlobalSettingsViewModel(
            ICrossScreenStateManager crossScreenStateManager,
            IMasterLocalizationService localizationService,
            IMasterThemeService themeService,
            IMasterAccessibilityService accessibilityService)
        {
            _crossScreenStateManager = crossScreenStateManager ?? throw new ArgumentNullException(nameof(crossScreenStateManager));
            _localizationService = localizationService ?? throw new ArgumentNullException(nameof(localizationService));
            _themeService = themeService ?? throw new ArgumentNullException(nameof(themeService));
            _accessibilityService = accessibilityService ?? throw new ArgumentNullException(nameof(accessibilityService));

            var currentSettings = _crossScreenStateManager.GetSettingsState();

            SelectedLanguageCode = new ReactiveProperty<string>(currentSettings.SelectedLanguageCode);
            ActiveThemeName = new ReactiveProperty<string>(currentSettings.ActiveThemeName);
            CurrentColorblindMode = new ReactiveProperty<Enums.ColorblindMode>(currentSettings.CurrentColorblindMode);
            IsReducedMotionEnabled = new ReactiveProperty<bool>(currentSettings.IsReducedMotionEnabled);
            TextScaleFactor = new ReactiveProperty<float>(currentSettings.TextScaleFactor);

            // Populate available languages and themes (example, actual population logic may vary)
            // This might involve async calls in a real scenario, or be pre-loaded.
            // For simplicity, using placeholder data or synchronous calls.
            AvailableLanguages = GetAvailableLanguagesFromService(); // Placeholder
            AvailableThemes = GetAvailableThemesFromService();     // Placeholder

            // Subscribe to state changes from CrossScreenStateManager
            _crossScreenStateManager.SubscribeToSettingsChanges(OnSettingsChanged)
                .AddTo(_disposables);

            // --- Command Definitions ---

            UpdateLanguageCommand = new ReactiveCommand<string>().WithSubscribe(async langCode =>
            {
                if (_localizationService != null && SelectedLanguageCode.Value != langCode)
                {
                    // Assuming IMasterLocalizationService.SetLanguageAsync takes string langCode
                    // The interface spec shows CultureInfo, so we'd need to convert.
                    // For this example, let's assume a method that takes string code for simplicity,
                    // or we adjust the command/service.
                    // Let's adapt to the specified interface:
                    try
                    {
                        var culture = new CultureInfo(langCode);
                        await _localizationService.SetLanguageAsync(culture);
                        // State manager update should be handled by SetLanguageAsync internally
                    }
                    catch (CultureNotFoundException ex)
                    {
                        UnityEngine.Debug.LogError($"Invalid language code: {langCode}. {ex.Message}");
                    }
                }
            }).AddTo(_disposables);

            SelectThemeCommand = new ReactiveCommand<string>().WithSubscribe(async themeName =>
            {
                if (_themeService != null && ActiveThemeName.Value != themeName)
                {
                    await _themeService.SetActiveThemeAsync(themeName);
                    // State manager update should be handled by SetActiveThemeAsync internally
                }
            }).AddTo(_disposables);

            SetColorblindModeCommand = new ReactiveCommand<Enums.ColorblindMode>().WithSubscribe(mode =>
            {
                if (_accessibilityService != null && CurrentColorblindMode.Value != mode)
                {
                    _accessibilityService.SetColorblindMode(mode);
                    // State manager update should be handled by SetColorblindMode internally
                }
            }).AddTo(_disposables);

            ToggleReducedMotionCommand = new ReactiveCommand().WithSubscribe(() =>
            {
                if (_accessibilityService != null)
                {
                    _accessibilityService.SetReducedMotion(!IsReducedMotionEnabled.Value);
                    // State manager update should be handled by SetReducedMotion internally
                }
            }).AddTo(_disposables);
            
            ChangeTextScaleCommand = new ReactiveCommand<float>().WithSubscribe(scale =>
            {
                if (_accessibilityService != null && TextScaleFactor.Value != scale)
                {
                     // Add validation for scale factor if needed (e.g., min/max)
                    _accessibilityService.SetTextScaleFactor(scale);
                    // State manager update should be handled by SetTextScaleFactor internally
                }
            }).AddTo(_disposables);
        }

        private void OnSettingsChanged(UISettingsState newSettings)
        {
            SelectedLanguageCode.Value = newSettings.SelectedLanguageCode;
            ActiveThemeName.Value = newSettings.ActiveThemeName;
            CurrentColorblindMode.Value = newSettings.CurrentColorblindMode;
            IsReducedMotionEnabled.Value = newSettings.IsReducedMotionEnabled;
            TextScaleFactor.Value = newSettings.TextScaleFactor;
        }

        private List<string> GetAvailableLanguagesFromService()
        {
            // In a real app, this would call _localizationService to get available locales
            // and convert them to language codes.
            // Example: _localizationService.GetAvailableLocales().Select(l => l.Identifier.Code).ToList();
            // For now, placeholder:
            var locales = UnityEngine.Localization.Settings.LocalizationSettings.GetAvailableLocales().Locales;
            var langCodes = new List<string>();
            foreach(var locale in locales)
            {
                langCodes.Add(locale.Identifier.Code);
            }
            return langCodes.Count > 0 ? langCodes : new List<string> { "en", "es", "ja" }; // Fallback placeholder
        }

        private List<string> GetAvailableThemesFromService()
        {
            // In a real app, this would call _themeService or use UICoordinatorSettings via _themeService
            // Example: _themeService.GetAvailableThemeNames();
            // For now, placeholder:
            // This would ideally come from UICoordinatorSettings loaded by MasterThemeService
            return new List<string> { "Default-Light", "Default-Dark", "HighContrast" }; // Placeholder
        }

        /// <summary>
        /// Disposes of resources used by the ViewModel, primarily subscriptions.
        /// </summary>
        public void Dispose()
        {
            _disposables.Dispose();
        }
    }
}
```