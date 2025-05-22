#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;
using System.IO;

namespace GlyphWeaver.Client.Editor
{
    /// <summary>
    /// Automates build-time tasks such as secure injection of configuration or secrets, 
    /// and other pre/post build steps.
    /// REQ-SEC-002: Securely manage API keys, secrets, and credentials (e.g., injected at build time).
    /// </summary>
    public class BuildProcessor : IPreprocessBuildWithReport, IPostprocessBuildWithReport
    {
        public int callbackOrder => 0; // Controls the order of execution if multiple processors exist

        public void OnPreprocessBuild(BuildReport report)
        {
            Debug.Log($"[BuildProcessor] Starting pre-build process for target {report.summary.platform} at path {report.summary.outputPath}");

            // Example: Injecting a build-time secret or configuration
            // This is a placeholder. Actual secret management would involve more robust solutions
            // like environment variables on a build server, Unity Cloud Build configurations,
            // or encrypted files that are decrypted only during the build.

            // string secretApiKey = System.Environment.GetEnvironmentVariable("GLYPH_WEAVER_API_KEY");
            // if (string.IsNullOrEmpty(secretApiKey))
            // {
            //     Debug.LogWarning("[BuildProcessor] GLYPH_WEAVER_API_KEY environment variable not set. Using a dummy key for development build.");
            //     secretApiKey = "dummy-dev-api-key"; // Fallback for local builds, NOT for production
            // }

            // // Example: Create a ScriptableObject or a text file with this secret
            // // Ensure this asset is gitignored if it contains real secrets.
            // string configAssetPath = "Assets/Resources/RuntimeConfig.asset"; // Or a .txt file
            // // For a ScriptableObject:
            // // RuntimeConfigData configData = AssetDatabase.LoadAssetAtPath<RuntimeConfigData>(configAssetPath);
            // // if (configData == null) 
            // // {
            // //     configData = ScriptableObject.CreateInstance<RuntimeConfigData>();
            // //     AssetDatabase.CreateAsset(configData, configAssetPath);
            // // }
            // // configData.ApiKey = secretApiKey;
            // // EditorUtility.SetDirty(configData);
            // // AssetDatabase.SaveAssets();

            // // For a text file:
            // // File.WriteAllText(Path.Combine(Application.dataPath, "Resources", "apiKey.txt"), secretApiKey);
            // // AssetDatabase.Refresh(); // Important to make Unity recognize new/changed files in Resources

            Debug.Log("[BuildProcessor] Pre-build tasks completed.");
        }

        public void OnPostprocessBuild(BuildReport report)
        {
            Debug.Log($"[BuildProcessor] Post-build process completed for target {report.summary.platform}. Build result: {report.summary.result}");

            if (report.summary.result == BuildResult.Succeeded)
            {
                Debug.Log($"Build successful! Output at: {report.summary.outputPath}");
            }
            else if (report.summary.result == BuildResult.Failed)
            {
                Debug.LogError("Build failed. Check console for details.");
            }

            // Example: Clean up temporary files created during pre-build
            // string apiKeyFilePath = Path.Combine(Application.dataPath, "Resources", "apiKey.txt");
            // if (File.Exists(apiKeyFilePath))
            // {
            //     File.Delete(apiKeyFilePath);
            //     File.Delete(apiKeyFilePath + ".meta"); // Also delete the .meta file
            //     AssetDatabase.Refresh();
            //     Debug.Log("[BuildProcessor] Cleaned up temporary API key file.");
            // }
        }
    }

    // Example RuntimeConfigData ScriptableObject (if used for injecting secrets)
    // Create this file in your project, e.g., Assets/Scripts/Core/Configuration/RuntimeConfigData.cs
    /*
    using UnityEngine;

    // [CreateAssetMenu(fileName = "RuntimeConfigData", menuName = "GlyphWeaver/Runtime Config Data", order = 0)]
    public class RuntimeConfigData : ScriptableObject 
    {
        [Header("API Configuration")]
        public string ApiKey;
        // Add other build-time configurations here
    }
    */
}
#endif