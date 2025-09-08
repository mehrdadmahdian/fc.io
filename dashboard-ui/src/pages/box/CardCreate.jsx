import { useNavigate, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ModernContainer from '../../components/layout/ModernContainer';
import Form from '../../components/form/Form';
import FormMarkdownTextarea from '../../components/form/FormMarkdownTextarea';
import { api } from '../../services/api';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Form.css';
import '../../assets/styles/MarkdownTextarea.css';
import '../../assets/styles/ModernPage.css';
import { useEffect, useState } from 'react';
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
        extra: ''
    });
    const [loading, setLoading] = useState(cardId ? true : false);
    const [boxName, setBoxName] = useState('');

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
                        extra: response.data.data.card.Extra || ''
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
    }, [boxId, cardId]);

    const handleSubmit = async (formData) => {
        try {
            if (cardId) {
                // Update existing card
                await api.put(`/dashboard/boxes/${boxId}/cards/${cardId}`, formData);
                success(t('cardCreate.updateSuccess'));
                navigateBack();
            } else {
                // Create new card
                await api.post(`/dashboard/boxes/${boxId}/cards`, formData);
                success(t('cardCreate.createSuccess'));
                navigateBack();
            }
        } catch (err) {
            // Error saving card - handled by toast
            error(t('cardCreate.saveError'));
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
                            {boxName && <span className="subtitle">{t('cardCreate.inBox')}: {boxName}</span>}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <Form
                            onSubmit={handleSubmit}
                            onCancel={navigateBack}
                            submitLabel={cardId ? t('cardCreate.update') : t('cardCreate.save')}
                            cancelLabel={t('common.cancel')}
                            initialData={formData}
                            validateForm={true}
                        >
                            <FormMarkdownTextarea
                                label={`${t('cardCreate.question')} *`}
                                name="front"
                                required={true}
                                placeholder={t('cardCreate.questionPlaceholder')}
                                rows={6}
                            />

                            <FormMarkdownTextarea
                                label={`${t('cardCreate.answer')} *`}
                                name="back"
                                placeholder={t('cardCreate.answerPlaceholder')}
                                required={true}
                                rows={6}
                            />

                            <FormMarkdownTextarea
                                label={t('cardCreate.additionalInfo')}
                                name="extra"
                                placeholder={t('cardCreate.additionalInfoPlaceholder')}
                                rows={4}
                            />
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </ModernContainer>
    );
}

export default CardCreate; 