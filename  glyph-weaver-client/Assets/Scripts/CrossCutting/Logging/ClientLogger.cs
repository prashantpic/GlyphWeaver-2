using UnityEngine;
using System;

namespace GlyphWeaver.Client.CrossCutting.Logging
{
    /// <summary>
    /// Provides a unified, static interface for client-side logging.
    /// Wraps Unity's Debug.Log and can be extended to integrate with
    /// external logging services or the CrashReporterClient.
    /// REQ-AMOT-006: Implement client-side error logging and crash reporting.
    /// </summary>
    public static class ClientLogger
    {
        private const string PrefixDebug = "[DEBUG] ";
        private const string PrefixInfo = "[INFO] ";
        private const string PrefixWarning = "[WARNING] ";
        private const string PrefixError = "[ERROR] ";

        // Could add a log level configuration here if needed
        // public static LogLevel CurrentLogLevel = LogLevel.Debug;

        public static void LogDebug(string message, UnityEngine.Object context = null)
        {
            // if (CurrentLogLevel > LogLevel.Debug) return;
            Debug.Log(PrefixDebug + message, context);
        }

        public static void LogInfo(string message, UnityEngine.Object context = null)
        {
            // if (CurrentLogLevel > LogLevel.Info) return;
            Debug.Log(PrefixInfo + message, context);
        }

        public static void LogWarning(string message, UnityEngine.Object context = null)
        {
            // if (CurrentLogLevel > LogLevel.Warning) return;
            Debug.LogWarning(PrefixWarning + message, context);
        }

        public static void LogError(string message, UnityEngine.Object context = null)
        {
            // if (CurrentLogLevel > LogLevel.Error) return;
            Debug.LogError(PrefixError + message, context);
            // Potentially forward to CrashReporterClient.LogError(message) here
        }

        public static void LogException(Exception exception, UnityEngine.Object context = null)
        {
            Debug.LogError(PrefixError + $"Exception: {exception.Message}\nStackTrace: {exception.StackTrace}", context);
            // Potentially forward to CrashReporterClient.LogException(exception) here
        }
        
        public static void LogFormat(LogType logType, UnityEngine.Object context, string format, params object[] args)
        {
            switch (logType)
            {
                case LogType.Error:
                case LogType.Exception:
                    Debug.LogErrorFormat(context, PrefixError + format, args);
                    break;
                case LogType.Assert: // Unity specific, usually an error
                    Debug.LogErrorFormat(context, "[ASSERT] " + format, args);
                    break;
                case LogType.Warning:
                    Debug.LogWarningFormat(context, PrefixWarning + format, args);
                    break;
                case LogType.Log:
                default:
                    Debug.LogFormat(context, PrefixInfo + format, args);
                    break;
            }
        }
    }

    // public enum LogLevel
    // {
    //     Debug,
    //     Info,
    //     Warning,
    //     Error,
    //     None
    // }
}