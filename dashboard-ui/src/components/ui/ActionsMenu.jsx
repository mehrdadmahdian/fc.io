import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function ActionsMenu({ actions, buttonContent, buttonClassName = '', disabled = false }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
                setHoveredIndex(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleActionClick = (action) => {
        if (!action.disabled && action.onClick) {
            action.onClick();
            setIsOpen(false);
            setHoveredIndex(null);
        }
    };

    return (
        <div className="actions-menu" ref={menuRef}>
            <button
                type="button"
                className={buttonClassName}
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {buttonContent || (
                    <>
                        <i className="fas fa-ellipsis-v"></i>
                        <span>{t('common.actions')}</span>
                    </>
                )}
            </button>

            {isOpen && (
                <div className="actions-menu-items">
                    {actions.map((action, index) => {
                        if (action.divider) {
                            return <div key={`divider-${index}`} className="actions-menu-divider" />;
                        }

                        const isHovered = hoveredIndex === index;

                        return (
                            <button
                                key={action.id || index}
                                onClick={() => handleActionClick(action)}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`actions-menu-item ${
                                    isHovered ? 'active' : ''
                                } ${action.danger ? 'danger' : ''}`}
                                disabled={action.disabled}
                            >
                                {action.icon && <i className={`fas ${action.icon}`}></i>}
                                <span>{action.label}</span>
                                {action.shortcut && (
                                    <span className="actions-menu-shortcut">{action.shortcut}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ActionsMenu;
