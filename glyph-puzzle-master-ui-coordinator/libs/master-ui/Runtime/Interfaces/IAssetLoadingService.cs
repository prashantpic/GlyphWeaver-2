using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Coordinator.Interfaces
{
    /// <summary>
    /// Defines the contract for asynchronously loading UI assets.
    /// This service abstracts the underlying asset loading mechanism (e.g., Resources, Addressables).
    /// </summary>
    public interface IAssetLoadingService
    {
        /// <summary>
        /// Asynchronously loads a UXML file (<see cref="VisualTreeAsset"/>).
        /// </summary>
        /// <param name="pathOrKey">The path or Addressable key of the UXML asset.</param>
        /// <returns>A task that resolves to the loaded <see cref="VisualTreeAsset"/>, or null if loading fails.</returns>
        Task<VisualTreeAsset> LoadUXMLAsync(string pathOrKey);

        /// <summary>
        /// Asynchronously loads a USS file (<see cref="StyleSheet"/>).
        /// </summary>
        /// <param name="pathOrKey">The path or Addressable key of the USS asset.</param>
        /// <returns>A task that resolves to the loaded <see cref="StyleSheet"/>, or null if loading fails.</returns>
        Task<StyleSheet> LoadStyleSheetAsync(string pathOrKey);

        /// <summary>
        /// Asynchronously loads a texture (<see cref="Texture2D"/>).
        /// </summary>
        /// <param name="pathOrKey">The path or Addressable key of the texture asset.</param>
        /// <returns>A task that resolves to the loaded <see cref="Texture2D"/>, or null if loading fails.</returns>
        Task<Texture2D> LoadTextureAsync(string pathOrKey);

        /// <summary>
        /// Asynchronously loads a <see cref="ScriptableObject"/> of a specific type.
        /// </summary>
        /// <typeparam name="T">The type of the ScriptableObject to load.</typeparam>
        /// <param name="pathOrKey">The path or Addressable key of the ScriptableObject asset.</param>
        /// <returns>A task that resolves to the loaded ScriptableObject of type T, or null if loading fails.</returns>
        Task<T> LoadScriptableObjectAsync<T>(string pathOrKey) where T : ScriptableObject;
        
        /// <summary>
        /// Releases an asset that was previously loaded, if the underlying system supports manual release (e.g., Addressables).
        /// </summary>
        /// <param name="asset">The asset to release.</param>
        void ReleaseAsset(Object asset);
    }
}