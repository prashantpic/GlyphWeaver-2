using GlyphPuzzle.UI.Core; // Assuming IBindableElement and BaseViewModel are in this namespace
using System;
using System.ComponentModel;
using System.Windows.Input;
using UnityEngine;
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Components
{
    public class CustomButton : VisualElement, IBindableElement
    {
        public new class UxmlFactory : UxmlFactory<CustomButton, UxmlTraits> { }
        public new class UxmlTraits : VisualElement.UxmlTraits { }

        public static readonly string UxmlPath = "Components/Button/CustomButton_UXML"; // Example path, adjust as needed for Resources/Addressables
        public static readonly string UssPath = "Components/Button/CustomButton_USS";   // Example path

        private Label _buttonTextLabel;
        private CustomButtonViewModel _viewModel;

        public event Action Clicked;

        public string Text
        {
            get => _buttonTextLabel?.text;
            set
            {
                if (_buttonTextLabel != null)
                    _buttonTextLabel.text = value;
            }
        }

        public CustomButton()
        {
            // It's common to load UXML from a VisualTreeAsset.
            // For a library, this VisualTreeAsset might be assigned via a public field,
            // or loaded from a conventional path if the library assets are structured under Resources or Addressables.
            // Example:
            // var visualTree = Resources.Load<VisualTreeAsset>(UxmlPath);
            // if (visualTree != null)
            // {
            //     visualTree.CloneTree(this);
            // }
            // else
            // {
            //     Debug.LogError($"[CustomButton] Could not load UXML at path: {UxmlPath}");
            // }
            // For now, we expect UXML to define the Label.

            _buttonTextLabel = this.Q<Label>("button-text");
            if (_buttonTextLabel == null)
            {
                // Fallback if UXML doesn't provide it or isn't loaded yet.
                _buttonTextLabel = new Label();
                _buttonTextLabel.name = "button-text";
                Add(_buttonTextLabel);
            }
            
            // USS styles are typically applied via a theme or a StyleSheet added to this element or a parent.
            // Example:
            // var styleSheet = Resources.Load<StyleSheet>(UssPath);
            // if (styleSheet != null)
            // {
            //     styleSheets.Add(styleSheet);
            // }
            AddToClassList("custom-button"); // Assuming USS uses .custom-button

            RegisterCallback<ClickEvent>(OnClick);
        }

        private void OnClick(ClickEvent evt)
        {
            Clicked?.Invoke();
            if (_viewModel?.ClickCommand != null && _viewModel.ClickCommand.CanExecute(null))
            {
                _viewModel.ClickCommand.Execute(null);
            }
        }

        public void Bind(BaseViewModel viewModel)
        {
            if (viewModel is CustomButtonViewModel customButtonViewModel)
            {
                Unbind(); // Clean up previous bindings
                _viewModel = customButtonViewModel;
                _viewModel.PropertyChanged += OnViewModelPropertyChanged;

                // Initial sync
                UpdateText(_viewModel.ButtonText);
                UpdateEnabled(_viewModel.IsEnabled);
            }
            else
            {
                Debug.LogError("[CustomButton] Invalid ViewModel type provided for binding.", this);
            }
        }

        public void Unbind()
        {
            if (_viewModel != null)
            {
                _viewModel.PropertyChanged -= OnViewModelPropertyChanged;
                _viewModel = null;
            }
        }

        private void OnViewModelPropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(CustomButtonViewModel.ButtonText))
            {
                UpdateText(_viewModel.ButtonText);
            }
            else if (e.PropertyName == nameof(CustomButtonViewModel.IsEnabled))
            {
                UpdateEnabled(_viewModel.IsEnabled);
            }
        }

        private void UpdateText(string newText)
        {
            if (_buttonTextLabel != null)
            {
                _buttonTextLabel.text = newText;
            }
        }
        
        public void SetText(string text) // For direct manipulation if not using ViewModel
        {
            Text = text;
        }

        private void UpdateEnabled(bool isEnabled)
        {
            SetEnabled(isEnabled); // Calls VisualElement's SetEnabled
            if (isEnabled)
            {
                RemoveFromClassList("disabled"); // Assuming a .disabled USS class
            }
            else
            {
                AddToClassList("disabled");
            }
        }
        
        public void SetEnabled(bool isEnabled) // For direct manipulation
        {
            base.SetEnabled(isEnabled); // Uses VisualElement.SetEnabled which affects enabledInHierarchy
        }
    }
}