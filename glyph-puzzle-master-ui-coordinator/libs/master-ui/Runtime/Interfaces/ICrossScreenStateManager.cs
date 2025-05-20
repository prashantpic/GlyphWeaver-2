using System;
using GlyphPuzzle.UI.Coordinator.State;

namespace GlyphPuzzle.UI.Coordinator.Interfaces
{
    /// <summary>
    /// Defines the contract for managing and accessing shared UI state across different screens and components.
    /// This includes user settings, tutorial progress, and other global UI-related data.
    /// </summary>
    public interface ICrossScreenStateManager
    {
        /// <summary>
        /// Gets the current UI settings state.
        /// </summary>
        /// <returns>The current <see cref="UISettingsState"/>.</returns>
        UISettingsState GetSettingsState();

        /// <summary>
        /// Updates the UI settings state and persists the changes.
        /// Notifies subscribers of the change.
        /// </summary>
        /// <param name="newState">The new UI settings state.</param>
        void UpdateSettingsState(UISettingsState newState);

        /// <summary>
        /// Gets the current tutorial flow state.
        /// </summary>
        /// <returns>The current <see cref="TutorialFlowState"/>.</returns>
        TutorialFlowState GetTutorialFlowState();

        /// <summary>
        /// Updates the tutorial flow state and persists the changes.
        /// Notifies relevant subscribers of the change.
        /// </summary>
        /// <param name="newState">The new tutorial flow state.</param>
        void UpdateTutorialFlowState(TutorialFlowState newState);

        /// <summary>
        /// Subscribes to changes in the UI settings state.
        /// </summary>
        /// <param name="onSettingsChanged">The action to execute when settings change. The parameter is the new <see cref="UISettingsState"/>.</param>
        /// <returns>An <see cref="IDisposable"/> that can be used to unsubscribe.</returns>
        IDisposable SubscribeToSettingsChanges(Action<UISettingsState> onSettingsChanged);

        /// <summary>
        /// Subscribes to changes in the Tutorial flow state.
        /// </summary>
        /// <param name="onTutorialStateChanged">The action to execute when tutorial state changes. The parameter is the new <see cref="TutorialFlowState"/>.</param>
        /// <returns>An <see cref="IDisposable"/> that can be used to unsubscribe.</returns>
        IDisposable SubscribeToTutorialChanges(Action<TutorialFlowState> onTutorialStateChanged);
        
        /// <summary>
        /// Asynchronously loads all managed states (UI settings, tutorial progress) from persistence.
        /// </summary>
        /// <returns>A task that completes when all states are loaded.</returns>
        System.Threading.Tasks.Task LoadAllStateAsync();
    }
}