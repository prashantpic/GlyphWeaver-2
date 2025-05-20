#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For LevelDefinitionSO

namespace GlyphPuzzle.Mobile.Editor.Levels
{
    /// <summary>
    /// Custom editor for LevelDefinitionSO.
    /// Enhances the editing experience for LevelDefinition ScriptableObjects.
    /// Could include visual tools for placing glyphs/obstacles.
    /// Implements REQ-CGLE-007.
    /// </summary>
    [CustomEditor(typeof(LevelDefinitionSO))]
    public class LevelDefinitionSOEditor : UnityEditor.Editor
    {
        // SerializedProperties for all members of LevelDefinitionSO
        SerializedProperty levelIdProp;
        SerializedProperty zoneIdProp;
        SerializedProperty gridDimensionsProp;
        SerializedProperty glyphSpawnDataProp;
        SerializedProperty obstacleSpawnDataProp;
        SerializedProperty puzzleTypesProp;
        SerializedProperty timeLimitSecondsProp;
        SerializedProperty moveLimitProp;
        SerializedProperty verifiedSolutionPathsProp;
        SerializedProperty shiftingTilePatternsProp;
        SerializedProperty complexityParametersProp;
        
        // For potential visual grid editor
        private bool showGridEditor = false;

        void OnEnable()
        {
            levelIdProp = serializedObject.FindProperty("LevelId");
            zoneIdProp = serializedObject.FindProperty("ZoneId");
            gridDimensionsProp = serializedObject.FindProperty("GridDimensions");
            glyphSpawnDataProp = serializedObject.FindProperty("GlyphSpawnData");
            obstacleSpawnDataProp = serializedObject.FindProperty("ObstacleSpawnData");
            puzzleTypesProp = serializedObject.FindProperty("PuzzleTypes");
            timeLimitSecondsProp = serializedObject.FindProperty("TimeLimitSeconds");
            moveLimitProp = serializedObject.FindProperty("MoveLimit");
            verifiedSolutionPathsProp = serializedObject.FindProperty("VerifiedSolutionPaths");
            shiftingTilePatternsProp = serializedObject.FindProperty("ShiftingTilePatterns");
            complexityParametersProp = serializedObject.FindProperty("ComplexityParameters");
        }

        public override void OnInspectorGUI()
        {
            serializedObject.Update();

            EditorGUILayout.LabelField("Basic Information", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(levelIdProp);
            EditorGUILayout.PropertyField(zoneIdProp);

            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Grid Configuration", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(gridDimensionsProp);
            
            // Optional: Basic visual grid editor toggle
            // showGridEditor = EditorGUILayout.Toggle("Show Visual Grid Editor (WIP)", showGridEditor);
            // if (showGridEditor)
            // {
            //     DrawVisualGridEditor((LevelDefinitionSO)target);
            // }

            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Spawning Data", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(glyphSpawnDataProp, true);
            EditorGUILayout.PropertyField(obstacleSpawnDataProp, true);
            
            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Gameplay Rules & Parameters", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(puzzleTypesProp, true);
            EditorGUILayout.PropertyField(timeLimitSecondsProp);
            EditorGUILayout.PropertyField(moveLimitProp);
            EditorGUILayout.PropertyField(complexityParametersProp, true);


            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Solutions & Advanced Patterns", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(verifiedSolutionPathsProp, true);
            EditorGUILayout.PropertyField(shiftingTilePatternsProp, true);
            
            // Example: Auto-generate LevelId if empty
            if (string.IsNullOrEmpty(levelIdProp.stringValue))
            {
                if (GUILayout.Button("Generate Level ID"))
                {
                    levelIdProp.stringValue = System.Guid.NewGuid().ToString();
                }
            }

            serializedObject.ApplyModifiedProperties();
        }
        
        // void DrawVisualGridEditor(LevelDefinitionSO levelDef)
        // {
        //     // This would be a more complex implementation using EditorGUILayout.BeginHorizontal/Vertical,
        //     // GUILayout.Button for each cell, etc. to visually represent gridDimensionsProp
        //     // and allow clicking to place/edit glyphs/obstacles from spawn data lists.
        //     // For brevity, this is just a placeholder.
        //     EditorGUILayout.HelpBox("Visual Grid Editor (Work In Progress): Display grid cells here, allow clicking to add/modify glyphs/obstacles.", MessageType.Info);
        //     Vector2Int dims = levelDef.GridDimensions;
        //     if (dims.x > 0 && dims.y > 0)
        //     {
        //         for(int y = dims.y -1; y >= 0; y--) // Draw top to bottom
        //         {
        //             EditorGUILayout.BeginHorizontal();
        //             for(int x=0; x < dims.x; x++)
        //             {
        //                 // Check if glyph or obstacle exists at (x,y)
        //                 string cellContent = "."; 
        //                 // Query levelDef.GlyphSpawnData and levelDef.ObstacleSpawnData
        //                 if (GUILayout.Button(cellContent, GUILayout.Width(25), GUILayout.Height(25)))
        //                 {
        //                     // Logic to add/edit item at (x,y)
        //                     Debug.Log($"Clicked cell ({x},{y}) in custom editor.");
        //                 }
        //             }
        //             EditorGUILayout.EndHorizontal();
        //         }
        //     }
        // }
    }
}
#endif