import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import SimpleTextarea from './SimpleTextarea';

const QuickAddCardModal = ({ isOpen, onClose, boxes, activeBox, onCardCreated }) => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [formData, setFormData] = useState({
        front: '',
        back: '',
        extra: '',
        hint: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                front: '',
                back: '',
                extra: '',
                hint: ''
            });
            
            // Focus on front field after a brief delay
            setTimeout(() => {
                const frontTextarea = document.querySelector('.quick-add-modal textarea[name="front"]');
                if (frontTextarea) {
                    frontTextarea.focus();
                }
            }, 150);
        }
    }, [isOpen]);

    const handleFieldChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.front.trim() || !formData.back.trim()) {
            error(t('quickAdd.frontAndBackRequired'));
            return;
        }
        
        if (!activeBox) {
            error(t('quickAdd.noActiveBoxError'));
            return;
        }

        setIsLoading(true);
        try {
            await api.post(`/dashboard/boxes/${activeBox.ID}/cards`, formData);
            success(t('quickAdd.cardCreated'));
            onCardCreated();
        } catch (err) {
            console.error('Error creating card:', err);
            error(err.response?.data?.message || t('quickAdd.createError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        // Close modal on Escape key
        if (e.key === 'Escape' && !isLoading) {
            onClose();
        }
        // Submit on Ctrl+Enter
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose} onKeyDown={handleKeyDown}>
            <div className="modal-content quick-add-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        <i className="fas fa-plus-circle"></i>
                        {t('quickAdd.title')}
                    </h3>
                    <button className="modal-close" onClick={handleClose} disabled={isLoading}>
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body quick-add-body">
                        {/* Active Box Display */}
                        {activeBox && (
                            <div className="form-group single-box-display">
                                <div className="selected-box">
                                    <i className="fas fa-folder"></i>
                                    <span className="box-name">{activeBox.Name}</span>
                                </div>
                            </div>
                        )}

                        {/* Card Fields */}
                        <div className="card-fields">
                            {/* Front Field */}
                            <SimpleTextarea
                                label={t('quickAdd.question')}
                                name="front"
                                value={formData.front}
                                onChange={(e) => handleFieldChange('front', e.target.value)}
                                placeholder={t('quickAdd.questionPlaceholder')}
                                required={true}
                                rows={2}
                                disabled={isLoading}
                            />

                            {/* Back Field */}
                            <SimpleTextarea
                                label={t('quickAdd.answer')}
                                name="back"
                                value={formData.back}
                                onChange={(e) => handleFieldChange('back', e.target.value)}
                                placeholder={t('quickAdd.answerPlaceholder')}
                                required={true}
                                rows={2}
                                disabled={isLoading}
                            />

                            {/* Extra Field */}
                            <SimpleTextarea
                                label={t('quickAdd.additionalInfo')}
                                name="extra"
                                value={formData.extra}
                                onChange={(e) => handleFieldChange('extra', e.target.value)}
                                placeholder={t('quickAdd.additionalInfoPlaceholder')}
                                required={false}
                                rows={1}
                                disabled={isLoading}
                            />

                            {/* Hint Field */}
                            <div className="form-group">
                                <label htmlFor="hint-input">
                                    {t('quickAdd.hint')}
                                    <span className="optional">({t('common.optional')})</span>
                                </label>
                                <input
                                    id="hint-input"
                                    type="text"
                                    className="form-control"
                                    value={formData.hint}
                                    onChange={(e) => handleFieldChange('hint', e.target.value)}
                                    placeholder={t('quickAdd.hintPlaceholder')}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Keyboard Shortcuts Hint */}
                        <div className="keyboard-hints">
                            <small>
                                <kbd>Ctrl+Enter</kbd> {t('quickAdd.submitShortcut')} • <kbd>Esc</kbd> {t('quickAdd.cancelShortcut')}
                            </small>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button"
                            className="btn btn-secondary" 
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            <i className="fas fa-times"></i>
                            {t('common.cancel')}
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-primary" 
                            disabled={isLoading || !formData.front.trim() || !formData.back.trim() || !activeBox}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner">⟳</span>
                                    {t('quickAdd.creating')}
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-plus"></i>
                                    {t('quickAdd.createCard')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickAddCardModal;
