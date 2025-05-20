#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For ZoneDefinitionSO

namespace GlyphPuzzle.Mobile.Editor.Levels
{
    /// <summary>
    /// Custom editor script for ZoneDefinitionSO to improve usability in the Unity Inspector.
    /// Enhances the Unity Editor experience for creating and modifying ZoneDefinition ScriptableObjects.
    /// Implements REQ-CGLE-001.
    /// </summary>
    [CustomEditor(typeof(ZoneDefinitionSO))]
    public class ZoneDefinitionSOEditor : UnityEditor.Editor
    {
        SerializedProperty zoneIdProp;
        SerializedProperty zoneNameKeyProp;
        SerializedProperty levelsInZoneProp;
        SerializedProperty unlockConditionDescriptionKeyProp;
        SerializedProperty requiredPreviousZoneCompletedProp;
        SerializedProperty sortOrderProp;

        void OnEnable()
        {
            zoneIdProp = serializedObject.FindProperty("ZoneId");
            zoneNameKeyProp = serializedObject.FindProperty("ZoneNameKey");
            levelsInZoneProp = serializedObject.FindProperty("LevelsInZone");
            unlockConditionDescriptionKeyProp = serializedObject.FindProperty("UnlockConditionDescriptionKey");
            requiredPreviousZoneCompletedProp = serializedObject.FindProperty("RequiredPreviousZoneCompleted");
            sortOrderProp = serializedObject.FindProperty("SortOrder");
        }

        public override void OnInspectorGUI()
        {
            serializedObject.Update();

            EditorGUILayout.PropertyField(zoneIdProp);
            EditorGUILayout.PropertyField(zoneNameKeyProp);
            
            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Levels", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(levelsInZoneProp, true); // 'true' includes children for list

            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Unlock Conditions", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(unlockConditionDescriptionKeyProp);
            EditorGUILayout.PropertyField(requiredPreviousZoneCompletedProp);

            EditorGUILayout.Space();
            EditorGUILayout.PropertyField(sortOrderProp);

            // Example: Add a button to auto-populate ZoneId if empty
            if (string.IsNullOrEmpty(zoneIdProp.stringValue))
            {
                if (GUILayout.Button("Generate Zone ID"))
                {
                    zoneIdProp.stringValue = System.Guid.NewGuid().ToString();
                }
            }
            
            // Example: Validate that SortOrder is unique among all ZoneDefinitionSOs (more complex, requires finding all assets)

            serializedObject.ApplyModifiedProperties();
        }
    }
}
#endif