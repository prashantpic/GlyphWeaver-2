using System.Threading.Tasks;
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Coordinator.Interfaces
{
    /// <summary>
    /// Defines the contract for UI orchestration, including screen loading, transitions, and popup management.
    /// Manages the lifecycle and display of UI screens and popups.
    /// </summary>
    public interface IUIOrchestrator
    {
        /// <summary>
        /// Initializes the orchestrator with the root visual element.
        /// This method should be called once at the start.
        /// </summary>
        /// <param name="rootVisualElement">The root VisualElement to which screens will be added.</param>
        /// <returns>A task that completes when initialization is finished.</returns>
        Task InitializeAsync(VisualElement rootVisualElement);

        /// <summary>
        /// Asynchronously loads and displays a new screen.
        /// </summary>
        /// <param name="screenName">The identifier or path of the screen to load.</param>
        /// <param name="viewModelData">Optional data to pass to the screen's ViewModel.</param>
        /// <returns>A task that completes when the screen is loaded and displayed.</returns>
        Task LoadScreenAsync(string screenName, object viewModelData = null);

        /// <summary>
        /// Asynchronously loads and displays a popup.
        /// </summary>
        /// <param name="popupName">The identifier or path of the popup to load.</param>
        /// <param name="viewModelData">Optional data to pass to the popup's ViewModel.</param>
        /// <returns>A task that completes when the popup is loaded and displayed.</returns>
        Task ShowPopupAsync(string popupName, object viewModelData = null);

        /// <summary>
        /// Closes and unloads the specified screen.
        /// </summary>
        /// <param name="screenName">The identifier of the screen to close.</param>
        void CloseScreen(string screenName);
        
        /// <summary>
        /// Closes the currently active popup. If multiple popups are stacked, it closes the topmost one.
        /// </summary>
        /// <returns>A task that completes when the popup is closed.</returns>
        Task CloseCurrentPopupAsync();


        /// <summary>
        /// Gets the identifier of the currently active full screen.
        /// </summary>
        /// <returns>The name of the current screen, or null if no screen is active.</returns>
        string GetCurrentScreenName();
    }
}