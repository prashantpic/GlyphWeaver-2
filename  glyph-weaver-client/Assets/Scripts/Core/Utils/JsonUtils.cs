using UnityEngine;
using System;

// For more complex JSON operations, consider Newtonsoft.Json.
// If using Newtonsoft.Json, you'd replace JsonUtility calls.
// e.g., using Newtonsoft.Json;

namespace GlyphWeaver.Client.Core.Utils
{
    /// <summary>
    /// Provides utility methods for JSON serialization and deserialization.
    /// Wraps Unity's JsonUtility by default. Can be extended or replaced
    /// if a more robust JSON library like Newtonsoft.Json is required.
    /// REQ-PDP-003: Handles data serialization/deserialization.
    /// </summary>
    public static class JsonUtils
    {
        /// <summary>
        /// Serializes the given object to a JSON string.
        /// </summary>
        /// <typeparam name="T">The type of the object to serialize.</typeparam>
        /// <param name="obj">The object to serialize.</param>
        /// <param name="prettyPrint">Whether to format the output for readability.</param>
        /// <returns>A JSON string representation of the object, or null if serialization fails.</returns>
        public static string ToJson<T>(T obj, bool prettyPrint = false)
        {
            if (obj == null)
            {
                Debug.LogError("[JsonUtils] Cannot serialize null object.");
                return null;
            }

            try
            {
                return JsonUtility.ToJson(obj, prettyPrint);
                // If using Newtonsoft.Json:
                // return JsonConvert.SerializeObject(obj, prettyPrint ? Formatting.Indented : Formatting.None);
            }
            catch (Exception e)
            {
                Debug.LogError($"[JsonUtils] Failed to serialize object of type {typeof(T).Name}: {e.Message}\n{e.StackTrace}");
                return null;
            }
        }

        /// <summary>
        /// Deserializes a JSON string to an object of the specified type.
        /// </summary>
        /// <typeparam name="T">The type of the object to deserialize.</typeparam>
        /// <param name="json">The JSON string to deserialize.</param>
        /// <returns>An object of type T, or the default value of T if deserialization fails.</returns>
        public static T FromJson<T>(string json)
        {
            if (string.IsNullOrEmpty(json))
            {
                Debug.LogError("[JsonUtils] Cannot deserialize null or empty JSON string.");
                return default(T);
            }

            try
            {
                return JsonUtility.FromJson<T>(json);
                // If using Newtonsoft.Json:
                // return JsonConvert.DeserializeObject<T>(json);
            }
            catch (Exception e)
            {
                Debug.LogError($"[JsonUtils] Failed to deserialize JSON to type {typeof(T).Name}: {e.Message}\nJSON: {json}\n{e.StackTrace}");
                return default(T);
            }
        }

        /// <summary>
        /// Deserializes a JSON string, overwriting data in an existing object.
        /// This is specific to Unity's JsonUtility.
        /// </summary>
        /// <param name="json">The JSON string to deserialize.</param>
        /// <param name="objectToOverwrite">The existing object to overwrite.</param>
        public static void FromJsonOverwrite(string json, object objectToOverwrite)
        {
            if (string.IsNullOrEmpty(json))
            {
                Debug.LogError("[JsonUtils] Cannot deserialize (overwrite) null or empty JSON string.");
                return;
            }
            if (objectToOverwrite == null)
            {
                Debug.LogError("[JsonUtils] Cannot overwrite null object.");
                return;
            }

            try
            {
                JsonUtility.FromJsonOverwrite(json, objectToOverwrite);
            }
            catch (Exception e)
            {
                Debug.LogError($"[JsonUtils] Failed to deserialize (overwrite) JSON: {e.Message}\nJSON: {json}\n{e.StackTrace}");
            }
        }
    }
}