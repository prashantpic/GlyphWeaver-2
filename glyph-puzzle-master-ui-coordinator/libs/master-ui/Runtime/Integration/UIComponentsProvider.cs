using GlyphPuzzle.UI.Coordinator.Interfaces; // For IAssetLoadingService
using System;
using System.Threading.Tasks;
using UnityEngine; // For Debug
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Coordinator.Integration
{
    /// <summary>
    /// Acts as an abstraction layer for retrieving, instantiating, and potentially
    /// pre-configuring reusable UI components defined in REPO-UI-COMPONENTS.
    /// </summary>
    public class UIComponentsProvider
    {
        private readonly IAssetLoadingService _assetLoadingService;

        /// <summary>
        /// Initializes a new instance of the <see cref="UIComponentsProvider"/> class.
        /// </summary>
        /// <param name="assetLoadingService">The asset loading service dependency.</param>
        public UIComponentsProvider(IAssetLoadingService assetLoadingService)
        {
            _assetLoadingService = assetLoadingService ?? throw new ArgumentNullException(nameof(assetLoadingService));
        }

        /// <summary>
        /// Loads and instantiates a shared UI component (e.g., from a UXML template)
        /// and optionally binds a ViewModel.
        /// </summary>
        /// <param name="componentNameKey">The Addressable key for the UXML VisualTreeAsset of the component.</param>
        /// <param name="viewModel">Optional ViewModel to bind to the component's script (if applicable).</param>
        /// <returns>
        /// A task that resolves to the instantiated <see cref="VisualElement"/> hierarchy of the component,
        /// or null if loading or instantiation fails.
        /// </returns>
        public async Task<VisualElement> GetSharedVisualElementAsync(string componentNameKey, object viewModel = null)
        {
            if (string.IsNullOrEmpty(componentNameKey))
            {
                Debug.LogError("[UIComponentsProvider] Component name key cannot be null or empty.");
                return null;
            }

            VisualTreeAsset visualTreeAsset = await _assetLoadingService.LoadUXMLAsync(componentNameKey);

            if (visualTreeAsset == null)
            {
                Debug.LogError($"[UIComponentsProvider] Failed to load UXML for component key: {componentNameKey}");
                return null;
            }

            try
            {
                VisualElement componentInstance = visualTreeAsset.Instantiate();
                // In a production system, UXML assets loaded this way are often not released immediately by Addressables
                // unless they are unique instances. If the VTA itself should be released after instantiation,
                // it would need to be handled carefully, possibly by cloning if the VTA is needed again.
                // For now, assume AssetLoadingService or a higher layer manages VTA lifetime if necessary.
                // _assetLoadingService.ReleaseAsset(visualTreeAsset); // Potentially release if VTA is cloned or not needed

                if (componentInstance == null)
                {
                    Debug.LogError($"[UIComponentsProvider] Failed to instantiate component from UXML: {componentNameKey}");
                    // visualTreeAsset might still need to be released if it was successfully loaded.
                    // If LoadUXMLAsync returns a handle, that should be released.
                    // If it returns the asset, then Addressables.Release(visualTreeAsset) is correct.
                    // Assuming _assetLoadingService handles this or the caller does.
                    return null;
                }

                // ViewModel Binding (Simplified Placeholder)
                if (viewModel != null)
                {
                    // This is complex. It requires the component instance (or a script attached to its root)
                    // to have a known interface or method for binding.
                    // Example: If components have a C# script that implements IBindableComponent<TViewModel>
                    // var bindable = componentInstance.userData as IBindable; // Or find a specific child controller
                    // if (bindable != null) { bindable.Bind(viewModel); }
                    // else { Debug.LogWarning($"[UIComponentsProvider] Component '{componentNameKey}' loaded, but no bindable target found for ViewModel or ViewModel type mismatch."); }
                    
                    // A common pattern for UI Toolkit is that the root element of a component has a C# controller/behaviour attached to it
                    // during authoring (if it's part of a prefab that gets converted or if the UXML is just for structure).
                    // If the component is purely UXML/USS driven and its logic is in the screen that uses it,
                    // then the screen's C# code would manipulate `componentInstance` directly using the viewModel.

                    // For now, just log it.
                    Debug.Log($"[UIComponentsProvider] ViewModel provided for component '{componentNameKey}'. Binding logic is a placeholder.");
                    
                    // One way is to set the viewModel to the `userData` property, and the component's own script can pick it up.
                    componentInstance.userData = viewModel;
                }
                
                Debug.Log($"[UIComponentsProvider] Successfully provided shared visual element for: {componentNameKey}");
                return componentInstance;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[UIComponentsProvider] Exception during component instantiation or binding for '{componentNameKey}': {ex.Message}");
                // Ensure visualTreeAsset is released if an exception occurs after loading it.
                // Addressables.Release(visualTreeAsset); // if not handled by AssetLoadingService
                return null;
            }
        }
    }
}