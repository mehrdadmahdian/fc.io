import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../../assets/styles/LabelSelect.css';

function LabelSelect({ selectedLabels, onChange }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [availableLabels, setAvailableLabels] = useState([
        { id: 1, name: 'JavaScript', color: '#f59e0b' },
        { id: 2, name: 'React', color: '#3b82f6' },
        { id: 3, name: 'CSS', color: '#10b981' },
        { id: 4, name: 'HTML', color: '#ef4444' },
        { id: 5, name: 'Node.js', color: '#84cc16' },
    ]);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLabelToggle = (label) => {
        const isSelected = selectedLabels.some(l => l.id === label.id);
        if (isSelected) {
            onChange(selectedLabels.filter(l => l.id !== label.id));
        } else {
            onChange([...selectedLabels, label]);
        }
    };

    const generateColor = () => {
        const colors = [
            '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#84cc16',
            '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleCreateLabel = async (e) => {
        e.preventDefault();
        if (!newLabel.trim()) return;

        const newLabelObj = {
            id: Date.now(),
            name: newLabel.trim(),
            color: generateColor()
        };

        setAvailableLabels(prev => [...prev, newLabelObj]);
        onChange([...selectedLabels, newLabelObj]);
        setNewLabel('');
        inputRef.current?.focus();
    };

    const removeLabel = (e, labelId) => {
        e.stopPropagation();
        onChange(selectedLabels.filter(label => label.id !== labelId));
    };

    return (
        <div className="label-select" ref={dropdownRef}>
            <div 
                className="label-input-area"
                onClick={() => setIsOpen(true)}
            >
                <div className="selected-labels">
                    {selectedLabels.map(label => (
                        <span 
                            key={label.id} 
                            className="label-tag"
                            style={{ backgroundColor: label.color }}
                        >
                            {label.name}
                            <button 
                                onClick={(e) => removeLabel(e, label.id)}
                                className="remove-label"
                                aria-label="Remove label"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <button 
                    type="button"
                    className="add-label-btn"
                    onClick={() => setIsOpen(true)}
                >
                    <i className="fas fa-plus"></i>
                    {t('labels.add')}
                </button>
            </div>

            {isOpen && (
                <div className="label-dropdown">
                    <form onSubmit={handleCreateLabel} className="create-label-form">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder={t('labels.createNew')}
                            className="create-label-input"
                            autoFocus
                        />
                        <button 
                            type="submit" 
                            className="create-label-btn"
                            disabled={!newLabel.trim()}
                        >
                            <i className="fas fa-plus"></i>
                        </button>
                    </form>

                    <div className="available-labels">
                        {availableLabels.map(label => (
                            <div 
                                key={label.id}
                                className={`label-option ${
                                    selectedLabels.some(l => l.id === label.id) ? 'selected' : ''
                                }`}
                                onClick={() => handleLabelToggle(label)}
                            >
                                <span 
                                    className="label-color"
                                    style={{ backgroundColor: label.color }}
                                />
                                <span className="label-name">{label.name}</span>
                                {selectedLabels.some(l => l.id === label.id) && (
                                    <i className="fas fa-check"></i>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LabelSelect; 