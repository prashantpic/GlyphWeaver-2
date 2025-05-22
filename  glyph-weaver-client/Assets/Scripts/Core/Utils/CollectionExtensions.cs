using System;
using System.Collections.Generic;
using System.Linq;

namespace GlyphWeaver.Client.Core.Utils
{
    public static class CollectionExtensions
    {
        private static Random _rng = new Random();

        /// <summary>
        /// Shuffles the elements of the specified list in place.
        /// Uses the Fisher-Yates shuffle algorithm.
        /// </summary>
        /// <typeparam name="T">The type of the elements in the list.</typeparam>
        /// <param name="list">The list to shuffle.</param>
        public static void Shuffle<T>(this IList<T> list)
        {
            if (list == null) throw new ArgumentNullException(nameof(list));

            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = _rng.Next(n + 1);
                T value = list[k];
                list[k] = list[n];
                list[n] = value;
            }
        }

        /// <summary>
        /// Determines whether a sequence is null or contains no elements.
        /// </summary>
        /// <typeparam name="T">The type of the elements in the sequence.</typeparam>
        /// <param name="source">The IEnumerable<T> to check.</param>
        /// <returns>true if the source sequence is null or empty; otherwise, false.</returns>
        public static bool IsNullOrEmpty<T>(this IEnumerable<T> source)
        {
            return source == null || !source.Any();
        }

        /// <summary>
        /// Returns a random element from the list.
        /// </summary>
        /// <typeparam name="T">The type of the elements in the list.</typeparam>
        /// <param name="list">The list from which to get a random element.</param>
        /// <returns>A random element from the list.</returns>
        /// <exception cref="ArgumentNullException">Thrown if the list is null.</exception>
        /// <exception cref="InvalidOperationException">Thrown if the list is empty.</exception>
        public static T GetRandomElement<T>(this IList<T> list)
        {
            if (list == null) throw new ArgumentNullException(nameof(list));
            if (list.Count == 0) throw new InvalidOperationException("Cannot get a random element from an empty list.");
            
            return list[_rng.Next(list.Count)];
        }
        
        /// <summary>
        /// Adds an item to the dictionary if the key does not already exist.
        /// </summary>
        /// <typeparam name="TKey">The type of the keys in the dictionary.</typeparam>
        /// <typeparam name="TValue">The type of the values in the dictionary.</typeparam>
        /// <param name="dictionary">The dictionary to add to.</param>
        /// <param name="key">The key of the element to add.</param>
        /// <param name="value">The value of the element to add.</param>
        /// <returns>True if the element was added, false otherwise.</returns>
        public static bool TryAdd<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, TKey key, TValue value)
        {
            if (dictionary == null) throw new ArgumentNullException(nameof(dictionary));
            
            if (!dictionary.ContainsKey(key))
            {
                dictionary.Add(key, value);
                return true;
            }
            return false;
        }

        /// <summary>
        /// Gets the value associated with the specified key, or a default value if the key is not found.
        /// </summary>
        /// <typeparam name="TKey">The type of the keys in the dictionary.</typeparam>
        /// <typeparam name="TValue">The type of the values in the dictionary.</typeparam>
        /// <param name="dictionary">The dictionary to query.</param>
        /// <param name="key">The key of the element to get.</param>
        /// <param name="defaultValue">The value to return if the key is not found.</param>
        /// <returns>The value associated with the key, or defaultValue if the key is not found.</returns>
        public static TValue GetValueOrDefault<TKey, TValue>(this IReadOnlyDictionary<TKey, TValue> dictionary, TKey key, TValue defaultValue = default)
        {
            if (dictionary == null) throw new ArgumentNullException(nameof(dictionary));

            return dictionary.TryGetValue(key, out var value) ? value : defaultValue;
        }
    }
}