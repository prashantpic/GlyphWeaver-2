using GlyphPuzzle.UI.Coordinator.Interfaces;
using System;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.UIElements; // For VisualTreeAsset and StyleSheet

namespace GlyphPuzzle.UI.Coordinator.Services
{
    /// <summary>
    /// Handles the asynchronous loading sequence and management of UI assets,
    /// ensuring they are available when needed.
    /// Uses Unity Addressables for asset loading.
    /// </summary>
    public class AssetLoadingService : IAssetLoadingService
    {
        /// <summary>
        /// Asynchronously loads a UXML file (VisualTreeAsset).
        /// </summary>
        /// <param name="pathOrKey">The Addressable key or path for the UXML asset.</param>
        /// <returns>A task that resolves to the loaded <see cref="VisualTreeAsset"/>, or null on failure.</returns>
        public async Task<VisualTreeAsset> LoadUXMLAsync(string pathOrKey)
        {
            return await LoadAssetAsync<VisualTreeAsset>(pathOrKey, "UXML");
        }

        /// <summary>
        /// Asynchronously loads a USS file (StyleSheet).
        /// </summary>
        /// <param name="pathOrKey">The Addressable key or path for the USS asset.</param>
        /// <returns>A task that resolves to the loaded <see cref="StyleSheet"/>, or null on failure.</returns>
        public async Task<StyleSheet> LoadStyleSheetAsync(string pathOrKey)
        {
            return await LoadAssetAsync<StyleSheet>(pathOrKey, "StyleSheet");
        }

        /// <summary>
        /// Asynchronously loads a Texture2D asset.
        /// </summary>
        /// <param name="pathOrKey">The Addressable key or path for the Texture2D asset.</param>
        /// <returns>A task that resolves to the loaded <see cref="Texture2D"/>, or null on failure.</returns>
        public async Task<Texture2D> LoadTextureAsync(string pathOrKey)
        {
            return await LoadAssetAsync<Texture2D>(pathOrKey, "Texture");
        }

        /// <summary>
        /// Asynchronously loads a ScriptableObject asset of a specified type.
        /// </summary>
        /// <typeparam name="T">The type of the ScriptableObject to load.</typeparam>
        /// <param name="pathOrKey">The Addressable key or path for the ScriptableObject asset.</param>
        /// <returns>A task that resolves to the loaded ScriptableObject of type T, or null on failure.</returns>
        public async Task<T> LoadScriptableObjectAsync<T>(string pathOrKey) where T : ScriptableObject
        {
            return await LoadAssetAsync<T>(pathOrKey, "ScriptableObject");
        }

        /// <summary>
        /// Generic helper method to load an asset using Addressables.
        /// </summary>
        /// <typeparam name="TAsset">The type of the asset to load.</typeparam>
        /// <param name="key">The Addressable key for the asset.</param>
        /// <param name="assetTypeName">A friendly name for the asset type, used in logging.</param>
        /// <returns>The loaded asset, or null if loading failed.</returns>
        private async Task<TAsset> LoadAssetAsync<TAsset>(string key, string assetTypeName) where TAsset : UnityEngine.Object
        {
            if (string.IsNullOrEmpty(key))
            {
                Debug.LogError($"[AssetLoadingService] Null or empty key provided for loading {assetTypeName}.");
                return null;
            }

            AsyncOperationHandle<TAsset> handle = Addressables.LoadAssetAsync<TAsset>(key);
            try
            {
                await handle.Task; // Await the completion of the loading operation

                if (handle.Status == AsyncOperationStatus.Succeeded)
                {
                    Debug.Log($"[AssetLoadingService] Successfully loaded {assetTypeName}: {key}");
                    return handle.Result;
                }
                else
                {
                    Debug.LogError($"[AssetLoadingService] Failed to load {assetTypeName} with key '{key}'. Status: {handle.Status}, Error: {handle.OperationException}");
                    Addressables.Release(handle); // Release the handle on failure
                    return null;
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"[AssetLoadingService] Exception while loading {assetTypeName} with key '{key}': {ex}");
                if (handle.IsValid()) Addressables.Release(handle); // Ensure release on exception
                return null;
            }
            // Note: Successful handles should be released by the consumer of the asset when no longer needed,
            // or if this service implements caching, it would manage the lifetime.
            // For simplicity here, we assume the caller manages the loaded asset's lifetime (Addressables.Release(asset) or Addressables.Release(handle)).
            // If this service were to cache, it would store 'handle' and release it when the cache evicts.
        }

        /// <summary>
        /// Releases an asset previously loaded via Addressables.
        /// This should be called when the asset is no longer needed to free up memory.
        /// </summary>
        /// <typeparam name="TAsset">The type of the asset to release.</typeparam>
        /// <param name="asset">The asset instance to release.</param>
        public void ReleaseAsset<TAsset>(TAsset asset) where TAsset : UnityEngine.Object
        {
            if (asset != null)
            {
                Addressables.Release(asset);
                Debug.Log($"[AssetLoadingService] Released asset: {asset.name}");
            }
        }
         /// <summary>
        /// Releases an asset previously loaded via an Addressables handle.
        /// This should be called when the asset is no longer needed to free up memory.
        /// </summary>
        /// <param name="handle">The AsyncOperationHandle of the asset to release.</param>
        public void ReleaseAssetHandle<TAsset>(AsyncOperationHandle<TAsset> handle) where TAsset : UnityEngine.Object
        {
            if (handle.IsValid())
            {
                Addressables.Release(handle);
                 Debug.Log($"[AssetLoadingService] Released asset handle for key: {handle.DebugName}");
            }
        }
    }
}