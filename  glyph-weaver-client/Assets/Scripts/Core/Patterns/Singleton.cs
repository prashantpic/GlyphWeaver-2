using UnityEngine;

namespace GlyphWeaver.Client.Core.Patterns
{
    /// <summary>
    /// A generic base class for creating MonoBehaviour components that follow the Singleton pattern.
    /// Ensures that only one instance of the component exists in the scene.
    /// </summary>
    /// <typeparam name="T">The type of the Singleton component.</typeparam>
    public abstract class Singleton<T> : MonoBehaviour where T : MonoBehaviour
    {
        private static T _instance;
        private static readonly object _lock = new object();
        private static bool _applicationIsQuitting = false;

        public static T Instance
        {
            get
            {
                if (_applicationIsQuitting)
                {
                    Debug.LogWarning($"[Singleton] Instance '{typeof(T)}' already destroyed on application quit. Won't create again - returning null.");
                    return null;
                }

                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = (T)FindObjectOfType(typeof(T));

                        if (FindObjectsOfType(typeof(T)).Length > 1)
                        {
                            Debug.LogError($"[Singleton] Something went really wrong - there should never be more than 1 singleton! Reopening the scene might fix it. Type: {typeof(T)}");
                            return _instance;
                        }

                        if (_instance == null)
                        {
                            GameObject singletonObject = new GameObject();
                            _instance = singletonObject.AddComponent<T>();
                            singletonObject.name = $"(Singleton) {typeof(T)}";

                            // Optionally, make it persistent across scenes.
                            // DontDestroyOnLoad(singletonObject); 
                            
                            Debug.Log($"[Singleton] An instance of {typeof(T)} is needed in the scene, so '{singletonObject}' was created with DontDestroyOnLoad.");
                        }
                        else
                        {
                            Debug.Log($"[Singleton] Using instance already created: {_instance.gameObject.name}");
                        }
                    }
                    return _instance;
                }
            }
        }

        /// <summary>
        /// When Unity quits, it destroys objects in a random order.
        /// In principle, a Singleton is only destroyed when application quits.
        /// If any script calls Instance after it have been destroyed, 
        ///   it will create a buggy ghost object that will stay on the Editor scene
        ///   even after stopping playing the Application. Really bad!
        /// So, this was made to be sure we're not creating that buggy ghost object.
        /// </summary>
        protected virtual void OnDestroy()
        {
            if (_instance == this)
            {
                _applicationIsQuitting = true;
            }
        }

        protected virtual void Awake()
        {
            if (_instance == null)
            {
                _instance = this as T;
                // Optionally, make it persistent across scenes.
                // DontDestroyOnLoad(gameObject); 
            }
            else if (_instance != this)
            {
                Debug.LogWarning($"[Singleton] Instance of {typeof(T)} already exists. Destroying duplicate '{gameObject.name}'.");
                Destroy(gameObject);
            }
        }
    }
}