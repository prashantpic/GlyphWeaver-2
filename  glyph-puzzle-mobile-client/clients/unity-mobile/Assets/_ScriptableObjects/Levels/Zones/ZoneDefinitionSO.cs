using UnityEngine;
using System.Collections.Generic;
using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For LevelDefinitionSO

namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels
{
    /// <summary>
    /// ScriptableObject defining the properties of a game zone.
    /// Holds immutable information about a game zone, including its constituent levels and criteria for unlocking it.
    /// Used by PlayerProgressionService and LevelSelection UI.
    /// Implements REQ-CGLE-001.
    /// </summary>
    [CreateAssetMenu(fileName = "ZoneDefinition", menuName = "GlyphPuzzle/Levels/Zone Definition")]
    public class ZoneDefinitionSO : ScriptableObject
    {
        [Tooltip("Unique identifier for the zone.")]
        public string ZoneId;

        [Tooltip("Localization key for the zone's display name.")]
        public string ZoneNameKey;

        [Tooltip("List of level definitions belonging to this zone.")]
        public List<LevelDefinitionSO> LevelsInZone;

        [Tooltip("Localization key for the text describing how to unlock this zone.")]
        public string UnlockConditionDescriptionKey;

        [Tooltip("Optional. The zone that must be completed to unlock this one.")]
        public ZoneDefinitionSO RequiredPreviousZoneCompleted;

        [Tooltip("Order in which this zone appears in selection.")]
        public int SortOrder;
    }
}