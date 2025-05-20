namespace GlyphPuzzle.UI.Management.Editor
{
    using UnityEditor;
    using UnityEngine;

    [CustomEditor(typeof(ThemeDefinitionSO))]
    public class ThemeDefinitionSOEditor : Editor
    {
        public override void OnInspectorGUI()
        {
            serializedObject.Update();

            // Draw the default inspector which is usually sufficient for a list of StyleSheets
            // and a theme name.
            DrawDefaultInspector();

            // You could add custom validation or helper buttons here if needed.
            // For example, a button to verify all referenced StyleSheet assets exist.
            // if (GUILayout.Button("Verify StyleSheets"))
            // {
            //     ThemeDefinitionSO themeDef = (ThemeDefinitionSO)target;
            //     foreach (var sheet in themeDef.ThemeStyleSheets)
            //     {
            //         if (sheet == null)
            //         {
            //             Debug.LogWarning($"Theme '{themeDef.ThemeName}' has a missing StyleSheet reference.");
            //         }
            //     }
            //     Debug.Log("StyleSheet verification complete for theme: " + themeDef.ThemeName);
            // }

            serializedObject.ApplyModifiedProperties();
        }
    }
}