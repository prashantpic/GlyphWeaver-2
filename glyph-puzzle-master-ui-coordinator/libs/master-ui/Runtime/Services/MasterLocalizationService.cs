using GlyphPuzzle.UI.Coordinator.Interfaces;
using GlyphPuzzle.UI.Coordinator.Config;
using GlyphPuzzle.UI.Coordinator.State; // For UISettingsState
using System;
using System.Globalization;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Localization;
using UnityEngine.Localization.Settings;
using UnityEngine.Localization.Tables; // Required for StringTableEntry

namespace GlyphPuzzle.UI.Coordinator.Services
{
    /// <summary>
    /// Manages game localization, providing an interface to change languages
    /// and retrieve localized strings and assets using Unity Localization.
    /// </summary>
    public class MasterLocalizationService : IMasterLocalizationService
    {
        private readonly ICrossScreenStateManager _crossScreenStateManager;
        private readonly UICoordinatorSettings _coordinatorSettings;

        /// <summary>
        /// Gets the currently active locale.
        /// </summary>
        public Locale CurrentLocale => LocalizationSettings.SelectedLocale;

        /// <summary>
        /// Initializes a new instance of the <see cref="MasterLocalizationService"/> class.
        /// </summary>
        /// <param name="crossScreenStateManager">The cross-screen state manager.</param>
        /// <param name="coordinatorSettings">The UI coordinator settings.</param>
        public MasterLocalizationService(ICrossScreenStateManager crossScreenStateManager, UICoordinatorSettings coordinatorSettings)
        {
            _crossScreenStateManager = crossScreenStateManager ?? throw new ArgumentNullException(nameof(crossScreenStateManager));
            _coordinatorSettings = coordinatorSettings ?? throw new ArgumentNullException(nameof(coordinatorSettings));
        }

        /// <summary>
        /// Initializes the localization service. Sets the initial locale based on saved settings or defaults.
        /// </summary>
        public async Task InitializeAsync()
        {
            if (!LocalizationSettings.InitializationOperation.IsDone)
            {
                await LocalizationSettings.InitializationOperation.Task;
            }

            string languageCode = _crossScreenStateManager.GetSettingsState().SelectedLanguageCode;
            Locale initialLocale = null;

            if (!string.IsNullOrEmpty(languageCode))
            {
                var culture = new CultureInfo(languageCode);
                initialLocale = LocalizationSettings.AvailableLocales.GetLocale(culture.Name); // Use culture.Name for robust matching
                 if (initialLocale == null) // Try with just language part if full culture name not found
                {
                    initialLocale = LocalizationSettings.AvailableLocales.GetLocale(culture.TwoLetterISOLanguageName);
                }
            }
            
            if (initialLocale == null && !string.IsNullOrEmpty(_coordinatorSettings.DefaultLanguageCode))
            {
                var defaultCulture = new CultureInfo(_coordinatorSettings.DefaultLanguageCode);
                initialLocale = LocalizationSettings.AvailableLocales.GetLocale(defaultCulture.Name);
                 if (initialLocale == null)
                {
                    initialLocale = LocalizationSettings.AvailableLocales.GetLocale(defaultCulture.TwoLetterISOLanguageName);
                }
            }

            if (initialLocale != null)
            {
                LocalizationSettings.SelectedLocale = initialLocale;
            }
            else if (LocalizationSettings.AvailableLocales.Locales.Count > 0)
            {
                 Debug.LogWarning("[MasterLocalizationService] Initial locale not found, falling back to first available locale.");
                 LocalizationSettings.SelectedLocale = LocalizationSettings.AvailableLocales.Locales[0];
            }
            else
            {
                Debug.LogError("[MasterLocalizationService] No locales available in LocalizationSettings.");
            }
        }
        
