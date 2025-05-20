using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace GlyphPuzzle.UI.Core
{
    /// <summary>
    /// Base class for ViewModels with property change notification capabilities.
    /// Implements `System.ComponentModel.INotifyPropertyChanged` to notify listeners
    /// (typically UI elements) of property changes. Includes a protected `OnPropertyChanged`
    /// method for derived classes.
    /// </summary>
    public abstract class BaseViewModel : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}