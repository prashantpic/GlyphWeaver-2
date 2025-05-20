using GlyphPuzzle.UI.Core; // Assuming IBindableElement and BaseViewModel are in this namespace
using GlyphPuzzle.UI.Localization; // Assuming LayoutAdapter is in this namespace
using System.ComponentModel;
using UnityEngine;
using UnityEngine.Localization;
using UnityEngine.Localization.Tables;
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Components
{
    public class LocalizedTextElement : VisualElement, IBindableElement
    {
        public new class UxmlFactory : UxmlFactory<LocalizedTextElement, UxmlTraits> { }
        public new class UxmlTraits : VisualElement.UxmlTraits { } // Can add UXML attributes here if needed

        public static readonly string UxmlPath = "Components/LocalizedText/LocalizedTextElement_UXML"; // Example path
        public static readonly string UssPath = "Components/LocalizedText/LocalizedTextElement_USS";   // Example path
        
        private TextElement _textElement; // Could be Label or TextElement for TMP
        private LocalizedString _localizedString = new LocalizedString();
        private LocalizedTextElementViewModel _viewModel;

        // Properties for direct assignment if not using ViewModel
        public TableReference TableReference
        {
            get => _localizedString.TableReference;
            set => _localizedString.TableReference = value;
        }

        public TableEntryReference TableEntryReference
        {
            get => _localizedString.TableEntryReference;
            set => _localizedString.TableEntryReference = value;
        }

        public LocalizedTextElement()
        {
            // Similar to CustomButton, UXML/USS loading would happen here.
            // For now, we expect UXML to define the TextElement.
            _textElement = this.Q<TextElement>("localized-label"); // Or Label
            if (_textElement == null)
            {
                _textElement = new Label(); // Fallback, using Label which is a TextElement
                _textElement.name = "localized-label";
                Add(_textElement);
            }

            AddToClassList("localized-text-element");
            _localizedString.StringChanged += OnLocalizedStringChanged;
        }

        private void OnLocalizedStringChanged(string translatedString)
        {
            if (_textElement != null)
            {
                _textElement.text = translatedString;
                LayoutAdapter.AdaptLayoutToTextContent(_textElement);
            }
        }
        
        public void SetLocalizationKey(TableReference table, TableEntryReference entry, params object[] arguments)
        {
            _localizedString.TableReference = table;
            _localizedString.TableEntryReference = entry;
            _localizedString.Arguments = arguments;
            // Force refresh if needed, or it will update on next StringChanged event
            OnLocalizedStringChanged(_localizedString.GetLocalizedString()); 
        }

        public void Bind(BaseViewModel viewModel)
        {
            if (viewModel is LocalizedTextElementViewModel localizedViewModel)
            {
                Unbind();
                _viewModel = localizedViewModel;
                _viewModel.PropertyChanged += OnViewModelPropertyChanged;

                // Initial sync
                UpdateLocalizationFromViewModel();
            }
            else
            {
                Debug.LogError("[LocalizedTextElement] Invalid ViewModel type provided for binding.", this);
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
            if (e.PropertyName == nameof(LocalizedTextElementViewModel.TableRef) ||
                e.PropertyName == nameof(LocalizedTextElementViewModel.EntryRef) ||
                e.PropertyName == nameof(LocalizedTextElementViewModel.Arguments))
            {
                UpdateLocalizationFromViewModel();
            }
        }

        private void UpdateLocalizationFromViewModel()
        {
            if (_viewModel == null) return;

            _localizedString.TableReference = _viewModel.TableRef;
            _localizedString.TableEntryReference = _viewModel.EntryRef;
            _localizedString.Arguments = _viewModel.Arguments;
            
            // Force refresh localization string
            // The StringChanged event will handle updating the text and layout
            if (_localizedString.TableReference.ReferenceType != TableReference.Type.Empty && 
                _localizedString.TableEntryReference.ReferenceType != TableEntryReference.Type.Empty)
            {
                // This typically triggers an async load. OnLocalizedStringChanged will be called when it's ready.
                // To get immediate (potentially non-localized or fallback) text:
                OnLocalizedStringChanged(_localizedString.GetLocalizedString());
            }
            else
            {
                 _textElement.text = string.Empty; // Clear if no valid key
            }
        }

        // Ensure to unsubscribe when the element is removed
        ~LocalizedTextElement()
        {
            if (_localizedString != null)
            {
                _localizedString.StringChanged -= OnLocalizedStringChanged;
            }
            Unbind(); // Also ensures ViewModel events are unsubscribed
        }
    }
}