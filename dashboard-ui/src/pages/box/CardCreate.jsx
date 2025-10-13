import { useNavigate, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ModernContainer from '../../components/layout/ModernContainer';
import FormMarkdownTextarea from '../../components/form/FormMarkdownTextarea';
import { api } from '../../services/api';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Form.css';
import '../../assets/styles/ModernPage.css';
import '../../assets/styles/MarkdownTextarea.css';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '../../contexts/ToastContext';

function CardCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { boxId, cardId } = useParams();
    const { success, error } = useToast();
    const [formData, setFormData] = useState({
        front: '',
        back: '',
        extra: '',
        hint: ''
    });
    const [loading, setLoading] = useState(cardId ? true : false);
    const [boxName, setBoxName] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const formRef = useRef(null);
    const [showMigrationModal, setShowMigrationModal] = useState(false);
    const [userBoxes, setUserBoxes] = useState([]);
    const [selectedTargetBox, setSelectedTargetBox] = useState('');
    const [preserveProgress, setPreserveProgress] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Function to handle navigation back to the appropriate page
    const navigateBack = () => {
        // Check if we have a referrer in the location state
        if (location.state?.from) {
            navigate(location.state.from);
        } else {
            // Check if there's browser history to go back to
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                // Fallback to box details page
                navigate(`/box/${boxId}`);
            }
        }
    };

    useEffect(() => {
        // Handle window resize for mobile detection
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        
        // Fetch box information to get the box name
        const fetchBox = async () => {
            try {
                const response = await api.get(`/dashboard/boxes/${boxId}`);
                setBoxName(response.data.data.box.Name);
            } catch (err) {
                // Error fetching box - box name will remain empty
            }
        };

        if (cardId) {
            const fetchCard = async () => {
                try {
                    const response = await api.get(`/dashboard/boxes/${boxId}/cards/${cardId}`);
                    setFormData({
                        front: response.data.data.card.Front,
                        back: response.data.data.card.Back,
                        extra: response.data.data.card.Extra || '',
                        hint: response.data.data.card.Hint || ''
                    });
                } catch (err) {
                    // Error fetching card - handled by loading state
                } finally {
                    setLoading(false);
                }
            };
            fetchCard();
        }

        fetchBox();
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [boxId, cardId]);

    const handleSubmit = async (submitFormData) => {
        // Simple validation check
        if (!submitFormData.front.trim() || !submitFormData.back.trim()) {
            error(t('cardCreate.frontAndBackRequired', 'Both question and answer are required.'));
            return;
        }
        try {
            if (cardId) {
                // Update existing card
                await api.put(`/dashboard/boxes/${boxId}/cards/${cardId}`, submitFormData);
                success(t('cardCreate.updateSuccess'));
                navigateBack();
            } else {
                // Create new card
                await api.post(`/dashboard/boxes/${boxId}/cards`, submitFormData);
                success(t('cardCreate.createSuccess'));
                navigateBack();
            }
        } catch (err) {
            // Error saving card - handled by toast
            error(t('cardCreate.saveError'));
        }
    };
    
    const handleFieldChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    // Card operation handlers (only for edit mode)
    const handleDeleteCard = async () => {
        if (window.confirm(t('cards.deleteConfirm', 'Are you sure you want to delete this card?'))) {
            setIsProcessing(true);
            try {
                await api.delete(`/dashboard/boxes/${boxId}/cards/${cardId}`);
                success(t('cards.deleteSuccess', 'Card deleted successfully'));
                // Wait a bit to ensure the operation completes
                await new Promise(resolve => setTimeout(resolve, 500));
                navigateBack();
            } catch (err) {
                error(t('cards.deleteError', 'Failed to delete card'));
                setIsProcessing(false);
            }
        }
    };

    const handleArchiveCard = async () => {
        setIsProcessing(true);
        try {
            await api.post(`/dashboard/boxes/${boxId}/cards/${cardId}/archive`);
            success(t('cards.archiveSuccess', 'Card archived successfully'));
            // Wait a bit to ensure the operation completes
            await new Promise(resolve => setTimeout(resolve, 500));
            navigateBack();
        } catch (err) {
            error(t('cards.archiveError', 'Failed to archive card'));
            setIsProcessing(false);
        }
    };

    const handleResetProgress = async () => {
        if (window.confirm(t('cards.resetConfirm', 'Are you sure you want to reset the progress for this card?'))) {
            setIsProcessing(true);
            try {
                await api.post(`/dashboard/boxes/${boxId}/cards/${cardId}/reset`);
                success(t('cards.resetSuccess', 'Card progress reset successfully'));
                // Wait a bit to ensure the operation completes
                await new Promise(resolve => setTimeout(resolve, 500));
                setIsProcessing(false);
            } catch (err) {
                error(t('cards.resetError', 'Failed to reset card progress'));
                setIsProcessing(false);
            }
        }
    };

    const handleOpenMigrationModal = async () => {
        try {
            // Fetch user's boxes
            const response = await api.get('/dashboard/boxes');
            const boxes = response.data.data.boxes.filter(b => b.Box.ID !== boxId);
            setUserBoxes(boxes);
            setShowMigrationModal(true);
        } catch (err) {
            error(t('migration.fetchBoxesError', 'Failed to fetch boxes'));
        }
    };

    const handleMigrateCard = async () => {
        if (!selectedTargetBox) {
            error(t('migration.selectBoxError', 'Please select a target box'));
            return;
        }

        setIsProcessing(true);
        try {
            await api.post(`/dashboard/boxes/${boxId}/cards/migrate`, {
                cardIds: [cardId],
                targetBoxId: selectedTargetBox,
                preserveProgress: preserveProgress
            });
            success(t('migration.success', 'Card moved successfully'));
            setShowMigrationModal(false);
            // Wait a bit to ensure the operation completes
            await new Promise(resolve => setTimeout(resolve, 500));
            navigateBack();
        } catch (err) {
            error(t('migration.error', 'Failed to move card'));
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <ModernContainer>
                <div className="modern-page-container">
                    <div className="modern-title-bar">
                        <div className="modern-title-content">
                            <div className="modern-page-title">
                                <h1>{t('common.loading')}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="modern-content-area">
                        <div className="modern-content-box">
                            <div className="modern-content-scroll">
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    {t('common.loading')}...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModernContainer>
        );
    }

    return (
        <ModernContainer>
            <div className="modern-page-container">
                {/* Fixed Title Bar */}
                <div className="modern-title-bar">
                    <div className="modern-title-content">
                        <button 
                            className="modern-back-button"
                            onClick={navigateBack}
                            title={t('common.back')}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="modern-page-title">
                            <h1>{cardId ? t('cardCreate.editTitle') : t('cardCreate.title')}</h1>
                            {boxName && <span className="subtitle">{boxName}</span>}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <div className="compact-form">
                                {/* Question Field */}
                                <FormMarkdownTextarea
                                    label={t('cardCreate.question')}
                                    name="front"
                                    value={formData.front}
                                    onChange={(e) => handleFieldChange('front', e.target.value)}
                                    placeholder={t('cardCreate.questionPlaceholder')}
                                    required={true}
                                    rows={3}
                                />

                                {/* Answer Field */}
                                <FormMarkdownTextarea
                                    label={t('cardCreate.answer')}
                                    name="back"
                                    value={formData.back}
                                    onChange={(e) => handleFieldChange('back', e.target.value)}
                                    placeholder={t('cardCreate.answerPlaceholder')}
                                    required={true}
                                    rows={3}
                                />

                                {/* Extra Field */}
                                <FormMarkdownTextarea
                                    label={t('cardCreate.additionalInfo')}
                                    name="extra"
                                    value={formData.extra}
                                    onChange={(e) => handleFieldChange('extra', e.target.value)}
                                    placeholder={t('cardCreate.additionalInfoPlaceholder')}
                                    required={false}
                                    rows={2}
                                />

                                {/* Hint Field */}
                                <div className="compact-form-group">
                                    <label className="compact-form-label" htmlFor="hint">
                                        {t('cardCreate.hint')}
                                    </label>
                                    <input
                                        id="hint"
                                        type="text"
                                        className="compact-form-input"
                                        value={formData.hint}
                                        onChange={(e) => handleFieldChange('hint', e.target.value)}
                                        placeholder={t('cardCreate.hintPlaceholder')}
                                    />
                                </div>

                                {/* Card Operations - Only show when editing */}
                                {cardId && (
                                    <div className="compact-form-group" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
                                        <label className="compact-form-label">
                                            {t('cards.operations', 'Card Operations')}
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                onClick={handleOpenMigrationModal}
                                                className="compact-btn compact-btn-outline"
                                                style={{ flex: '1 1 auto' }}
                                                disabled={isProcessing}
                                            >
                                                <i className="fas fa-arrow-right"></i>
                                                {t('migration.move_to_box', 'Move to Box')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleResetProgress}
                                                className="compact-btn compact-btn-outline"
                                                style={{ flex: '1 1 auto' }}
                                                disabled={isProcessing}
                                            >
                                                <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-undo-alt'}`}></i>
                                                {t('cards.reset', 'Reset Progress')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleArchiveCard}
                                                className="compact-btn compact-btn-outline"
                                                style={{ flex: '1 1 auto' }}
                                                disabled={isProcessing}
                                            >
                                                <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-archive'}`}></i>
                                                {t('cards.archive', 'Archive')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDeleteCard}
                                                className="compact-btn compact-btn-outline"
                                                style={{ flex: '1 1 auto', color: '#DC2626', borderColor: '#DC2626' }}
                                                disabled={isProcessing}
                                            >
                                                <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-trash-alt'}`}></i>
                                                {t('cards.delete', 'Delete')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Buttons */}
                <div className="sticky-actions">
                    <div className="sticky-actions-content">
                        <button 
                            type="button"
                            onClick={navigateBack}
                            className="sticky-btn sticky-btn-cancel"
                        >
                            <i className="fas fa-times"></i>
                            {t('common.cancel')}
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleSubmit(formData)}
                            className="sticky-btn sticky-btn-save"
                        >
                            <i className="fas fa-check"></i>
                            {cardId ? t('cardCreate.update') : t('cardCreate.save')}
                        </button>
                    </div>
                </div>

                {/* Migration Modal */}
                {showMigrationModal && (
                    <div className="modal-overlay" onClick={() => setShowMigrationModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{t('migration.move_card', 'Move Card to Another Box')}</h3>
                                <button 
                                    className="modal-close"
                                    onClick={() => setShowMigrationModal(false)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="compact-form-group">
                                    <label className="compact-form-label">
                                        {t('migration.select_target_box', 'Select Target Box')}
                                    </label>
                                    <select
                                        className="compact-form-input"
                                        value={selectedTargetBox}
                                        onChange={(e) => setSelectedTargetBox(e.target.value)}
                                    >
                                        <option value="">{t('migration.choose_box', 'Choose a box...')}</option>
                                        {userBoxes.map(box => (
                                            <option key={box.Box.ID} value={box.Box.ID}>
                                                {box.Box.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="compact-form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={preserveProgress}
                                            onChange={(e) => setPreserveProgress(e.target.checked)}
                                        />
                                        <span>{t('migration.preserve_progress', 'Preserve learning progress')}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="sticky-btn sticky-btn-cancel"
                                    onClick={() => setShowMigrationModal(false)}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <button
                                    className="sticky-btn sticky-btn-save"
                                    onClick={handleMigrateCard}
                                    disabled={!selectedTargetBox || isProcessing}
                                >
                                    <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-arrow-right'}`}></i>
                                    {isProcessing ? t('migration.moving', 'Moving...') : t('migration.move', 'Move')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ModernContainer>
    );
}

export default CardCreate; 