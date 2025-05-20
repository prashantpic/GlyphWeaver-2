using UnityEngine;
using UnityEngine.UI;
using TMPro;
using GlyphPuzzle.Mobile.DomainLogic.Settings; // For AccessibilitySettingsSO
using GlyphPuzzle.Mobile.Core.Enums;         // For CatalystInputType
using System; // For Enum

namespace GlyphPuzzle.Mobile.Presentation.UI.Settings
{
    /// <summary>
    /// Manages UI elements for configuring Catalyst accessibility settings.
    /// Populates UI based on AccessibilitySettingsSO and updates it on change.
    /// Implements REQ-ACC-001.
    /// </summary>
    public class AccessibilitySettingsView : MonoBehaviour
    {
        [Header("UI Controls - REQ-ACC-001")]
        [Tooltip("Slider for Catalyst Timer Multiplier. REQ-ACC-001.1")]
        [SerializeField] private Slider catalystTimerMultiplierSlider;

        [Tooltip("Toggle for Disable Catalyst Timer. REQ-ACC-001.2")]
        [SerializeField] private Toggle disableCatalystTimerToggle;

        [Tooltip("Dropdown for Catalyst Input Method. REQ-ACC-001.3")]
        [SerializeField] private TMP_Dropdown catalystInputDropdown;

        [Header("Data Source")]
        [Tooltip("Reference to the AccessibilitySettings ScriptableObject.")]
        [SerializeField] private AccessibilitySettingsSO accessibilitySettingsSO;

        private bool isInitialized = false;

        /// <summary>
        /// Populates UI from SO and subscribes to SO changes.
        /// </summary>
        void OnEnable()
        {
            if (accessibilitySettingsSO == null)
            {
                Debug.LogError("AccessibilitySettingsSO is not assigned in AccessibilitySettingsView.");
                this.enabled = false; // Disable component if SO is missing
                return;
            }

            InitializeDropdown();
            LoadSettings(); // Populate UI with current SO values

            // Subscribe to UI control changes to update the SO
            if (catalystTimerMultiplierSlider != null)
                catalystTimerMultiplierSlider.onValueChanged.AddListener(OnCatalystTimerMultiplierChanged);
            if (disableCatalystTimerToggle != null)
                disableCatalystTimerToggle.onValueChanged.AddListener(OnDisableCatalystTimerChanged);
            if (catalystInputDropdown != null)
                catalystInputDropdown.onValueChanged.AddListener(OnCatalystInputMethodChanged);

            // Subscribe to SO changes to update UI if changed externally (e.g., by code or another UI)
            accessibilitySettingsSO.OnSettingsChanged += LoadSettings;
            isInitialized = true;
        }

        /// <summary>
        /// Unsubscribes from SO changes and UI control events.
        /// </summary>
        void OnDisable()
        {
            if (!isInitialized || accessibilitySettingsSO == null) return;

            if (catalystTimerMultiplierSlider != null)
                catalystTimerMultiplierSlider.onValueChanged.RemoveListener(OnCatalystTimerMultiplierChanged);
            if (disableCatalystTimerToggle != null)
                disableCatalystTimerToggle.onValueChanged.RemoveListener(OnDisableCatalystTimerChanged);
            if (catalystInputDropdown != null)
                catalystInputDropdown.onValueChanged.RemoveListener(OnCatalystInputMethodChanged);
            
            accessibilitySettingsSO.OnSettingsChanged -= LoadSettings;
            isInitialized = false;
        }
        
        private void InitializeDropdown()
        {
            if (catalystInputDropdown != null && catalystInputDropdown.options.Count == 0)
            {
                catalystInputDropdown.ClearOptions();
                foreach (string name in Enum.GetNames(typeof(CatalystInputType)))
                {
                    catalystInputDropdown.options.Add(new TMP_Dropdown.OptionData(name));
                }
                catalystInputDropdown.RefreshShownValue();
            }
        }


        /// <summary>
        /// Loads current settings from AccessibilitySettingsSO and updates UI elements.
        /// </summary>
        public void LoadSettings()
        {
            if (accessibilitySettingsSO == null) return;

            if (catalystTimerMultiplierSlider != null)
            {
                // Temporarily remove listener to prevent feedback loop when setting value
                catalystTimerMultiplierSlider.onValueChanged.RemoveListener(OnCatalystTimerMultiplierChanged);
                catalystTimerMultiplierSlider.value = accessibilitySettingsSO.CatalystTimerMultiplier;
                catalystTimerMultiplierSlider.onValueChanged.AddListener(OnCatalystTimerMultiplierChanged);
            }

            if (disableCatalystTimerToggle != null)
            {
                disableCatalystTimerToggle.onValueChanged.RemoveListener(OnDisableCatalystTimerChanged);
                disableCatalystTimerToggle.isOn = accessibilitySettingsSO.IsCatalystTimerDisabled;
                disableCatalystTimerToggle.onValueChanged.AddListener(OnDisableCatalystTimerChanged);
            }
            
            if (catalystInputDropdown != null)
            {
                catalystInputDropdown.onValueChanged.RemoveListener(OnCatalystInputMethodChanged);
                catalystInputDropdown.value = (int)accessibilitySettingsSO.CatalystInputMethod;
                catalystInputDropdown.onValueChanged.AddListener(OnCatalystInputMethodChanged);
            }
        }

        /// <summary>
        /// Called when the Catalyst Timer Multiplier slider value changes.
        /// Updates the AccessibilitySettingsSO.
        /// </summary>
        /// <param name="value">The new slider value.</param>
        public void OnCatalystTimerMultiplierChanged(float value)
        {
            if (accessibilitySettingsSO != null)
            {
                accessibilitySettingsSO.SetCatalystTimerMultiplier(value);
            }
        }

        /// <summary>
        /// Called when the Disable Catalyst Timer toggle value changes.
        /// Updates the AccessibilitySettingsSO.
        /// </summary>
        /// <param name="value">The new toggle value.</param>
        public void OnDisableCatalystTimerChanged(bool value)
        {
            if (accessibilitySettingsSO != null)
            {
                accessibilitySettingsSO.SetCatalystTimerDisabled(value);
            }
        }

        /// <summary>
        /// Called when the Catalyst Input Method dropdown value changes.
        /// Updates the AccessibilitySettingsSO.
        /// </summary>
        /// <param name="value">The new dropdown index.</param>
        public void OnCatalystInputMethodChanged(int value)
        {
            if (accessibilitySettingsSO != null)
            {
                accessibilitySettingsSO.SetCatalystInputMethod((CatalystInputType)value);
            }
        }
    }
}