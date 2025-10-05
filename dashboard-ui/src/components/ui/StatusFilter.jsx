import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const statusOptions = [
    { value: '', label: 'all', icon: 'fa-layer-group' },
    { value: 'new', label: 'new', icon: 'fa-star' },
    { value: 'learning', label: 'learning', icon: 'fa-graduation-cap' },
    { value: 'review', label: 'review', icon: 'fa-redo' },
    { value: 'archived', label: 'archived', icon: 'fa-archive' }
];

function StatusFilter({ value, onChange, className = '' }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const selectedOption = statusOptions.find(opt => opt.value === value) || statusOptions[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionClick = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button 
                type="button"
                className="status-filter-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="status-filter-label">
                    <i className={`fas ${selectedOption.icon}`}></i>
                    <span>{t(`cards.${selectedOption.label}`)}</span>
                </span>
                <i className="fas fa-chevron-down status-filter-icon"></i>
            </button>
            
            {isOpen && (
                <ul className="status-filter-options">
                    {statusOptions.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <li
                                key={option.value}
                                className={`status-filter-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(option.value)}
                            >
                                <span className="status-filter-option-content">
                                    <i className={`fas ${option.icon}`}></i>
                                    <span>{t(`cards.${option.label}`)}</span>
                                </span>
                                {isSelected && (
                                    <i className="fas fa-check status-filter-check"></i>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default StatusFilter;
