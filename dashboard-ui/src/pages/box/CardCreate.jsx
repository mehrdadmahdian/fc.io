import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardContainer from '../../components/layout/DashboardContainer';
import PageHeader from '../../components/common/PageHeader';
import Form from '../../components/form/Form';
import FormMarkdownTextarea from '../../components/form/FormMarkdownTextarea';
import { api } from '../../services/api';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Form.css';
import '../../assets/styles/MarkdownTextarea.css';
import { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

function CardCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { boxId, cardId } = useParams();
    const { success, error } = useToast();
    const [formData, setFormData] = useState({
        front: '',
        back: '',
        extra: ''
    });
    const [loading, setLoading] = useState(cardId ? true : false);

    useEffect(() => {
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
                    console.error('Error fetching card:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchCard();
        }
    }, [boxId, cardId]);

    const handleSubmit = async (formData) => {
        try {
            if (cardId) {
                // Update existing card
                await api.put(`/dashboard/boxes/${boxId}/cards/${cardId}`, formData);
                success(t('cardCreate.updateSuccess'));
                navigate(`/box/${boxId}/review`);    
            } else {
                // Create new card
                await api.post(`/dashboard/boxes/${boxId}/cards`, formData);
                success(t('cardCreate.createSuccess'));
                navigate(`/box/${boxId}`);
            }
        } catch (err) {
            console.error('Error saving card:', err);
            error(t('cardCreate.saveError'));
        }
    };

    if (loading) {
        return (
            <DashboardContainer>
                <div className="dashboard-container">
                    <PageHeader title={t('common.loading')} />
                    <div className="dashboard-content">
                        <div className="dashboard-box">
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                {t('common.loading')}...
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            <div className="dashboard-container">
                <PageHeader title={cardId ? t('cardCreate.editTitle') : t('cardCreate.title')} />
                <div className="dashboard-content">
                    <div className="dashboard-box">
                        <Form
                            onSubmit={handleSubmit}
                            onCancel={() => navigate(`/box/${boxId}`)}
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
        </DashboardContainer>
    );
}

export default CardCreate; 