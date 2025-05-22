using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace GlyphWeaver.Client.Editor
{
    /// <summary>
    /// Automates build-time tasks such as secure injection of configuration or secrets,
    /// and other pre/post build steps.
    /// REQ-SEC-002: Securely manage API keys, secrets, and credentials. This script
    /// could be a part of that process, e.g., by reading secrets from a secure location
    /// (outside version control) and injecting them into a ScriptableObject or constants file at build time.
    /// </summary>
    public class BuildProcessor : IPreprocessBuildWithReport, IPostprocessBuildWithReport
    {
        public int callbackOrder => 0; // Controls the order of execution if multiple pre/post processors exist.

        public void OnPreprocessBuild(BuildReport report)
        {
            Debug.Log($"[BuildProcessor] Starting pre-build tasks for target {report.summary.platform} at path {report.summary.outputPath}");

            // Example: Injecting a build version or secret
            // This is a placeholder. Actual secret injection should be handled securely.
            // For REQ-SEC-002, you might read from environment variables, a CI/CD system,
            // or a local untracked config file.
            
            // Example: Log current build settings
            LogBuildSettings();

            // Example: Ensure critical assets are included
            // CheckAssetInclusion("Assets/Path/To/CriticalAsset.asset");

            // Example: Modifying a ScriptableObject with build-time data
            // UpdateBuildTimeConfiguration();
            
            Debug.Log("[BuildProcessor] Pre-build tasks completed.");
        }

        public void OnPostprocessBuild(BuildReport report)
        {
            Debug.Log($"[BuildProcessor] Post-build tasks for target {report.summary.platform} at path {report.summary.outputPath}");
            Debug.Log($"[BuildProcessor] Build result: {report.summary.result}");
            Debug.Log($"[BuildProcessor] Total build time: {report.summary.totalTime}");

            if (report.summary.result == BuildResult.Succeeded)
            {
                Debug.Log("[BuildProcessor] Build successful. Post-processing complete.");
                // Example: Copy build to a specific location or run external tools.
            }
            else if (report.summary.result == BuildResult.Failed)
            {
                Debug.LogError("[BuildProcessor] Build failed. Check logs for details.");
            }
        }

        private void LogBuildSettings()
        {
            Debug.Log($"[BuildProcessor] Current Build Settings:\n" +
                      $"  Bundle Version: {PlayerSettings.bundleVersion}\n" +
                      $"  Bundle Identifier: {PlayerSettings.GetApplicationIdentifier(EditorUserBuildSettings.selectedBuildTargetGroup)}\n" +
                      $"  Company Name: {PlayerSettings.companyName}\n" +
                      $"  Product Name: {PlayerSettings.productName}\n" +
                      $"  Scripting Backend: {PlayerSettings.GetScriptingBackend(EditorUserBuildSettings.selectedBuildTargetGroup)}\n" +
                      $"  Api Compatibility Level: {PlayerSettings.GetApiCompatibilityLevel(EditorUserBuildSettings.selectedBuildTargetGroup)}");
        }

        // private void CheckAssetInclusion(string assetPath)
        // {
        //     var asset = AssetDatabase.LoadAssetAtPath<Object>(assetPath);
        //     if (asset == null)
        //     {
        //         Debug.LogError($"[BuildProcessor] Critical asset not found at path: {assetPath}. Build might fail or be incomplete.");
        //     }
        //     else
        //     {
        //         Debug.Log($"[BuildProcessor] Critical asset '{assetPath}' confirmed.");
        //     }
        // }

        // private void UpdateBuildTimeConfiguration()
        // {
        //     // Example: Find a ScriptableObject and update it
        //     // string[] guids = AssetDatabase.FindAssets("t:YourConfigScriptableObject");
        //     // if (guids.Length > 0)
        //     // {
        //     //     string path = AssetDatabase.GUIDToAssetPath(guids[0]);
        //     //     YourConfigScriptableObject config = AssetDatabase.LoadAssetAtPath<YourConfigScriptableObject>(path);
        //     //     if (config != null)
        //     //     {
        //     //         config.buildTimestamp = System.DateTime.UtcNow.ToString("o");
        //     //         EditorUtility.SetDirty(config);
        //     //         AssetDatabase.SaveAssets();
        //     //         Debug.Log($"[BuildProcessor] Updated build timestamp in {config.name}.");
        //     //     }
        //     // }
        // }
    }
}