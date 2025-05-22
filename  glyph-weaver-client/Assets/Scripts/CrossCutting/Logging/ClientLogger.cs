using UnityEngine;
using System;

namespace GlyphWeaver.Client.CrossCutting.Logging
{
    /// <summary>
    /// Provides a unified, static interface for client-side logging.
    /// This facade wraps Unity's Debug logging and can be extended to integrate
    /// with other logging services or crash reporters.
    /// REQ-AMOT-006: Centralized logging for client.
    /// </summary>
    public static class ClientLogger
    {
        private const string LOG_PREFIX = "[GlyphWeaverClient] ";

        /// <summary>
        /// Logs a debug message. These are typically for development and debugging purposes
        /// and might be stripped from release builds depending on configuration.
        /// </summary>
        /// <param name="message">The message to log.</param>
        public static void LogDebug(string message)
        {
#if UNITY_EDITOR || DEVELOPMENT_BUILD
            Debug.Log($"{LOG_PREFIX}DEBUG: {message}");
#endif
        }

        /// <summary>
        /// Logs an informational message.
        /// </summary>
        /// <param name="message">The message to log.</param>
        public static void LogInfo(string message)
        {
            Debug.Log($"{LOG_PREFIX}INFO: {message}");
        }

        /// <summary>
        /// Logs a warning message. Warnings indicate potential issues that
        /// don't necessarily stop execution but should be reviewed.
        /// </summary>
        /// <param name="message">The message to log.</param>
        public static void LogWarning(string message)
        {
            Debug.LogWarning($"{LOG_PREFIX}WARN: {message}");
        }

        /// <summary>
        /// Logs an error message. Errors indicate problems that might disrupt
        /// normal operation or lead to incorrect behavior.
        /// </summary>
        /// <param name="message">The message to log.</param>
        public static void LogError(string message)
        {
            Debug.LogError($"{LOG_PREFIX}ERROR: {message}");
        }

        /// <summary>
        /// Logs an exception, including its message and stack trace.
        /// This is crucial for diagnosing runtime errors.
        /// </summary>
        /// <param name="exception">The exception to log.</param>
        /// <param name="contextMessage">Optional additional context message.</param>
        public static void LogException(Exception exception, string contextMessage = "")
        {
            if (string.IsNullOrEmpty(contextMessage))
            {
                Debug.LogError($"{LOG_PREFIX}EXCEPTION: {exception.GetType().Name}: {exception.Message}\n{exception.StackTrace}");
            }
            else
            {
                Debug.LogError($"{LOG_PREFIX}EXCEPTION ({contextMessage}): {exception.GetType().Name}: {exception.Message}\n{exception.StackTrace}");
            }
            // Potentially forward to a crash reporting service here
            // e.g., CrashReporterClient.Instance.RecordException(exception);
        }
    }
}