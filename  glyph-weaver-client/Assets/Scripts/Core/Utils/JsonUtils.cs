using UnityEngine;
using System;

namespace GlyphWeaver.Client.Core.Utils
{
    /// <summary>
    /// Provides a consistent and centralized interface for JSON serialization and deserialization operations.
    /// Wraps Unity's JsonUtility. Consider using a more robust library like Newtonsoft.Json for complex
    /// scenarios (e.g., dictionaries, polymorphism, more detailed error handling).
    /// REQ-PDP-003: Used for serializing/deserializing player data.
    /// </summary>
    public static class JsonUtils
    {
        /// <summary>
        /// Serializes the given object to a JSON string.
        /// </summary>
        /// <typeparam name="T">The type of the object to serialize.</typeparam>
        /// <param name="obj">The object to serialize.</param>
        /// <param name="prettyPrint">Whether to format the output for human readability.</param>
        /// <returns>A JSON string representation of the object, or null if serialization fails.</returns>
        public static string ToJson<T>(T obj, bool prettyPrint = false)
        {
            if (obj == null)
            {
                Debug.LogError("[JsonUtils] Cannot serialize a null object.");
                return null;
            }

            try
            {
                return JsonUtility.ToJson(obj, prettyPrint);
            }
            catch (Exception e)
            {
                Debug.LogError($"[JsonUtils] Error serializing object of type {typeof(T).FullName}: {e.Message}\n{e.StackTrace}");
                return null;
            }
        }

        /// <summary>
        /// Deserializes the given JSON string to an object of the specified type.
        /// </summary>
        /// <typeparam name="T">The type of the object to deserialize to.</typeparam>
        /// <param name="json">The JSON string to deserialize.</param>
        /// <returns>An object of type T, or default(T) if deserialization fails or JSON is invalid.</returns>
        public static T FromJson<T>(string json)
        {
            if (string.IsNullOrEmpty(json))
            {
                Debug.LogError("[JsonUtils] Cannot deserialize from a null or empty JSON string.");
                return default;
            }

            try
            {
                return JsonUtility.FromJson<T>(json);
            }
            catch (Exception e)
            {
                Debug.LogError($"[JsonUtils] Error deserializing JSON to type {typeof(T).FullName}: {e.Message}\nJSON: {json}\n{e.StackTrace}");
                return default;
            }
        }

        /// <summary>
        /// Overwrites the data of an existing object with data from a JSON string.
        /// Useful for updating MonoBehaviours or ScriptableObjects.
        /// </summary>
        /// <typeparam name="T">The type of the object to overwrite.</typeparam>
        /// <param name="json">The JSON string containing the data to overwrite with.</param>
        /// <param name="objectToOverwrite">The existing object to overwrite.</param>
        public static void FromJsonOverwrite<T>(string json, T objectToOverwrite) where T : class
        {
            if (string.IsNullOrEmpty(json))
            {
                Debug.LogError("[JsonUtils] Cannot overwrite from a null or empty JSON string.");
                return;
            }

            if (objectToOverwrite == null)
            {
                Debug.LogError("[JsonUtils] Object to overwrite cannot be null.");
                return;
            }
            
            try
            {
                JsonUtility.FromJsonOverwrite(json, objectToOverwrite);
            }
            catch (Exception e)
            {
                Debug.LogError($"[JsonUtils] Error overwriting object of type {typeof(T).FullName} from JSON: {e.Message}\nJSON: {json}\n{e.StackTrace}");
            }
        }
    }
}