import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { forkBox } from '../../services/socialApi';
import { useToast } from '../../contexts/ToastContext';

const ForkButton = ({ boxId, boxName, onForkSuccess, disabled = false }) => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [description, setDescription] = useState('');

    const handleForkClick = () => {
        setShowModal(true);
    };

    const handleForkConfirm = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await forkBox(boxId, description);
            success(t('social.fork.success'));
            setShowModal(false);
            setDescription('');
            
            if (onForkSuccess) {
                onForkSuccess(response.data.forked_box);
            }
        } catch (error) {
            error(
                error.response?.data?.error || t('social.fork.error')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setDescription('');
    };

    return (
        <>
            <button 
                className="fork-btn"
                onClick={handleForkClick}
                disabled={disabled || isLoading}
                title={t('social.fork.tooltip')}
            >
                <svg className="fork-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17v-4" />
                    <path d="M8 13v4" />
                </svg>
                {t('social.fork.fork')}
            </button>

            {showModal && (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="modal-content fork-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('social.fork.modalTitle')}</h3>
                            <button className="modal-close" onClick={handleCancel}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <p className="fork-info">
                                {t('social.fork.modalDescription', { boxName })}
                            </p>
                            
                            <div className="form-group">
                                <label htmlFor="fork-description">
                                    {t('social.fork.descriptionLabel')}
                                </label>
                                <textarea
                                    id="fork-description"
                                    className="form-control"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('social.fork.descriptionPlaceholder')}
                                    rows={3}
                                    maxLength={500}
                                />
                                <small className="form-text">
                                    {t('social.fork.descriptionHint')}
                                </small>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                className="btn btn-secondary" 
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleForkConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading-spinner">⟳</span>
                                        {t('social.fork.forking')}
                                    </>
                                ) : (
                                    t('social.fork.confirmFork')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ForkButton;
