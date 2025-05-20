using GlyphPuzzle.UI.Coordinator.State;

namespace GlyphPuzzle.UI.Coordinator.Events
{
    /// <summary>
    /// Data structure for events broadcasted when a global UI setting is modified,
    /// allowing observers to react.
    /// </summary>
    public struct GlobalSettingChangedEvent
    {
        /// <summary>
        /// Identifier of the changed setting (e.g., "Language", "Theme", "ColorblindMode").
        /// </summary>
        public string SettingKey;

        /// <summary>
        /// The new value of the setting.
        /// </summary>
        public object NewValue;

        /// <summary>
        /// Initializes a new instance of the <see cref="GlobalSettingChangedEvent"/> struct.
        /// </summary>
        /// <param name="settingKey">The key identifying the setting that changed.</param>
        /// <param name="newValue">The new value of the setting.</param>
        public GlobalSettingChangedEvent(string settingKey, object newValue)
        {
            SettingKey = settingKey;
            NewValue = newValue;
        }
    }
}