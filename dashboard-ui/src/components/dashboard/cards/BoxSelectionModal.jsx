import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import '../../../assets/styles/Modal.css';
import '../../../assets/styles/Migration.css';

function BoxSelectionModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    cardIds = [], 
    currentBoxId = null,
    title = null 
}) {
    const { t } = useTranslation();
    const { api } = useAuth();
    const { error: showError } = useToast();
    
    const [boxes, setBoxes] = useState([]);
    const [selectedBoxId, setSelectedBoxId] = useState('');
    const [preserveProgress, setPreserveProgress] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetchingBoxes, setFetchingBoxes] = useState(false);

    // Fetch user boxes when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchBoxes();
        }
    }, [isOpen]);

    const fetchBoxes = async () => {
        try {
            setFetchingBoxes(true);
            const response = await api.get('/dashboard/boxes');
            
            const userBoxData = response.data.data.boxes || [];
            
            // Extract the Box objects from the response data
            const userBoxes = userBoxData.map(item => item.Box);
            
            // Filter out current box if provided
            const availableBoxes = currentBoxId 
                ? userBoxes.filter(box => box.ID !== currentBoxId)
                : userBoxes;
            
            setBoxes(availableBoxes);
            
            // Auto-select first available box
            if (availableBoxes.length > 0) {
                setSelectedBoxId(availableBoxes[0].ID);
            }
        } catch (error) {
            showError(t('migration.fetchBoxesError'));
        } finally {
            setFetchingBoxes(false);
        }
    };

    const handleConfirm = () => {
        if (!selectedBoxId) {
            showError(t('migration.selectBoxRequired'));
            return;
        }

        setLoading(true);
        onConfirm({
            targetBoxId: selectedBoxId,
            preserveProgress: preserveProgress,
            cardIds: cardIds
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleClose = () => {
        if (!loading) {
            setSelectedBoxId('');
            setPreserveProgress(true);
            onClose();
        }
    };

    const selectedBox = boxes.find(box => box.ID === selectedBoxId);
    const isBulkMigration = cardIds.length > 1;

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content migration-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        {title || (isBulkMigration 
                            ? t('migration.bulkMigrateTitle', { count: cardIds.length })
                            : t('migration.migrateCardTitle')
                        )}
                    </h3>
                    <button 
                        className="modal-close-btn" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {fetchingBoxes ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <span>{t('migration.fetchingBoxes')}</span>
                        </div>
                    ) : boxes.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-inbox"></i>
                            <h4>{t('migration.noAvailableBoxes')}</h4>
                            <p>{t('migration.noAvailableBoxesDescription')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label htmlFor="target-box-select">
                                    {t('migration.selectTargetBox')}
                                </label>
                                <select
                                    id="target-box-select"
                                    value={selectedBoxId}
                                    onChange={(e) => setSelectedBoxId(e.target.value)}
                                    className="form-control"
                                    disabled={loading}
                                >
                                    <option value="">{t('migration.selectBox')}</option>
                                    {boxes.map(box => (
                                        <option key={box.ID} value={box.ID}>
                                            {box.Name}
                                            {box.Description && ` - ${box.Description}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedBox && (
                                <div className="selected-box-info">
                                    <div className="info-item">
                                        <i className="fas fa-box"></i>
                                        <span>
                                            <strong>{selectedBox.Name}</strong>
                                            {selectedBox.Description && (
                                                <span className="box-description">
                                                    {selectedBox.Description}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={preserveProgress}
                                            onChange={(e) => setPreserveProgress(e.target.checked)}
                                            disabled={loading}
                                        />
                                        <span className="checkbox-text">
                                            {t('migration.preserveProgress')}
                                        </span>
                                    </label>
                                    <div className="checkbox-help">
                                        {preserveProgress 
                                            ? t('migration.preserveProgressHelp')
                                            : t('migration.resetProgressHelp')
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="migration-summary">
                                <h4>{t('migration.summary')}</h4>
                                <ul>
                                    <li>
                                        <i className="fas fa-layer-group"></i>
                                        {isBulkMigration 
                                            ? t('migration.cardsToMigrate', { count: cardIds.length })
                                            : t('migration.cardToMigrate')
                                        }
                                    </li>
                                    <li>
                                        <i className="fas fa-arrow-right"></i>
                                        {t('migration.targetBox')}: <strong>{selectedBox?.Name || t('migration.selectBox')}</strong>
                                    </li>
                                    <li>
                                        <i className="fas fa-chart-line"></i>
                                        {preserveProgress 
                                            ? t('migration.progressWillBePreserved')
                                            : t('migration.progressWillBeReset')
                                        }
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        {t('common.cancel')}
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleConfirm}
                        disabled={loading || !selectedBoxId || fetchingBoxes}
                    >
                        {loading ? (
                            <>
                                <div className="btn-spinner"></div>
                                {isBulkMigration ? t('migration.migrating') : t('migration.migrating')}
                            </>
                        ) : (
                            <>
                                <i className="fas fa-arrow-right"></i>
                                {isBulkMigration ? t('migration.migrateCards') : t('migration.migrateCard')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BoxSelectionModal;
