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
            </div>
        </ModernContainer>
    );
}

export default CardCreate; 