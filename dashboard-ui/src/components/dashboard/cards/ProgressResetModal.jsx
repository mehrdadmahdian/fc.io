import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../../contexts/ToastContext';
import api from '../../../services/api';
import '../../../assets/styles/Modal.css';
import '../../../assets/styles/ProgressReset.css';

const ProgressResetModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  resetType, // 'card', 'box', 'bulk'
  cardIds = [], 
  boxId = null,
  currentBoxId = null 
}) => {
  const { t } = useTranslation();
  const { success: showToast, error: showError } = useToast();
  
  const [resetLevel, setResetLevel] = useState('both');
  const [resetMode, setResetMode] = useState('complete');
  const [createBackup, setCreateBackup] = useState(true);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(1);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (confirmationStep < 2) {
      setConfirmationStep(2);
      return;
    }

    setLoading(true);
    try {
      let response;
      
      switch (resetType) {
        case 'card':
          if (cardIds.length !== 1) {
            throw new Error('Card reset requires exactly one card ID');
          }
          response = await api.post(`/dashboard/boxes/${currentBoxId}/cards/${cardIds[0]}/reset-progress`, {
            reset_level: resetLevel,
            reset_type: resetMode,
            create_backup: createBackup,
            reason: reason
          });
          break;
          
        case 'box':
          if (!boxId) {
            throw new Error('Box reset requires box ID');
          }
          response = await api.post(`/dashboard/boxes/${boxId}/reset-progress`, {
            reset_level: resetLevel,
            reset_type: resetMode,
            create_backup: createBackup,
            reason: reason
          });
          break;
          
        case 'bulk':
          if (cardIds.length === 0) {
            throw new Error('Bulk reset requires card IDs');
          }
          response = await api.post('/dashboard/cards/bulk-reset', {
            card_ids: cardIds,
            reset_level: resetLevel,
            reset_type: resetMode,
            create_backup: createBackup,
            reason: reason,
            description: description
          });
          break;
          
        default:
          throw new Error('Invalid reset type');
      }

      const result = response.data.data;
      
      showToast(
        t('progress_reset.success_message', { 
          successful: result.total_successful,
          total: result.total_requested 
        })
      );
      
      if (createBackup && result.backup_id) {
        showToast(
          t('progress_reset.backup_created', { backupId: result.backup_id })
        );
      }
      
      onConfirm(result);
      handleClose();
      
    } catch (error) {
      console.error('Reset failed:', error);
      showError(
        error.response?.data?.message || t('progress_reset.error_message')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmationStep(1);
    setResetLevel('both');
    setResetMode('complete');
    setCreateBackup(true);
    setReason('');
    setDescription('');
    setLoading(false);
    onClose();
  };

  const getResetTitle = () => {
    switch (resetType) {
      case 'card':
        return t('progress_reset.reset_card_title');
      case 'box':
        return t('progress_reset.reset_box_title');
      case 'bulk':
        return t('progress_reset.reset_bulk_title', { count: cardIds.length });
      default:
        return t('progress_reset.reset_title');
    }
  };

  const getWarningMessage = () => {
    const cardCount = resetType === 'card' ? 1 : 
                     resetType === 'box' ? t('progress_reset.all_cards_in_box') : 
                     cardIds.length;
    
    return t('progress_reset.warning_message', { 
      count: cardCount,
      resetMode: resetMode === 'complete' ? t('progress_reset.complete_reset') : t('progress_reset.progress_only_reset')
    });
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content progress-reset-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{getResetTitle()}</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {confirmationStep === 1 ? (
            <>
              {/* Reset Configuration */}
              <div className="reset-config-section">
                <div className="form-group">
                  <label>{t('progress_reset.reset_level_label')}</label>
                  <select 
                    value={resetLevel} 
                    onChange={(e) => setResetLevel(e.target.value)}
                    className="form-control"
                  >
                    <option value="both">{t('progress_reset.both_directions')}</option>
                    <option value="review">{t('progress_reset.forward_only')}</option>
                    <option value="reverse_review">{t('progress_reset.reverse_only')}</option>
                  </select>
                  <small className="form-text">
                    {t('progress_reset.reset_level_help')}
                  </small>
                </div>

                <div className="form-group">
                  <label>{t('progress_reset.reset_type_label')}</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        value="complete"
                        checked={resetMode === 'complete'}
                        onChange={(e) => setResetMode(e.target.value)}
                      />
                      <span>{t('progress_reset.complete_reset')}</span>
                      <small>{t('progress_reset.complete_reset_help')}</small>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        value="progress_only"
                        checked={resetMode === 'progress_only'}
                        onChange={(e) => setResetMode(e.target.value)}
                      />
                      <span>{t('progress_reset.progress_only_reset')}</span>
                      <small>{t('progress_reset.progress_only_help')}</small>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={createBackup}
                      onChange={(e) => setCreateBackup(e.target.checked)}
                    />
                    <span>{t('progress_reset.create_backup')}</span>
                  </label>
                  <small className="form-text">
                    {t('progress_reset.backup_help')}
                  </small>
                </div>

                <div className="form-group">
                  <label>{t('progress_reset.reason_label')}</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t('progress_reset.reason_placeholder')}
                    className="form-control"
                  />
                </div>

                {resetType === 'bulk' && (
                  <div className="form-group">
                    <label>{t('progress_reset.description_label')}</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('progress_reset.description_placeholder')}
                      className="form-control"
                      rows="3"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Step */}
              <div className="confirmation-section">
                <div className="warning-box">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-content">
                    <h4>{t('progress_reset.confirm_title')}</h4>
                    <p>{getWarningMessage()}</p>
                    
                    <div className="reset-summary">
                      <div className="summary-item">
                        <strong>{t('progress_reset.reset_level_label')}:</strong>
                        <span>
                          {resetLevel === 'both' ? t('progress_reset.both_directions') :
                           resetLevel === 'review' ? t('progress_reset.forward_only') :
                           t('progress_reset.reverse_only')}
                        </span>
                      </div>
                      <div className="summary-item">
                        <strong>{t('progress_reset.reset_type_label')}:</strong>
                        <span>
                          {resetMode === 'complete' ? 
                            t('progress_reset.complete_reset') : 
                            t('progress_reset.progress_only_reset')}
                        </span>
                      </div>
                      <div className="summary-item">
                        <strong>{t('progress_reset.backup_status')}:</strong>
                        <span>
                          {createBackup ? 
                            t('progress_reset.backup_will_be_created') : 
                            t('progress_reset.no_backup')}
                        </span>
                      </div>
                      {reason && (
                        <div className="summary-item">
                          <strong>{t('progress_reset.reason_label')}:</strong>
                          <span>{reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {confirmationStep === 1 ? (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleClose}
                disabled={loading}
              >
                {t('common.cancel')}
              </button>
              <button 
                className="btn btn-warning" 
                onClick={handleReset}
                disabled={loading}
              >
                {t('progress_reset.continue')}
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={() => setConfirmationStep(1)}
                disabled={loading}
              >
                {t('common.back')}
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? t('common.processing') : t('progress_reset.confirm_reset')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressResetModal;
