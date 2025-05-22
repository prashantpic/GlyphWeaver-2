using UnityEngine;
using System;

// Consider using a conditional compilation for Newtonsoft.Json if it's an optional dependency
// #if USE_NEWTONSOFT_JSON
// using Newtonsoft.Json;
// #endif

namespace GlyphWeaver.Client.Core.Utils
{
    /// <summary>
    /// Provides utility methods for JSON serialization and deserialization.
    /// REQ-PDP-003: Handle data serialization/deserialization.
    /// Uses Unity's JsonUtility by default. Can be extended to use Newtonsoft.Json for more complex scenarios.
    /// </summary>
    public static class JsonUtils
    {
        /// <summary>
        /// Serializes the specified object to a JSON string.
        /// </summary>
        /// <typeparam name="T">The type of the object to serialize.</typeparam>
        /// <param name="obj">The object to serialize.</param>
        /// <param name="prettyPrint">Whether to format the output for human readability.</param>
        /// <returns>A JSON string representation of the object.</returns>
        public static string ToJson<T>(T obj, bool prettyPrint = false)
        {
            if (obj == null)
            {
                Debug.LogError("[JsonUtils] Attempted to serialize a null object.");
                return null;
            }

            try
            {
                // #if USE_NEWTONSOFT_JSON
                // return JsonConvert.SerializeObject(obj, prettyPrint ? Formatting.Indented : Formatting.None);
                // #else
                return JsonUtility.ToJson(obj, prettyPrint);
                // #endif
            }
            catch (Exception e)
            {
                Debug.LogError($"[JsonUtils] Error serializing object of type {typeof(T).Name}: {e.Message}\n{e.StackTrace}");
                return null;
            }
        }

        /// <summary>
        /// Deserializes the JSON string to an object of the specified type.
        /// </summary>
        /// <typeparam name="T">The type of the object to deserialize.</typeparam>
        /// <param name="json">The JSON string to deserialize.</param>
        /// <returns>An object of the specified type, or default(T) if deserialization fails.</returns>
        public static T FromJson<T>(string json)
        {
            if (string.IsNullOrEmpty(json))
            {
                Debug.LogWarning("[JsonUtils] Attempted to deserialize a null or empty JSON string.");
                return default;
            }

            try
            {
                // #if USE_NEWTONSOFT_JSON
                // return JsonConvert.DeserializeObject<T>(json);
                // #else
                return JsonUtility.FromJson<T>(json);
                // #endif
            }
            catch (Exception e)
            {
                Debug.LogError($"[JsonUtils] Error deserializing JSON to type {typeof(T).Name}: {e.Message}\nJSON: {json}\n{e.StackTrace}");
                return default;
            }
        }

        /// <summary>
        /// Deserializes the JSON string and overwrites the data of the given object.
        /// Useful for Unity objects that cannot be easily created with 'new'.
        /// </summary>
        /// <param name="json">The JSON string to deserialize.</param>
        /// <param name="objectToOverwrite">The object to overwrite with deserialized data.</param>
        public static void FromJsonOverwrite(string json, object objectToOverwrite)
        {
            if (string.IsNullOrEmpty(json))
            {
                Debug.LogWarning("[JsonUtils] Attempted to deserialize (overwrite) a null or empty JSON string.");
                return;
            }
            if (objectToOverwrite == null)
            {
                Debug.LogError("[JsonUtils] Attempted to overwrite a null object.");
                return;
            }

            try
            {
                // #if USE_NEWTONSOFT_JSON
                // // Newtonsoft.Json doesn't have a direct overwrite utility like JsonUtility.
                // // One approach is to deserialize to a new object and then copy properties,
                // // or use its JsonPopulate attribute if suitable.
                // // For simplicity here, we'll note this limitation or assume JsonUtility for overwrite.
                // Debug.LogWarning("[JsonUtils] FromJsonOverwrite with Newtonsoft.Json might require custom implementation or is not directly supported for all types.");
                // // As a fallback or if sticking to Unity's features for this:
                // JsonUtility.FromJsonOverwrite(json, objectToOverwrite);
                // #else
                JsonUtility.FromJsonOverwrite(json, objectToOverwrite);
                // #endif
            }
            catch (Exception e)
            {
                Debug.LogError($"[JsonUtils] Error deserializing (overwrite) JSON for object of type {objectToOverwrite.GetType().Name}: {e.Message}\nJSON: {json}\n{e.StackTrace}");
            }
        }
    }
}