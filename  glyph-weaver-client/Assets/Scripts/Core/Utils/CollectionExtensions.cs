using System;
using System.Collections.Generic;
using System.Linq;
using Random = UnityEngine.Random;

namespace GlyphWeaver.Client.Core.Utils
{
    public static class CollectionExtensions
    {
        private static System.Random _rng = new System.Random();

        /// <summary>
        /// Shuffles the elements of the specified list in place.
        /// Uses the Fisher-Yates shuffle algorithm.
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
        /// Shuffles the elements of the specified list in place using Unity's Random.
        /// </summary>
        /// <typeparam name="T">The type of elements in the list.</typeparam>
        /// <param name="list">The list to shuffle.</param>
        public static void ShuffleUnity<T>(this IList<T> list)
        {
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = Random.Range(0, n + 1);
                (list[k], list[n]) = (list[n], list[k]);
            }
        }

        /// <summary>
        /// Checks if the collection is null or empty.
        /// </summary>
        /// <typeparam name="T">The type of elements in the collection.</typeparam>
        /// <param name="collection">The collection to check.</param>
        /// <returns>True if the collection is null or has no elements; false otherwise.</returns>
        public static bool IsNullOrEmpty<T>(this IEnumerable<T> collection)
        {
            return collection == null || !collection.Any();
        }

        /// <summary>
        /// Tries to get a value from the dictionary.
        /// </summary>
        /// <typeparam name="TKey">The type of the keys in the dictionary.</typeparam>
        /// <typeparam name="TValue">The type of the values in the dictionary.</typeparam>
        /// <param name="dictionary">The dictionary.</param>
        /// <param name="key">The key to locate.</param>
        /// <param name="value">The output value if found.</param>
        /// <returns>True if the key was found; false otherwise.</returns>
        public static bool TryGetValue<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, TKey key, out TValue value)
        {
            return dictionary.TryGetValue(key, out value);
        }
        
        /// <summary>
        /// Gets a random element from the list.
        /// </summary>
        /// <typeparam name="T">The type of elements in the list.</typeparam>
        /// <param name="list">The list.</param>
        /// <returns>A random element from the list. Returns default(T) if the list is null or empty.</returns>
        public static T GetRandomElement<T>(this IList<T> list)
        {
            if (list.IsNullOrEmpty())
            {
                return default;
            }
            return list[Random.Range(0, list.Count)];
        }

        /// <summary>
        /// Adds an item to the list if it's not already present.
        /// </summary>
        /// <typeparam name="T">The type of elements in the list.</typeparam>
        /// <param name="list">The list.</param>
        /// <param name="item">The item to add.</param>
        /// <returns>True if the item was added, false if it was already present.</returns>
        public static bool AddUnique<T>(this IList<T> list, T item)
        {
            if (list.Contains(item))
            {
                return false;
            }
            list.Add(item);
            return true;
        }
        
        /// <summary>
        /// Performs an action for each element of the enumerable.
        /// </summary>
        /// <typeparam name="T">The type of elements in the enumerable.</typeparam>
        /// <param name="enumerable">The enumerable.</param>
        /// <param name="action">The action to perform on each element.</param>
        public static void ForEach<T>(this IEnumerable<T> enumerable, Action<T> action)
        {
            if (enumerable == null || action == null) return;
            foreach (T item in enumerable)
            {
                action(item);
            }
        }
    }
}