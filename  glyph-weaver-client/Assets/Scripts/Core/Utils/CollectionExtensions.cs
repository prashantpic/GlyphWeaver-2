using System.Collections.Generic;
using System.Linq;
using UnityEngine; // For Random

namespace GlyphWeaver.Client.Core.Utils
{
    public static class CollectionExtensions
    {
        private static System.Random _rng = new System.Random();

        /// <summary>
        /// Shuffles the elements of the specified list in place.
        /// </summary>
        /// <typeparam name="T">The type of elements in the list.</typeparam>
        /// <param name="list">The list to shuffle.</param>
        public static void Shuffle<T>(this IList<T> list)
        {
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = _rng.Next(n + 1);
                (list[k], list[n]) = (list[n], list[k]);
            }
        }

        /// <summary>
        /// Checks if the collection is null or empty.
        /// </summary>
        /// <typeparam name="T">The type of elements in the collection.</typeparam>
        /// <param name="collection">The collection to check.</param>
        /// <returns>True if the collection is null or has no elements, false otherwise.</returns>
        public static bool IsNullOrEmpty<T>(this IEnumerable<T> collection)
        {
            return collection == null || !collection.Any();
        }
        
        /// <summary>
        /// Gets a random element from the list.
        /// </summary>
        /// <typeparam name="T">The type of elements in the list.</typeparam>
        /// <param name="list">The list to get a random element from.</param>
        /// <returns>A random element from the list, or default(T) if the list is null or empty.</returns>
        public static T GetRandomElement<T>(this IList<T> list)
        {
            if (list.IsNullOrEmpty())
            {
                return default;
            }
            return list[Random.Range(0, list.Count)];
        }

        /// <summary>
        /// Tries to get a value from the dictionary.
        /// Returns default(TValue) if the key is not found, rather than throwing an exception.
        /// </summary>
        /// <typeparam name="TKey">The type of the keys in the dictionary.</typeparam>
        /// <typeparam name="TValue">The type of the values in the dictionary.</typeparam>
        /// <param name="dictionary">The dictionary to query.</param>
        /// <param name="key">The key to look for.</param>
        /// <returns>The value associated with the key, or default(TValue) if not found.</returns>
        public static TValue GetValueOrDefault<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, TKey key)
        {
            return dictionary.TryGetValue(key, out TValue value) ? value : default;
        }
    }
}