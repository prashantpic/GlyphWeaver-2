using GlyphPuzzle.UI.Core; // Assuming BaseViewModel is in this namespace
using UnityEngine.Localization.Tables;

namespace GlyphPuzzle.UI.Components
{
    public class LocalizedTextElementViewModel : BaseViewModel
    {
        private TableReference _tableRef;
        public TableReference TableRef
        {
            get => _tableRef;
            set
            {
                if (_tableRef.TableCollectionName != value.TableCollectionName || _tableRef.TableCollectionNameGuid != value.TableCollectionNameGuid)
                {
                    _tableRef = value;
                    OnPropertyChanged();
                }
            }
        }

        private TableEntryReference _entryRef;
        public TableEntryReference EntryRef
        {
            get => _entryRef;
            set
            {
                if (_entryRef.Key != value.Key || _entryRef.KeyId != value.KeyId)
                {
                    _entryRef = value;
                    OnPropertyChanged();
                }
            }
        }

        private object[] _arguments;
        public object[] Arguments
        {
            get => _arguments;
            set
            {
                // Basic check; deep comparison might be needed if array contents are critical for change notification
                if (_arguments != value)
                {
                    _arguments = value;
                    OnPropertyChanged();
                }
            }
        }
        
        public LocalizedTextElementViewModel() { }

        public LocalizedTextElementViewModel(TableReference tableRef, TableEntryReference entryRef, params object[] arguments)
        {
            _tableRef = tableRef;
            _entryRef = entryRef;
            _arguments = arguments;
        }
    }
}