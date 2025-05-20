using GlyphPuzzle.UI.Coordinator.Interfaces;
using GlyphPuzzle.UI.Coordinator.State;
using GlyphPuzzle.UI.Coordinator.Integration;
using System;
using System.Threading.Tasks;
using UniRx;
using UnityEngine; // Required for Debug.Log, or a proper logging service

namespace GlyphPuzzle.UI.Coordinator.Core
{
    /// <summary>
    /// Manages shared UI state across different screens and components.
    /// Loads/saves state via MobileClientFacade and propagates changes.
    /// </summary>
    public class CrossScreenStateManager : ICrossScreenStateManager
    {
        private readonly MobileClientFacade _mobileClientFacade;

        private readonly ReactiveProperty<UISettingsState> _currentSettings = new ReactiveProperty<UISettingsState>();
        /// <summary>
        /// Observable property holding the current UI settings.
        /// </summary>
        public IReadOnlyReactiveProperty<UISettingsState> CurrentSettings => _currentSettings;

        private readonly ReactiveProperty<TutorialFlowState> _currentTutorialState = new ReactiveProperty<TutorialFlowState>();
        /// <summary>
        /// Observable property holding the current tutorial progress.
        /// </summary>
        public IReadOnlyReactiveProperty<TutorialFlowState> CurrentTutorialState => _currentTutorialState;

        private readonly Subject<UISettingsState> _settingsChangedSubject = new Subject<UISettingsState>();

        /// <summary>
        /// Initializes a new instance of the <see cref="CrossScreenStateManager"/> class.
        /// </summary>
        /// <param name="mobileClientFacade">The facade for interacting with mobile client persistence.</param>
        public CrossScreenStateManager(MobileClientFacade mobileClientFacade)
        {
            _mobileClientFacade = mobileClientFacade ?? throw new ArgumentNullException(nameof(mobileClientFacade));
        }

        /// <summary>
        /// Asynchronously loads all UI-related state (settings and tutorial progress).
        /// </summary>
        public async Task LoadAllStateAsync()
        {
            try
            {
                UISettingsState settings = await _mobileClientFacade.LoadPlayerUISettingsAsync();
                _currentSettings.Value = settings; // This will trigger observers if value changes

                TutorialFlowState tutorialState = await _mobileClientFacade.LoadTutorialProgressAsync();
                _currentTutorialState.Value = tutorialState ?? new TutorialFlowState(); // Ensure not null
            }
            catch (Exception ex)
            {
                Debug.LogError($"[CrossScreenStateManager] Error loading state: {ex.Message}");
                // Initialize with default states if loading fails
                _currentSettings.Value = new UISettingsState(); // Consider default constructor or factory
                _currentTutorialState.Value = new TutorialFlowState();
            }
        }

        /// <summary>
        /// Gets the current UI settings state.
        /// </summary>
        /// <returns>The current <see cref="UISettingsState"/>.</returns>
        public UISettingsState GetSettingsState()
        {
            return _currentSettings.Value;
        }

        /// <summary>
        /// Updates the UI settings state and initiates saving.
        /// </summary>
        /// <param name="newState">The new settings state.</param>
        public void UpdateSettingsState(UISettingsState newState)
        {
            if (!_currentSettings.Value.Equals(newState)) // Basic check to avoid unnecessary updates/saves
            {
                _currentSettings.Value = newState;
                _settingsChangedSubject.OnNext(newState);
                SaveSettingsStateAsync().Forget(); // Fire and forget saving
            }
        }
        
        /// <summary>
        /// Gets the current tutorial flow state.
        /// </summary>
        /// <returns>The current <see cref="TutorialFlowState"/>.</returns>
        public TutorialFlowState GetTutorialFlowState()
        {
            return _currentTutorialState.Value;
        }

        /// <summary>
        /// Updates the tutorial flow state and initiates saving.
        /// </summary>
        /// <param name="newState">The new tutorial flow state.</param>
        public void UpdateTutorialFlowState(TutorialFlowState newState)
        {
            if (_currentTutorialState.Value != newState) // Basic check for reference or value equality
            {
                 _currentTutorialState.Value = newState;
                 SaveTutorialStateAsync().Forget(); // Fire and forget saving
            }
        }

        /// <summary>
        /// Asynchronously saves the current UI settings state.
        /// </summary>
        public async Task SaveSettingsStateAsync()
        {
            try
            {
                await _mobileClientFacade.SavePlayerUISettingsAsync(_currentSettings.Value);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[CrossScreenStateManager] Error saving settings state: {ex.Message}");
            }
        }

        /// <summary>
        /// Asynchronously saves the current tutorial flow state.
        /// </summary>
        public async Task SaveTutorialStateAsync()
        {
            try
            {
                await _mobileClientFacade.SaveTutorialProgressAsync(_currentTutorialState.Value);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[CrossScreenStateManager] Error saving tutorial state: {ex.Message}");
            }
        }

        /// <summary>
        /// Subscribes to changes in UI settings state.
        /// </summary>
        /// <param name="onSettingsChanged">The action to perform when settings change.</param>
        /// <returns>An <see cref="IDisposable"/> for unsubscribing.</returns>
        public IDisposable SubscribeToSettingsChanges(Action<UISettingsState> onSettingsChanged)
        {
            if (onSettingsChanged == null) throw new ArgumentNullException(nameof(onSettingsChanged));
            // Immediately provide the current state to the new subscriber
            onSettingsChanged(_currentSettings.Value); 
            return _settingsChangedSubject.Subscribe(onSettingsChanged);
        }
    }
}