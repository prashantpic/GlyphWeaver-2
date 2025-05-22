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
    /// REQ-SEC-002: Handles secure injection of secrets (e.g., encryption key).
    /// </summary>
    public class BuildProcessor : IPreprocessBuildWithReport, IPostprocessBuildWithReport
    {
        public int callbackOrder => 0;

        public void OnPreprocessBuild(BuildReport report)
        {
            Debug.Log($"[BuildProcessor] Starting Preprocess Build for target {report.summary.platform} at path {report.summary.outputPath}");

            // Example: Injecting a build-time secret or configuration
            // This is a placeholder. Real secret management would involve more secure practices.
            // For instance, reading from a .env file not committed to VCS, or from CI environment variables.
            string buildTimeSecret = System.Environment.GetEnvironmentVariable("GLYPH_WEAVER_BUILD_SECRET");
            if (string.IsNullOrEmpty(buildTimeSecret))
            {
                buildTimeSecret = "DEFAULT_DEV_SECRET_NOT_FOR_PRODUCTION"; // Fallback for local dev builds
                Debug.LogWarning("[BuildProcessor] GLYPH_WEAVER_BUILD_SECRET environment variable not set. Using default dev secret.");
            }
            
            // Example: Storing this "secret" in a ScriptableObject or a text asset.
            // This is a simplified example. Real secrets should not be stored directly in easily readable client files.
            // A better approach might involve using it to encrypt other config files or as part of an obfuscation scheme.
            // For REQ-SEC-002, the actual use of this secret for DataEncryptionUtility would be more complex.

            // Create a temporary asset to hold the secret (illustrative)
            // string tempConfigPath = "Assets/Resources/BuildTimeConfig.txt";
            // Directory.CreateDirectory(Path.GetDirectoryName(tempConfigPath));
            // File.WriteAllText(tempConfigPath, $"BuildSecret={buildTimeSecret}");
            // AssetDatabase.ImportAsset(tempConfigPath);

            Debug.Log("[BuildProcessor] Preprocess Build tasks completed.");
        }

        public void OnPostprocessBuild(BuildReport report)
        {
            Debug.Log($"[BuildProcessor] Postprocess Build for target {report.summary.platform} completed with status {report.summary.result}.");

            // Example: Clean up temporary files created during preprocess
            // string tempConfigPath = "Assets/Resources/BuildTimeConfig.txt";
            // if (File.Exists(tempConfigPath))
            // {
            //     AssetDatabase.DeleteAsset(tempConfigPath);
            //     Debug.Log($"[BuildProcessor] Cleaned up temporary asset: {tempConfigPath}");
            // }

            // Further actions: e.g., copy build to a specific location, run external tools.
        }
    }
}
#endif