        /// <summary>
        /// Changes the application language to the specified locale.
        /// This method is now internal as per the interface change.
        /// The public interface uses CultureInfo.
        /// </summary>
        /// <param name="languageCode">The language code (e.g., "en", "fr-FR").</param>
        private async Task SetLanguageInternalAsync(string languageCode)
        {
            if (string.IsNullOrEmpty(languageCode))
            {
                Debug.LogError("[MasterLocalizationService] Language code cannot be null or empty.");
                return;
            }

            Locale localeToSet = LocalizationSettings.AvailableLocales.GetLocale(languageCode);
            if (localeToSet == null) // Try with just language part if full culture name not found
            {
                try
                {
                    var culture = new CultureInfo(languageCode);
                    localeToSet = LocalizationSettings.AvailableLocales.GetLocale(culture.TwoLetterISOLanguageName);
                }
                catch (CultureNotFoundException)
                {
                    Debug.LogError($"[MasterLocalizationService] Culture for language code '{languageCode}' not found.");
                    return;
                }
            }


            if (localeToSet != null)
            {
                LocalizationSettings.SelectedLocale = localeToSet;
                // Wait for the change to complete (optional, but good practice if UI needs immediate update)
                // await LocalizationSettings.InitializationOperation.Task; // Re-check if this is needed or if setting SelectedLocale is enough.
                                                                          // Typically, SelectedLocale change triggers updates.

                UISettingsState currentSettings = _crossScreenStateManager.GetSettingsState();
                currentSettings.SelectedLanguageCode = languageCode;
                _crossScreenStateManager.UpdateSettingsState(currentSettings);
                Debug.Log($"[MasterLocalizationService] Language set to: {languageCode}");
            }
            else
            {
                Debug.LogError($"[MasterLocalizationService] Locale for language code '{languageCode}' not found.");
            }
        }

        /// <summary>
        /// Changes the application language using CultureInfo.
        /// </summary>
        /// <param name="cultureInfo">The culture info representing the desired language.</param>
        public async Task SetLanguageAsync(CultureInfo cultureInfo)
        {
            if (cultureInfo == null) throw new ArgumentNullException(nameof(cultureInfo));
            await SetLanguageInternalAsync(cultureInfo.Name); // Use culture.Name (e.g., "en-US")
        }


        /// <summary>
        /// Retrieves a localized string.
        /// </summary>
        /// <param name="tableKey">The key of the localization table.</param>
        /// <param name="entryKey">The key of the string entry within the table.</param>
        /// <param name="arguments">Optional arguments for string formatting.</param>
        /// <returns>The localized string, or a placeholder if not found.</returns>
        public string GetLocalizedString(string tableKey, string entryKey, params object[] arguments)
        {
            if (!LocalizationSettings.InitializationOperation.IsDone)
            {
                 Debug.LogWarning("[MasterLocalizationService] Localization not yet initialized. Returning key.");
                 return $"{tableKey}:{entryKey}";
            }
            
            // Synchronous retrieval if table is already loaded.
            // For truly async, use GetLocalizedStringAsync.
            var tableEntryReference = new TableEntryReference(tableKey, entryKey);
            var localizedString = LocalizationSettings.StringDatabase.GetLocalizedString(tableEntryReference, arguments);
            
            if (localizedString == null || localizedString.IsError) // Check IsError for issues.
            {
                Debug.LogWarning($"[MasterLocalizationService] Localized string not found for Table: '{tableKey}', Entry: '{entryKey}'. Error: {localizedString?.Error}");
                return $"[{tableKey}:{entryKey}]";
            }
            return localizedString.Value;
        }

        /// <summary>
        /// Asynchronously retrieves a localized asset.
        /// </summary>
        /// <typeparam name="T">The type of the asset to retrieve.</typeparam>
        /// <param name="tableKey">The key of the localization table.</param>
        /// <param name="entryKey">The key of the asset entry within the table.</param>
        /// <returns>A task that resolves to the localized asset, or null if not found.</returns>
        public async Task<T> GetLocalizedAssetAsync<T>(string tableKey, string entryKey) where T : UnityEngine.Object
        {
             if (!LocalizationSettings.InitializationOperation.IsDone)
            {
                 Debug.LogWarning("[MasterLocalizationService] Localization not yet initialized. Returning null for asset.");
                 await LocalizationSettings.InitializationOperation.Task; // Ensure initialization completes
            }

            var tableEntryReference = new TableEntryReference(tableKey, entryKey);
            var operation = LocalizationSettings.AssetDatabase.GetLocalizedAssetAsync<T>(tableEntryReference);
            await operation.Task;

            if (operation.Status == UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationStatus.Succeeded)
            {
                return operation.Result;
            }
            else
            {
                Debug.LogWarning($"[MasterLocalizationService] Localized asset not found for Table: '{tableKey}', Entry: '{entryKey}'. Status: {operation.Status}, Error: {operation.OperationException}");
                return null;
            }
        }
    }
}