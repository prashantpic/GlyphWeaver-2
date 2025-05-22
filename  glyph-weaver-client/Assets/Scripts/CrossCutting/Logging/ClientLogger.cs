using UnityEngine;
using System; // Required for Exception

namespace GlyphWeaver.Client.CrossCutting.Logging
{
    /// <summary>
    /// Provides a unified, static interface for logging messages, warnings, and errors
    /// on the client-side. It wraps Unity's Debug logging functionality.
    /// REQ-AMOT-006: Used for client-side logging and crash reporting integration.
    /// </summary>
    public static class ClientLogger
    {
        private const string Prefix = "[GlyphWeaver] ";

        public static void LogDebug(string message, UnityEngine.Object context = null)
        {
#if UNITY_EDITOR || DEVELOPMENT_BUILD
            Debug.Log(Prefix + message, context);
#endif
        }

        public static void LogInfo(string message, UnityEngine.Object context = null)
        {
            Debug.Log(Prefix + message, context);
        }

        public static void LogWarning(string message, UnityEngine.Object context = null)
        {
            Debug.LogWarning(Prefix + message, context);
        }

        public static void LogError(string message, UnityEngine.Object context = null)
        {
            Debug.LogError(Prefix + message, context);
            // Potentially forward to CrashReporterClient.LogError(message) here
        }

        public static void LogException(Exception exception, UnityEngine.Object context = null)
        {
            Debug.LogException(exception, context);
            // Potentially forward to CrashReporterClient.LogException(exception) here
        }

        // Overloads for logging with specific object context
        public static void LogDebug(string message, string tag, UnityEngine.Object context = null)
        {
#if UNITY_EDITOR || DEVELOPMENT_BUILD
            Debug.Log($"{Prefix}[{tag}] {message}", context);
#endif
        }
        public static void LogInfo(string message, string tag, UnityEngine.Object context = null)
        {
            Debug.Log($"{Prefix}[{tag}] {message}", context);
        }

        public static void LogWarning(string message, string tag, UnityEngine.Object context = null)
        {
            Debug.LogWarning($"{Prefix}[{tag}] {message}", context);
        }

        public static void LogError(string message, string tag, UnityEngine.Object context = null)
        {
            Debug.LogError($"{Prefix}[{tag}] {message}", context);
        }
    }
}