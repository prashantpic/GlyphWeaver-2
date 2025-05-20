using System.Globalization;
using System.Threading.Tasks;
using UnityEngine.Localization;

namespace GlyphPuzzle.UI.Coordinator.Interfaces
{
    /// <summary>
    /// Defines the contract for localization services, including language switching,
    /// and retrieval of localized strings and assets.
    /// </summary>
    public interface IMasterLocalizationService
    {
        /// <summary>
        /// Initializes the localization service.
        /// </summary>
        /// <returns>A task that completes when initialization is finished.</returns>
        Task InitializeAsync();

        /// <summary>
        /// Sets the application's active language.
        /// </summary>
        /// <param name="cultureInfo">The culture information for the desired language (e.g., "en-US", "fr-FR").</param>
        /// <returns>A task that completes when the language has been set and resources are updated.</returns>
        Task SetLanguageAsync(CultureInfo cultureInfo);
        
        /// <summary>
        /// Sets the application's active language using a language code string.
        /// </summary>
        /// <param name="languageCode">The language code string (e.g., "en", "fr").</param>
        /// <returns>A task that completes when the language has been set and resources are updated.</returns>
        Task SetLanguageAsync(string languageCode);


        /// <summary>
        /// Retrieves a localized string.
        /// </summary>
        /// <param name="tableKey">The key of the string table.</param>
        /// <param name="entryKey">The key of the string entry within the table.</param>
        /// <param name="arguments">Optional arguments for formatting the string.</param>
        /// <returns>The localized string, or a placeholder if not found.</returns>
        string GetLocalizedString(string tableKey, string entryKey, params object[] arguments);

        /// <summary>
        /// Asynchronously retrieves a localized asset.
        /// </summary>
        /// <typeparam name="T">The type of the asset to load (e.g., Texture2D, AudioClip, Sprite).</typeparam>
        /// <param name="tableKey">The key of the asset table.</param>
        /// <param name="entryKey">The key of the asset entry within the table.</param>
        /// <returns>A task that resolves to the localized asset, or null if not found.</returns>
        Task<T> GetLocalizedAssetAsync<T>(string tableKey, string entryKey) where T : UnityEngine.Object;

        /// <summary>
        /// Gets the currently active <see cref="Locale"/>.
        /// </summary>
        Locale CurrentLocale { get; }
        
        /// <summary>
        /// Gets a list of available locales supported by the application.
        /// </summary>
        System.Collections.Generic.IReadOnlyList<Locale> GetAvailableLocales();
    }
}