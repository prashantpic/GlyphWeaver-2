using UnityEngine;
using System;
using GlyphPuzzle.Mobile.Core.Enums; // For CatalystInputType

namespace GlyphPuzzle.Mobile.DomainLogic.Settings
{
    /// <summary>
    /// ScriptableObject for managing accessibility settings.
    /// Holds data related to Catalyst interaction options (timer adjustment, timer disable, alternative input).
    /// Notifies listeners when settings change. Values are saved/loaded by SaveLoadManager.
    /// Implements REQ-ACC-001, REQ-ACC-010.
    /// </summary>
    [CreateAssetMenu(fileName = "AccessibilitySettings", menuName = "GlyphPuzzle/Settings/Accessibility Settings")]
    public class AccessibilitySettingsSO : ScriptableObject
    {
        [Tooltip("Multiplier for Catalyst activation timer. REQ-ACC-001.1")]
        [Range(0.5f, 3.0f)]
        public float CatalystTimerMultiplier = 1.0f;

        [Tooltip("Whether Catalyst timer is completely disabled. REQ-ACC-001.2")]
        public bool IsCatalystTimerDisabled = false;

        [Tooltip("Selected input method for Catalyst activation. REQ-ACC-001.3")]
        public CatalystInputType CatalystInputMethod = CatalystInputType.Tap;

        /// <summary>
        /// Event raised when settings are changed.
        /// </summary>
        public event Action OnSettingsChanged;

        /// <summary>
        /// Sets the Catalyst timer multiplier and raises the OnSettingsChanged event.
        /// </summary>
        /// <param name="multiplier">The new timer multiplier.</param>
        public void SetCatalystTimerMultiplier(float multiplier)
        {
            CatalystTimerMultiplier = Mathf.Clamp(multiplier, 0.5f, 3.0f);
            OnSettingsChanged?.Invoke();
        }

        /// <summary>
        /// Sets whether the Catalyst timer is disabled and raises the OnSettingsChanged event.
        /// </summary>
        /// <param name="isDisabled">True to disable the timer, false otherwise.</param>
        public void SetCatalystTimerDisabled(bool isDisabled)
        {
            IsCatalystTimerDisabled = isDisabled;
            OnSettingsChanged?.Invoke();
        }

        /// <summary>
        /// Sets the Catalyst input method and raises the OnSettingsChanged event.
        /// </summary>
        /// <param name="inputMethod">The new input method.</param>
        public void SetCatalystInputMethod(CatalystInputType inputMethod)
        {
            CatalystInputMethod = inputMethod;
            OnSettingsChanged?.Invoke();
        }

#if UNITY_EDITOR
        // Optional: Automatically invoke OnSettingsChanged when values are changed in the editor
        // This helps in testing and development without needing to call methods explicitly
        private float _editorCatalystTimerMultiplier;
        private bool _editorIsCatalystTimerDisabled;
        private CatalystInputType _editorCatalystInputMethod;

        private void OnEnable()
        {
            _editorCatalystTimerMultiplier = CatalystTimerMultiplier;
            _editorIsCatalystTimerDisabled = IsCatalystTimerDisabled;
            _editorCatalystInputMethod = CatalystInputMethod;
        }

        private void OnValidate()
        {
            bool changed = false;
            if (System.Math.Abs(_editorCatalystTimerMultiplier - CatalystTimerMultiplier) > float.Epsilon)
            {
                _editorCatalystTimerMultiplier = CatalystTimerMultiplier;
                changed = true;
            }
            if (_editorIsCatalystTimerDisabled != IsCatalystTimerDisabled)
            {
                _editorIsCatalystTimerDisabled = IsCatalystTimerDisabled;
                changed = true;
            }
            if (_editorCatalystInputMethod != CatalystInputMethod)
            {
                _editorCatalystInputMethod = CatalystInputMethod;
                changed = true;
            }

            if (changed && Application.isPlaying) // Only invoke if changed and in play mode to avoid issues
            {
                // OnSettingsChanged?.Invoke(); // Be cautious with this in OnValidate during play mode if it triggers heavy logic
                // Better to rely on explicit method calls or UI updates to trigger the event
            }
        }
#endif
    }
}