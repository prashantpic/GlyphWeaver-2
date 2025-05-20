using GlyphPuzzle.UI.Core; // Assuming BaseViewModel is in this namespace
using System.Windows.Input; // For ICommand

namespace GlyphPuzzle.UI.Components
{
    public class CustomButtonViewModel : BaseViewModel
    {
        private string _buttonText = "Button";
        public string ButtonText
        {
            get => _buttonText;
            set
            {
                if (_buttonText != value)
                {
                    _buttonText = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _isEnabled = true;
        public bool IsEnabled
        {
            get => _isEnabled;
            set
            {
                if (_isEnabled != value)
                {
                    _isEnabled = value;
                    OnPropertyChanged();
                }
            }
        }

        private ICommand _clickCommand;
        public ICommand ClickCommand
        {
            get => _clickCommand;
            set
            {
                if (_clickCommand != value)
                {
                    _clickCommand = value;
                    OnPropertyChanged();
                }
            }
        }

        public CustomButtonViewModel(string text = "Button", bool enabled = true, ICommand command = null)
        {
            _buttonText = text;
            _isEnabled = enabled;
            _clickCommand = command;
        }
        
        // Default constructor for cases where properties are set later
        public CustomButtonViewModel() { }
    }
}