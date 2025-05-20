```csharp
using GlyphPuzzle.UI.Coordinator.Interfaces;
using GlyphPuzzle.UI.Coordinator.Integration;
using GlyphPuzzle.UI.Coordinator.State; // For ThemeDefinition if needed directly
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Coordinator.Core
{
    /// <summary>
    /// Manages UI screen/panel transitions, loading, and overall UI flow.
    /// Central point for UI navigation.
    /// This component orchestrates UI views, their lifecycle, transitions, 
    /// and binding ViewModels, ensuring appropriate state and resources are loaded.
    /// </summary>
    public class UIOrchestrator : MonoBehaviour, IUIOrchestrator
    {
        // Dependencies - these would typically be injected by a DI framework or a bootstrap process
        public IAssetLoadingService AssetLoadingService { get; set; }
        public ICrossScreenStateManager CrossScreenStateManager { get; set; }
        public IMasterThemeService MasterThemeService { get; set; }
        public UIComponentsProvider UIComponentsProvider { get; set; } // As per spec, this is a concrete class
        public ISharedAnimationService SharedAnimationService { get; set; }

        private VisualElement _rootVisualElement;
        private VisualElement _activeScreenElement;
        private string _currentScreenName;
        private readonly Stack<VisualElement> _popupStack = new Stack<VisualElement>();
        private readonly Dictionary<string, VisualElement> _loadedScreens = new Dictionary<string, VisualElement>();

        /// <summary>
        /// Initializes the UIOrchestrator with the root visual element and applies initial settings.
        /// </summary>
        /// <param name="rootVisualElement">The root VisualElement to manage UI screens within.</param>
        /// <returns>A task that completes when initialization is finished.</returns>
        public async Task InitializeAsync(VisualElement rootVisualElement)
        {
            _rootVisualElement = rootVisualElement;
            if (_rootVisualElement == null)
            {
                Debug.LogError("[UIOrchestrator] RootVisualElement is null. UI cannot be initialized.");
                return;
            }

            // Apply initial theme and accessibility. MasterThemeService should handle this.
            // Assuming MasterThemeService.InitializeAsync has been called and it applies to its own root,
            // or we explicitly apply it here. The spec for MasterThemeService InitializeAsync suggests it takes a root.
            // If MasterThemeService is initialized elsewhere with the root, this explicit call might be redundant
            // or could be a re-application if needed.
            if (MasterThemeService != null && MasterThemeService.GetCurrentTheme() != null)
            {
                MasterThemeService.ApplyThemeStylesToElement(_rootVisualElement, MasterThemeService.GetCurrentTheme());
            } 
            else if (MasterThemeService == null)
            {
                Debug.LogWarning("[UIOrchestrator] MasterThemeService is not set. Cannot apply initial theme.");
            }
            else
            {
                Debug.LogWarning("[UIOrchestrator] No current theme available from MasterThemeService on initialization.");
            }
            
            // Load initial screen based on configuration or game state (e.g., from CrossScreenStateManager)
            // For simplicity, this example doesn't automatically load an initial screen here.
            // This would typically be driven by game logic (e.g., show main menu or tutorial).
            await Task.CompletedTask;
        }

        /// <summary>
        /// Asynchronously loads and displays a new screen.
        /// </summary>
        /// <param name="screenName">The identifier for the screen to load (e.g., UXML asset key).</param>
        /// <param name="viewModelData">Optional data to bind to the screen's ViewModel.</param>
        /// <returns>A task that completes when the screen is loaded and displayed.</returns>
        public async Task LoadScreenAsync(string screenName, object viewModelData = null)
        {
            if (AssetLoadingService == null)
            {
                Debug.LogError("[UIOrchestrator] AssetLoadingService is not set. Cannot load screen.");
                return;
            }
            if (_rootVisualElement == null)
            {
                Debug.LogError("[UIOrchestrator] RootVisualElement is not set. Cannot load screen.");
                return;
            }

            // Unload or hide the current screen
            if (_activeScreenElement != null)
            {
                if (SharedAnimationService != null)
                {
                    await SharedAnimationService.FadeOutAsync(_activeScreenElement, 0.3f);
                }
                _activeScreenElement.RemoveFromHierarchy();
                // Optionally, cache or dispose of _activeScreenElement resources
                _loadedScreens.Remove(_currentScreenName); // Simple removal, could be pooled
                _activeScreenElement = null;
            }

            VisualTreeAsset screenAsset = await AssetLoadingService.LoadUXMLAsync(screenName);
            if (screenAsset == null)
            {
                Debug.LogError($"[UIOrchestrator] Failed to load UXML for screen: {screenName}");
                return;
            }

            VisualElement newScreenElement = screenAsset.Instantiate();
            newScreenElement.style.width = new StyleLength(Length.Percent(100));
            newScreenElement.style.height = new StyleLength(Length.Percent(100));
            
            // Apply current theme and accessibility
            if (MasterThemeService != null)
            {
                MasterThemeService.ApplyThemeStylesToElement(newScreenElement);
            }

            // ViewModel Binding (simplified)
            if (viewModelData != null)
            {
                var bindable = newScreenElement.Q(null, "bindable-component") as IBindable; // Example, actual binding is complex
                bindable?.Bind(viewModelData);
            }
            
            _rootVisualElement.Add(newScreenElement);
            _activeScreenElement = newScreenElement;
            _currentScreenName = screenName;
            _loadedScreens[screenName] = newScreenElement;

            if (SharedAnimationService != null)
            {
                newScreenElement.style.opacity = 0; // Start transparent for fade-in
                await SharedAnimationService.FadeInAsync(newScreenElement, 0.3f);
            }
        }

        /// <summary>
        /// Asynchronously loads and displays a popup over the current screen.
        /// </summary>
        /// <param name="popupName">The identifier for the popup to load.</param>
        /// <param name="viewModelData">Optional data to bind to the popup's ViewModel.</param>
        /// <returns>A task that completes when the popup is loaded and displayed.</returns>
        public async Task ShowPopupAsync(string popupName, object viewModelData = null)
        {
            if (AssetLoadingService == null)
            {
                Debug.LogError("[UIOrchestrator] AssetLoadingService is not set. Cannot show popup.");
                return;
            }
            if (_rootVisualElement == null)
            {
                Debug.LogError("[UIOrchestrator] RootVisualElement is not set. Cannot show popup.");
                return;
            }

            VisualTreeAsset popupAsset = await AssetLoadingService.LoadUXMLAsync(popupName);
            if (popupAsset == null)
            {
                Debug.LogError($"[UIOrchestrator] Failed to load UXML for popup: {popupName}");
                return;
            }

            VisualElement popupElement = popupAsset.Instantiate();
            // Style popup appropriately (e.g., center, cover screen, etc.)
            popupElement.style.position = Position.Absolute;
            popupElement.style.left = 0;
            popupElement.style.top = 0;
            popupElement.style.right = 0;
            popupElement.style.bottom = 0;
            popupElement.style.justifyContent = Justify.Center;
            popupElement.style.alignItems = Align.Center;
            // Add a backdrop if desired, or make the popup self-contained with a backdrop

            if (MasterThemeService != null)
            {
                MasterThemeService.ApplyThemeStylesToElement(popupElement);
            }

            // ViewModel Binding (simplified)
            if (viewModelData != null)
            {
                var bindable = popupElement.Q(null, "bindable-component") as IBindable;
                bindable?.Bind(viewModelData);
            }

            _rootVisualElement.Add(popupElement);
            _popupStack.Push(popupElement);

            if (SharedAnimationService != null)
            {
                popupElement.style.opacity = 0;
                await SharedAnimationService.FadeInAsync(popupElement, 0.2f);
            }
        }

        /// <summary>
        /// Closes the currently active screen or a specific screen by name.
        /// If no screen name is provided, it defaults to closing the topmost screen/popup.
        /// </summary>
        /// <param name="screenName">The identifier of the screen or popup to close. If null or empty, closes the topmost UI element.</param>
        public async void CloseScreen(string screenName)
        {
             if (string.IsNullOrEmpty(screenName)) // Close topmost (popup or screen)
            {
                if (_popupStack.Count > 0)
                {
                    VisualElement topPopup = _popupStack.Pop();
                    if (SharedAnimationService != null)
                    {
                        await SharedAnimationService.FadeOutAsync(topPopup, 0.2f);
                    }
                    topPopup.RemoveFromHierarchy();
                    // Dispose or pool 'topPopup' resources if necessary
                }
                else if (_activeScreenElement != null)
                {
                    CloseScreenInternal(_currentScreenName, _activeScreenElement);
                    _activeScreenElement = null;
                    _currentScreenName = null;
                }
            }
            else if (_loadedScreens.TryGetValue(screenName, out VisualElement elementToClose))
            {
                if (elementToClose == _activeScreenElement)
                {
                    CloseScreenInternal(screenName, elementToClose);
                    _activeScreenElement = null;
                    _currentScreenName = null;
                }
                else // Potentially a popup or inactive screen, handle as needed
                {
                     // This logic might need to be more robust if non-active screens can be closed by name
                    Debug.LogWarning($"[UIOrchestrator] Attempting to close screen '{screenName}' which is not the active full screen. Popups should be closed by calling CloseScreen(null).");
                    if (_popupStack.Contains(elementToClose)) // Naive check, better to manage popups by name too
                    {
                        // Proper popup closing logic would involve removing from _popupStack and hierarchy
                        // For simplicity, this demo focuses on the active screen or topmost popup.
                        if (SharedAnimationService != null) await SharedAnimationService.FadeOutAsync(elementToClose, 0.2f);
                        elementToClose.RemoveFromHierarchy();
                        _loadedScreens.Remove(screenName);
                        // Rebuild popup stack if necessary, or ensure correct popup is popped.
                    }
                }
            }
            else
            {
                Debug.LogWarning($"[UIOrchestrator] Screen '{screenName}' not found to close.");
            }
        }
        
        private async void CloseScreenInternal(string screenName, VisualElement screenElement)
        {
            if (screenElement == null) return;

            if (SharedAnimationService != null)
            {
                await SharedAnimationService.FadeOutAsync(screenElement, 0.3f);
            }
            screenElement.RemoveFromHierarchy();
            _loadedScreens.Remove(screenName);
            // Dispose or pool resources if necessary
        }


        /// <summary>
        /// Gets the identifier of the currently active full screen.
        /// </summary>
        /// <returns>The name of the current screen, or null if no screen is active.</returns>
        public string GetCurrentScreenName()
        {
            return _currentScreenName;
        }

        // Placeholder for a simple bindable interface, real implementation would be more robust
        public interface IBindable
        {
            void Bind(object viewModel);
        }
    }
}
```